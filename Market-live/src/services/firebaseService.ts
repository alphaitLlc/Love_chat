import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import {
  getMessaging,
  getToken,
  onMessage
} from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mock-auth-domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mock-storage-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'mock-messaging-sender-id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'mock-app-id'
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create a mock app for development
  app = {
    name: 'mock-app',
    options: firebaseConfig,
    automaticDataCollectionEnabled: false
  };
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let messaging;

// Initialize messaging only in browser environment and if supported
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Firebase messaging not supported:', error);
  }
}

export const firebaseService = {
  // Auth methods
  auth: {
    signIn: async (email: string, password: string) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error) {
        console.error('Firebase sign in error:', error);
        throw error;
      }
    },
    
    signUp: async (email: string, password: string, displayName: string) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        return userCredential.user;
      } catch (error) {
        console.error('Firebase sign up error:', error);
        throw error;
      }
    },
    
    signOut: async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Firebase sign out error:', error);
        throw error;
      }
    },
    
    resetPassword: async (email: string) => {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error) {
        console.error('Firebase reset password error:', error);
        throw error;
      }
    },
    
    getCurrentUser: () => {
      return auth.currentUser;
    },
    
    onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
      return auth.onAuthStateChanged(callback);
    }
  },
  
  // Firestore methods
  firestore: {
    createDocument: async (collectionName: string, id: string, data: any) => {
      try {
        await setDoc(doc(db, collectionName, id), data);
      } catch (error) {
        console.error('Firestore create document error:', error);
        throw error;
      }
    },
    
    getDocument: async (collectionName: string, id: string) => {
      try {
        const docSnap = await getDoc(doc(db, collectionName, id));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          return null;
        }
      } catch (error) {
        console.error('Firestore get document error:', error);
        throw error;
      }
    },
    
    updateDocument: async (collectionName: string, id: string, data: any) => {
      try {
        await updateDoc(doc(db, collectionName, id), data);
      } catch (error) {
        console.error('Firestore update document error:', error);
        throw error;
      }
    },
    
    queryDocuments: async (collectionName: string, field: string, operator: any, value: any) => {
      try {
        const q = query(collection(db, collectionName), where(field, operator, value));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Firestore query documents error:', error);
        throw error;
      }
    }
  },
  
  // Storage methods
  storage: {
    uploadFile: async (path: string, file: File) => {
      try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error('Firebase storage upload error:', error);
        throw error;
      }
    },
    
    getFileUrl: async (path: string) => {
      try {
        const storageRef = ref(storage, path);
        return await getDownloadURL(storageRef);
      } catch (error) {
        console.error('Firebase storage get URL error:', error);
        throw error;
      }
    }
  },
  
  // Messaging methods
  messaging: {
    getToken: async (vapidKey: string) => {
      if (!messaging) {
        console.error('Firebase messaging not initialized');
        return null;
      }
      
      try {
        return await getToken(messaging, { vapidKey });
      } catch (error) {
        console.error('Firebase messaging get token error:', error);
        return null;
      }
    },
    
    onMessage: (callback: (payload: any) => void) => {
      if (!messaging) {
        console.error('Firebase messaging not initialized');
        return () => {};
      }
      
      return onMessage(messaging, callback);
    }
  }
};

export default firebaseService;