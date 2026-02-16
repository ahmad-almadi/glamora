// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDatabase, ref, push, onValue, update, remove } from "firebase/database";

// Your Firebase config (تقدر تحصل عليه من Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyC9btXnlWC6mEKXjJRMGiM3Wv_eljg939w",
  authDomain: "glamora-ef159.firebaseapp.com",
  databaseURL: "https://glamora-ef159-default-rtdb.firebaseio.com",
  projectId: "glamora-ef159",
  storageBucket: "glamora-ef159.firebasestorage.app",
  messagingSenderId: "685313865322",
  appId: "1:685313865322:web:2fddfade20538d8c3ebc13",
  measurementId: "G-S63208SHWJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app); // <-- Realtime Database

export { auth, provider, signInWithPopup, db, ref, push, onValue, update, remove };
