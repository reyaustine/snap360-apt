// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
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
export const db = getFirestore(app);
export const storage = getStorage(app);
//export getFirestore = firebase.getFirestore();


