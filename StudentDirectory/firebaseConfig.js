import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUvCbIHOGv9Cic2UwU9YXL1CQs4SqxNfs",
  authDomain: "student-directory-a705f.firebaseapp.com",
  projectId: "student-directory-a705f",
  storageBucket: "student-directory-a705f.firebasestorage.app",
  messagingSenderId: "283404273534",
  appId: "1:283404273534:web:a1ccb9aa5655956181552f",
  measurementId: "G-0XZ7SNG70Q"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);