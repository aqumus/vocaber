import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAt4M4KvIeYUcanVFwELN--xVDildJcoYg",
  authDomain: "vocaber-efa82.firebaseapp.com",
  projectId: "vocaber-efa82",
  storageBucket: "vocaber-efa82.firebasestorage.app",
  messagingSenderId: "1048626190521",
  appId: "1:1048626190521:web:541d77691475d052c5e368"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// if (typeof window !== 'undefined') {
//   // Initialize Firebase Analytics here
//   const analytics = getAnalytics(app);
// }

// Get Firestore instance
const db: Firestore = getFirestore(app);

export { db };