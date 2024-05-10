// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBI8N9kj_lNnasJ4PqMkQCdw5CqSHq0pbU",
  authDomain: "snap360-appointments.firebaseapp.com",
  projectId: "snap360-appointments",
  storageBucket: "snap360-appointments.appspot.com",
  messagingSenderId: "195335324750",
  appId: "1:195335324750:web:96a6eea4e7fb0037942f1f",
  measurementId: "G-26952NC6LL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth}
//export getFirestore = firebase.getFirestore();


