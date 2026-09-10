import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "ceylon-fighting-club",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testMembers = [
  {
    id: 'CFC-1001',
    idNumber: '200432201685',
    fullName: 'Benny Falcon',
    age: 24,
    dateOfBirth: '2002-05-15',
    gender: 'Male',
    phoneNumber: '+94701095008',
    email: 'mpudasara@gmail.com',
    address: 'Colombo, Sri Lanka',
    weight: 70,
    height: 175,
    weightClass: 'Lightweight (66-70kg)',
    discipline: 'MMA',
    skillLevel: 'Intermediate',
    beltRank: 'Blue Belt',
    registrationDate: '2026-09-10',
    registrationFee: 1500,
    paymentStatus: 'Paid',
    membershipStatus: 'Active',
    defaultAvatarType: 'male-vector',
    emergencyContact: {
      name: 'Family Contact',
      phone: '+94701095008',
      relationship: 'Parent',
    },
    attendanceCount: 1,
    sparringRecord: { wins: 3, losses: 0, draws: 0 },
  },
  {
    id: 'CFC-1002',
    idNumber: '199854201123',
    fullName: 'Kusal Perera',
    age: 27,
    dateOfBirth: '1999-03-20',
    gender: 'Male',
    phoneNumber: '+94771234567',
    email: 'kusal.p@ceylonfc.com',
    address: 'Kandy Road, Colombo 07',
    weight: 75,
    height: 180,
    weightClass: 'Welterweight (71-77kg)',
    discipline: 'Muay Thai',
    skillLevel: 'Advanced',
    beltRank: 'Brown Belt',
    registrationDate: '2026-09-11',
    registrationFee: 1500,
    paymentStatus: 'Paid',
    membershipStatus: 'Active',
    defaultAvatarType: 'male-vector',
    emergencyContact: {
      name: 'Chaminda Perera',
      phone: '+94777654321',
      relationship: 'Brother',
    },
    attendanceCount: 4,
    sparringRecord: { wins: 5, losses: 1, draws: 0 },
  },
  {
    id: 'CFC-1003',
    idNumber: '200167890123',
    fullName: 'Tharushi Silva',
    age: 23,
    dateOfBirth: '2003-08-14',
    gender: 'Female',
    phoneNumber: '+94719876543',
    email: 'tharushi.s@ceylonfc.com',
    address: 'Marine Drive, Bambalapitiya',
    weight: 57,
    height: 165,
    weightClass: 'Featherweight (57-61kg)',
    discipline: 'Boxing',
    skillLevel: 'Intermediate',
    beltRank: 'Green Belt',
    registrationDate: '2026-09-11',
    registrationFee: 1500,
    paymentStatus: 'Paid',
    membershipStatus: 'Active',
    defaultAvatarType: 'female-vector',
    emergencyContact: {
      name: 'Nirmala Silva',
      phone: '+94712223344',
      relationship: 'Mother',
    },
    attendanceCount: 2,
    sparringRecord: { wins: 2, losses: 0, draws: 0 },
  },
  {
    id: 'CFC-1004',
    idNumber: '199512345678',
    fullName: 'Dinesh Mendis',
    age: 29,
    dateOfBirth: '1997-11-05',
    gender: 'Male',
    phoneNumber: '+94765554433',
    email: 'dinesh.m@ceylonfc.com',
    address: 'Galle Road, Mount Lavinia',
    weight: 84,
    height: 183,
    weightClass: 'Middleweight (78-84kg)',
    discipline: 'Brazilian Jiu-Jitsu',
    skillLevel: 'Advanced',
    beltRank: 'Purple Belt',
    registrationDate: '2026-09-11',
    registrationFee: 1500,
    paymentStatus: 'Paid',
    membershipStatus: 'Active',
    defaultAvatarType: 'male-vector',
    emergencyContact: {
      name: 'Sunil Mendis',
      phone: '+94761112233',
      relationship: 'Father',
    },
    attendanceCount: 5,
    sparringRecord: { wins: 8, losses: 2, draws: 1 },
  },
];

async function seed() {
  console.log('Connecting to Firebase Firestore (ceylon-fighting-club)...');
  for (const member of testMembers) {
    const docRef = doc(db, 'members', member.id);
    await setDoc(docRef, member, { merge: true });
    console.log(`✓ Added Member to Firestore: ${member.id} - ${member.fullName} (${member.discipline})`);
  }
  console.log('\nAll test members successfully uploaded to Firestore!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error seeding Firestore:', err);
  process.exit(1);
});
