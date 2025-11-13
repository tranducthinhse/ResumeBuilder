// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC-Dx-8mTvewk186mad6AVj3hptIydpKP4",
  authDomain: "resumebuider-afeeb.firebaseapp.com",
  projectId: "resumebuider-afeeb",
  storageBucket: "resumebuider-afeeb.appspot.com", // ✅ Đúng rồi nè!
  messagingSenderId: "841933906949",
  appId: "1:841933906949:web:eeda7e948b013c70cfa86c",
  measurementId: "G-PGN99MBL8P"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
