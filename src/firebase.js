import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCQ0p5FVhr7CNFnqryCrOm9W-vdToQiXPM",
    authDomain: "my-shop-5e7e0.firebaseapp.com",
    projectId: "my-shop-5e7e0",
    storageBucket: "my-shop-5e7e0.firebasestorage.app",
    messagingSenderId: "675862469080",
    appId: "1:675862469080:web:48f9e1334a691448843aad",
    measurementId: "G-PDVCWCWVDS"
};

const app = initializeApp(firebaseConfig);

// Ye 2 lines sab se zaroori hain jahan hum db aur auth export kar rahe hain
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);