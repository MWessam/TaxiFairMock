// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbper0-iKwOENPt0nI5ZyMt7AFmUyDs8M",
  authDomain: "taxifare-7fe53.firebaseapp.com",
  projectId: "taxifare-7fe53",
  storageBucket: "taxifare-7fe53.firebasestorage.app",
  messagingSenderId: "916645906844",
  appId: "1:916645906844:web:dfa3981f2cae5d1404a059",
  measurementId: "G-L16C58LBTF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);