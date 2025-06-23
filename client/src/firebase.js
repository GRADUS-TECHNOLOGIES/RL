// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "mern-blog-f33a3.firebaseapp.com",
    projectId: "mern-blog-f33a3",
    storageBucket: "mern-blog-f33a3.firebasestorage.app",
    messagingSenderId: "846420661117",
    appId: "1:846420661117:web:9844e160765f6f40ccb214"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);