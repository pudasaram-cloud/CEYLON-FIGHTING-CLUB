import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBhMS-OjZBgHRR5cXNHD_0Kne2vOQTtUT4",
  authDomain: "ceylon-fighting-club.firebaseapp.com",
  projectId: "ceylon-fighting-club",
  storageBucket: "ceylon-fighting-club.firebasestorage.app",
  messagingSenderId: "803556380178",
  appId: "1:803556380178:web:47f82b9c3f4cc1e93c52cb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function wipeAll() {
  console.log('Connecting to Firebase Firestore to wipe old data...');

  const collections = ['members', 'events', 'activities'];

  for (const col of collections) {
    const snap = await getDocs(collection(db, col));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✓ Deleted ${snap.size} documents from collection: "${col}"`);
    } else {
      console.log(`Collection "${col}" is already empty.`);
    }
  }

  console.log('\nAll old data has been completely cleared from Firestore!');
  console.log('You can now start registering fighters starting from ID: CFC-0001 (01)');
  process.exit(0);
}

wipeAll().catch((err) => {
  console.error('Error wiping Firestore:', err);
  process.exit(1);
});
