// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Cấu hình Firebase của bạn
const firebaseConfig = {
    apiKey: "AIzaSyBO5pXx4MsHUj535AjBnEv6fOHDF3vQt5g",
    authDomain: "quanlynhansu-4f6fd.firebaseapp.com",
    projectId: "quanlynhansu-4f6fd",
    storageBucket: "quanlynhansu-4f6fd.firebasestorage.app",
    messagingSenderId: "367687101857",
    appId: "1:367687101857:web:52a065c9796358f8356fe0",
    measurementId: "G-L5XQ99Z6F3"
  };

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Lấy Firestore instance
const db = getFirestore(app);

export { db };
