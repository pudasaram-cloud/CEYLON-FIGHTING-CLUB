import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

const tigerKane = {
  id: 'CFC-1005',
  idNumber: '200012345678',
  fullName: 'Tiger Kane',
  age: 26,
  dateOfBirth: '2000-04-12',
  gender: 'Male',
  phoneNumber: '+94701234567',
  email: 'tiger.kane@ceylonfc.com',
  address: 'Colombo, Sri Lanka',
  weight: 77,
  height: 182,
  weightClass: 'Welterweight (71-77kg)',
  discipline: 'Muay Thai',
  skillLevel: 'Advanced',
  beltRank: 'Black Belt',
  registrationDate: '2026-09-11',
  registrationFee: 1500,
  paymentStatus: 'Paid',
  membershipStatus: 'Active',
  defaultAvatarType: 'male-vector',
  emergencyContact: {
    name: 'Kane Family',
    phone: '+94709876543',
    relationship: 'Parent',
  },
  attendanceCount: 1,
  sparringRecord: { wins: 6, losses: 0, draws: 0 },
};

async function run() {
  const docRef = doc(db, 'members', tigerKane.id);
  await setDoc(docRef, tigerKane, { merge: true });
  console.log(`✓ Added ${tigerKane.fullName} (${tigerKane.id}) to Firestore!`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Error adding Tiger Kane:', err);
  process.exit(1);
});
