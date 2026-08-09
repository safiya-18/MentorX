import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';
import { subscribeToCollection, addCollectionItem, updateCollectionItem, deleteCollectionItem } from '../services/firestoreService';

export function useFirestoreCollection(localKey, collectionName, initialValue) {
  const [localItems, setLocalItems] = useLocalStorage(localKey, initialValue);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Listen to real-time updates from Firestore
    const unsubscribe = subscribeToCollection(currentUser.uid, collectionName, (data) => {
      // Sort by createdAt if it exists so the order is stable
      const sortedData = data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB; // Older items first
      });
      setLocalItems(sortedData);
    });

    return () => unsubscribe();
  }, [currentUser, collectionName, setLocalItems]);

  const addItem = async (itemData) => {
    // Generate a temporary local ID for instant UI updates
    const tempId = 'temp_' + Date.now();
    const tempItem = { id: tempId, ...itemData };
    
    // Update local immediately
    setLocalItems(prev => [...prev, tempItem]);

    if (currentUser) {
      try {
        await addCollectionItem(currentUser.uid, collectionName, itemData);
        // The real-time listener will eventually overwrite the tempItem with the real Firestore doc
      } catch (error) {
        console.error(`Error adding to ${collectionName}:`, error);
        // Revert local optimistic update on failure
        setLocalItems(prev => prev.filter(item => item.id !== tempId));
      }
    }
    return tempId;
  };

  const updateItem = async (itemId, updatedData) => {
    // Update local immediately
    setLocalItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updatedData } : item));

    if (currentUser && !itemId.toString().startsWith('temp_')) {
      try {
        await updateCollectionItem(currentUser.uid, collectionName, itemId, updatedData);
      } catch (error) {
        console.error(`Error updating ${collectionName}:`, error);
      }
    }
  };

  const deleteItem = async (itemId) => {
    // Update local immediately
    setLocalItems(prev => prev.filter(item => item.id !== itemId));

    if (currentUser && !itemId.toString().startsWith('temp_')) {
      try {
        await deleteCollectionItem(currentUser.uid, collectionName, itemId);
      } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
      }
    }
  };

  // Helper to completely replace local state (e.g. for reordering)
  const replaceAll = (newItems) => {
      setLocalItems(newItems);
      // Depending on scale, replacing all in Firestore is complex.
      // Usually, you update each item's 'order' field.
  };

  return {
    items: localItems,
    addItem,
    updateItem,
    deleteItem,
    replaceAll
  };
}
