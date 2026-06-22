// firebase-config.js
//
// Firebase initialize karta hai - Auth aur Firestore dono ke liye.
// Ye config keys public-safe hain (browser mein expose hone ke liye
// hi banaye gaye hain), security Firestore Rules se hoti hai.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDPkW8UMjXb9nObi-gC6g_3yAgGhc1hjNE",
  authDomain: "jyotish-mitra.firebaseapp.com",
  projectId: "jyotish-mitra",
  storageBucket: "jyotish-mitra.firebasestorage.app",
  messagingSenderId: "418791027436",
  appId: "1:418791027436:web:91dc3cdb3809592075ebc9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
};
