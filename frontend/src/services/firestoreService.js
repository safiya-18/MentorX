import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';


// Generic function to subscribe to a user subcollection
export const subscribeToCollection = (userId, collectionName, callback) => {
  if (!userId) return () => {};
  
  const colRef = collection(db, 'users', userId, collectionName);
  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  }, (error) => {
    console.error(`Error subscribing to ${collectionName}:`, error);
  });
  
  return unsubscribe;
};

// Generic function to subscribe to a single user document (like settings)
export const subscribeToDocument = (userId, docName, callback) => {
  if (!userId) return () => {};

  const docRef = doc(db, 'users', userId, 'userData', docName);
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to ${docName}:`, error);
  });

  return unsubscribe;
};

// --- COLLECTION CRUD (Tasks, Notes, StudySessions) ---

export const addCollectionItem = async (userId, collectionName, data) => {
  if (!userId) throw new Error('User not authenticated');
  const colRef = collection(db, 'users', userId, collectionName);
  return await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp()
  });
};

export const updateCollectionItem = async (userId, collectionName, itemId, data) => {
  if (!userId) throw new Error('User not authenticated');
  const docRef = doc(db, 'users', userId, collectionName, itemId);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteCollectionItem = async (userId, collectionName, itemId) => {
  if (!userId) throw new Error('User not authenticated');
  const docRef = doc(db, 'users', userId, collectionName, itemId);
  return await deleteDoc(docRef);
};


// --- SINGLETON CRUD (Settings, Achievements, DailyGoal) ---

export const setUserDataDocument = async (userId, docName, data) => {
  if (!userId) throw new Error('User not authenticated');
  const docRef = doc(db, 'users', userId, 'userData', docName);
  return await setDoc(docRef, data, { merge: true });
};

export const getUserDataDocument = async (userId, docName) => {
  if (!userId) throw new Error('User not authenticated');
  const docRef = doc(db, 'users', userId, 'userData', docName);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
};
