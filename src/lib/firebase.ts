import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// Your provided Firebase web app configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa5BGNTWkxw17HrtGa1X5JRdVAM9xHMec",
  authDomain: "tailorflow-17625.firebaseapp.com",
  databaseURL: "https://tailorflow-17625-default-rtdb.firebaseio.com",
  projectId: "tailorflow-17625",
  storageBucket: "tailorflow-17625.firebasestorage.app",
  messagingSenderId: "995723418350",
  appId: "1:995723418350:web:67479b8961837ac9bbf1ff"
};

// Prevent duplicate initialization in dev HMR environment
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(firebaseApp);

// Enable robust, multi-tab offline cache persistence
export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut };
