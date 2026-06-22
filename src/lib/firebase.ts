import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your provided Firebase web app configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzm02B_6KaHll-aOtMARnW1vxkoRTgS5s",
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
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut };
