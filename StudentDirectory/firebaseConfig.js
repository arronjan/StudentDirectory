import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUvCbIHOGv9Cic2UwU9YXL1CQs4SqxNfs",
  authDomain: "student-directory-a705f.firebaseapp.com",
  projectId: "student-directory-a705f",
  storageBucket: "student-directory-a705f.firebasestorage.app",
  messagingSenderId: "283404273534",
  appId: "1:283404273534:web:a1ccb9aa5655956181552f",
  measurementId: "G-0XZ7SNG70Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database for your app to use
export const db = getFirestore(app);