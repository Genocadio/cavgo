// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {

    apiKey: "AIzaSyDT_kbU9Z8hAnu_WzM4XlqDRPa6bx2hLhY",
  
    authDomain: "cavgo-41791.firebaseapp.com",
  
    projectId: "cavgo-41791",
  
    storageBucket: "cavgo-41791.appspot.com",
  
    messagingSenderId: "1022086934727",
  
    appId: "1:1022086934727:web:60e9d0c3f2b8cf46b28ee2",
  
    measurementId: "G-02P0QDG2LM"
  
  };
  
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
