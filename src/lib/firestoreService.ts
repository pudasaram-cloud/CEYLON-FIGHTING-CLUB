import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Member, ActivityLog, ClubEvent } from '@/types';
import { INITIAL_MEMBERS, INITIAL_ACTIVITIES, INITIAL_EVENTS } from '@/data/initialData';

const MEMBERS_COLLECTION = 'members';
const ACTIVITIES_COLLECTION = 'activities';
const EVENTS_COLLECTION = 'events';

// Real-time listener for Members
export function subscribeToMembers(callback: (members: Member[]) => void) {
  try {
    const q = query(collection(db, MEMBERS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const membersList: Member[] = [];
          snapshot.forEach((docSnap) => {
            membersList.push(docSnap.data() as Member);
          });
          callback(membersList);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.warn('Firestore members subscription notice:', error);
      }
    );
  } catch (err) {
    console.warn('Firestore subscription unavailable:', err);
    return () => {};
  }
}

// Real-time listener for Events
export function subscribeToEvents(callback: (events: ClubEvent[]) => void) {
  try {
    const q = query(collection(db, EVENTS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const eventsList: ClubEvent[] = [];
          snapshot.forEach((docSnap) => {
            eventsList.push(docSnap.data() as ClubEvent);
          });
          callback(eventsList);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.warn('Firestore events subscription notice:', error);
      }
    );
  } catch (err) {
    console.warn('Firestore events subscription error:', err);
    return () => {};
  }
}

// Real-time listener for Activities
export function subscribeToActivities(callback: (activities: ActivityLog[]) => void) {
  try {
    const q = query(collection(db, ACTIVITIES_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const actList: ActivityLog[] = [];
          snapshot.forEach((docSnap) => {
            actList.push(docSnap.data() as ActivityLog);
          });
          actList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          callback(actList);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.warn('Firestore activities subscription notice:', error);
      }
    );
  } catch (err) {
    console.warn('Firestore activities subscription error:', err);
    return () => {};
  }
}

// Add or Update a Member in Firestore
export async function saveMemberToFirestore(member: Member): Promise<void> {
  try {
    const docRef = doc(db, MEMBERS_COLLECTION, member.id);
    await setDoc(docRef, member, { merge: true });
  } catch (err) {
    console.error('Error saving member to Firestore:', err);
    throw err;
  }
}

// Update Member Partial
export async function updateMemberInFirestore(id: string, updates: Partial<Member>): Promise<void> {
  try {
    const docRef = doc(db, MEMBERS_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (err) {
    console.error('Error updating member in Firestore:', err);
    throw err;
  }
}

// Delete Member from Firestore
export async function deleteMemberFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, MEMBERS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting member from Firestore:', err);
    throw err;
  }
}

// Add Event to Firestore
export async function saveEventToFirestore(event: ClubEvent): Promise<void> {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, event.id);
    await setDoc(docRef, event, { merge: true });
  } catch (err) {
    console.error('Error saving event to Firestore:', err);
    throw err;
  }
}

// Delete Event from Firestore
export async function deleteEventFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting event from Firestore:', err);
    throw err;
  }
}

// Add Activity to Firestore
export async function saveActivityToFirestore(activity: ActivityLog): Promise<void> {
  try {
    const docRef = doc(db, ACTIVITIES_COLLECTION, activity.id);
    await setDoc(docRef, activity, { merge: true });
  } catch (err) {
    console.error('Error saving activity to Firestore:', err);
  }
}

// Seed initial demo data into Firestore if empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const membersSnap = await getDocs(collection(db, MEMBERS_COLLECTION));
    if (membersSnap.empty) {
      const batch = writeBatch(db);
      for (const m of INITIAL_MEMBERS) {
        batch.set(doc(db, MEMBERS_COLLECTION, m.id), m);
      }
      for (const e of INITIAL_EVENTS) {
        batch.set(doc(db, EVENTS_COLLECTION, e.id), e);
      }
      for (const a of INITIAL_ACTIVITIES) {
        batch.set(doc(db, ACTIVITIES_COLLECTION, a.id), a);
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore auto-seed notice:', err);
  }
}

// Reset Firestore Database to Default Initial Data
export async function resetFirestoreDatabase(): Promise<void> {
  try {
    const batch = writeBatch(db);

    const [mSnap, eSnap, aSnap] = await Promise.all([
      getDocs(collection(db, MEMBERS_COLLECTION)),
      getDocs(collection(db, EVENTS_COLLECTION)),
      getDocs(collection(db, ACTIVITIES_COLLECTION)),
    ]);

    mSnap.forEach((d) => batch.delete(d.ref));
    eSnap.forEach((d) => batch.delete(d.ref));
    aSnap.forEach((d) => batch.delete(d.ref));

    for (const m of INITIAL_MEMBERS) {
      batch.set(doc(db, MEMBERS_COLLECTION, m.id), m);
    }
    for (const e of INITIAL_EVENTS) {
      batch.set(doc(db, EVENTS_COLLECTION, e.id), e);
    }
    for (const a of INITIAL_ACTIVITIES) {
      batch.set(doc(db, ACTIVITIES_COLLECTION, a.id), a);
    }

    await batch.commit();
  } catch (err) {
    console.error('Error resetting Firestore:', err);
  }
}

// Clear all members from Firestore
export async function clearAllMembersFromFirestore(): Promise<void> {
  try {
    const mSnap = await getDocs(collection(db, MEMBERS_COLLECTION));
    const batch = writeBatch(db);
    mSnap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.error('Error clearing members from Firestore:', err);
  }
}
