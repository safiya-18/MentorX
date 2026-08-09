import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';
import { subscribeToDocument, setUserDataDocument } from '../services/firestoreService';

export function useFirestoreSingleton(localKey, docName, initialValue) {
  const [localValue, setLocalValue] = useLocalStorage(localKey, initialValue);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToDocument(currentUser.uid, docName, (data) => {
      if (data) {
        // Remove id from data if it exists so it matches local structure
        delete data.id;
        setLocalValue(data);
      }
    });

    return () => unsubscribe();
  }, [currentUser, docName, setLocalValue]);

  const setValue = async (newValue) => {
    // Update local immediately for snappy UI
    const valueToStore = newValue instanceof Function ? newValue(localValue) : newValue;
    setLocalValue(valueToStore);
    
    // Sync to Firestore in background
    if (currentUser) {
      try {
        await setUserDataDocument(currentUser.uid, docName, valueToStore);
      } catch (error) {
        console.error(`Error syncing ${docName} to Firestore:`, error);
      }
    }
  };

  return [localValue, setValue];
}
