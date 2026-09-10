import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBhMS-OjZBgHRR5cXNHD_0Kne2vOQTtUT4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ceylon-fighting-club.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ceylon-fighting-club",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ceylon-fighting-club.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "803556380178",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:803556380178:web:47f82b9c3f4cc1e93c52cb",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0F2Y1TGZVX",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db, firebaseConfig };
