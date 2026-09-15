import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { Member, ActivityLog, ClubEvent, FightMatch, FightBet } from '@/types';
import { INITIAL_MEMBERS, INITIAL_ACTIVITIES, INITIAL_EVENTS, INITIAL_MATCHES, INITIAL_BETS } from '@/data/initialData';

const MEMBERS_COLLECTION = 'members';
const ACTIVITIES_COLLECTION = 'activities';
const EVENTS_COLLECTION = 'events';
const MATCHES_COLLECTION = 'matches';
const BETS_COLLECTION = 'bets';

// Deep clean object to remove any undefined fields before writing to Firestore
function cleanObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanObject) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanObject(value);
      }
    }
    return cleaned;
  }
  return obj;
}

// Real-time listener for Members
export function subscribeToMembers(callback: (members: Member[]) => void) {
  try {
    const q = query(collection(db, MEMBERS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const membersList: Member[] = [];
        snapshot.forEach((docSnap) => {
          membersList.push(docSnap.data() as Member);
        });
        callback(membersList);
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
        const eventsList: ClubEvent[] = [];
        snapshot.forEach((docSnap) => {
          eventsList.push(docSnap.data() as ClubEvent);
        });
        callback(eventsList);
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
        const actList: ActivityLog[] = [];
        snapshot.forEach((docSnap) => {
          actList.push(docSnap.data() as ActivityLog);
        });
        actList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        callback(actList);
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

// Real-time listener for Matches
export function subscribeToMatches(callback: (matches: FightMatch[]) => void) {
  try {
    const q = query(collection(db, MATCHES_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const matchesList: FightMatch[] = [];
        snapshot.forEach((docSnap) => {
          matchesList.push(docSnap.data() as FightMatch);
        });
        matchesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(matchesList);
      },
      (error) => {
        console.warn('Firestore matches subscription notice:', error);
      }
    );
  } catch (err) {
    console.warn('Firestore matches subscription unavailable:', err);
    return () => {};
  }
}

// Real-time listener for Bets
export function subscribeToBets(callback: (bets: FightBet[]) => void) {
  try {
    const q = query(collection(db, BETS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const betsList: FightBet[] = [];
        snapshot.forEach((docSnap) => {
          betsList.push(docSnap.data() as FightBet);
        });
        betsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        callback(betsList);
      },
      (error) => {
        console.warn('Firestore bets subscription notice:', error);
      }
    );
  } catch (err) {
    console.warn('Firestore bets subscription unavailable:', err);
    return () => {};
  }
}

// Add or Update a Member in Firestore
export async function saveMemberToFirestore(member: Member): Promise<void> {
  try {
    const cleaned = cleanObject(member);
    const docRef = doc(db, MEMBERS_COLLECTION, member.id);
    await setDoc(docRef, cleaned, { merge: true });
    console.log(`[Firestore] Member ${member.id} (${member.fullName}) successfully saved.`);
  } catch (err) {
    console.error('[Firestore Error] Failed to save member:', err);
    throw err;
  }
}

// Update Member Partial
export async function updateMemberInFirestore(id: string, updates: Partial<Member>): Promise<void> {
  try {
    const cleaned = cleanObject(updates);
    const docRef = doc(db, MEMBERS_COLLECTION, id);
    await updateDoc(docRef, cleaned);
    console.log(`[Firestore] Member ${id} successfully updated.`);
  } catch (err) {
    console.error('[Firestore Error] Failed to update member:', err);
    throw err;
  }
}

// Delete Member from Firestore
export async function deleteMemberFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, MEMBERS_COLLECTION, id);
    await deleteDoc(docRef);
    console.log(`[Firestore] Member ${id} successfully deleted.`);
  } catch (err) {
    console.error('[Firestore Error] Failed to delete member:', err);
    throw err;
  }
}

// Add Match to Firestore
export async function saveMatchToFirestore(match: FightMatch): Promise<void> {
  try {
    const cleaned = cleanObject(match);
    const docRef = doc(db, MATCHES_COLLECTION, match.id);
    await setDoc(docRef, cleaned, { merge: true });
    console.log(`[Firestore] Match ${match.id} (${match.title}) saved.`);
  } catch (err) {
    console.error('[Firestore Error] Failed to save match:', err);
    throw err;
  }
}

// Update Match in Firestore
export async function updateMatchInFirestore(id: string, updates: Partial<FightMatch>): Promise<void> {
  try {
    const cleaned = cleanObject(updates);
    const docRef = doc(db, MATCHES_COLLECTION, id);
    await updateDoc(docRef, cleaned);
    console.log(`[Firestore] Match ${id} updated.`);
  } catch (err) {
    console.error('[Firestore Error] Failed to update match:', err);
    throw err;
  }
}

// Delete Match and its associated Bets from Firestore
export async function deleteMatchFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, MATCHES_COLLECTION, id);
    await deleteDoc(docRef);

    // Also delete any bets for this match
    try {
      const betsSnap = await getDocs(query(collection(db, BETS_COLLECTION), where('matchId', '==', id)));
      const batch = writeBatch(db);
      betsSnap.forEach((bDoc) => batch.delete(bDoc.ref));
      await batch.commit();
    } catch {}

    console.log(`[Firestore] Match ${id} deleted.`);
  } catch (err) {
    console.error('[Firestore Error] Failed to delete match:', err);
    throw err;
  }
}

// Save Bet to Firestore
export async function saveBetToFirestore(bet: FightBet): Promise<void> {
  try {
    const cleaned = cleanObject(bet);
    const docRef = doc(db, BETS_COLLECTION, bet.id);
    await setDoc(docRef, cleaned, { merge: true });
    console.log(`[Firestore] Bet ${bet.id} by ${bet.betterName} ($${bet.amount}) saved.`);
  } catch (err) {
    console.error('[Firestore Error] Failed to save bet:', err);
    throw err;
  }
}

// Delete Bet from Firestore
export async function deleteBetFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, BETS_COLLECTION, id);
    await deleteDoc(docRef);
    console.log(`[Firestore] Bet ${id} deleted.`);
  } catch (err) {
    console.error('[Firestore Error] Failed to delete bet:', err);
    throw err;
  }
}

// Add Event to Firestore
export async function saveEventToFirestore(event: ClubEvent): Promise<void> {
  try {
    const cleaned = cleanObject(event);
    const docRef = doc(db, EVENTS_COLLECTION, event.id);
    await setDoc(docRef, cleaned, { merge: true });
    console.log(`[Firestore] Event ${event.id} saved.`);
  } catch (err) {
    console.error('[Firestore Error] Failed to save event:', err);
    throw err;
  }
}

// Delete Event from Firestore
export async function deleteEventFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await deleteDoc(docRef);
    console.log(`[Firestore] Event ${id} deleted.`);
  } catch (err) {
    console.error('[Firestore Error] Failed to delete event:', err);
    throw err;
  }
}

// Add Activity to Firestore
export async function saveActivityToFirestore(activity: ActivityLog): Promise<void> {
  try {
    const cleaned = cleanObject(activity);
    const docRef = doc(db, ACTIVITIES_COLLECTION, activity.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.error('[Firestore Error] Failed to save activity:', err);
  }
}

// Seed initial demo data into Firestore if empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const membersSnap = await getDocs(collection(db, MEMBERS_COLLECTION));
    if (membersSnap.empty && INITIAL_MEMBERS.length > 0) {
      const batch = writeBatch(db);
      for (const m of INITIAL_MEMBERS) {
        batch.set(doc(db, MEMBERS_COLLECTION, m.id), cleanObject(m));
      }
      for (const e of INITIAL_EVENTS) {
        batch.set(doc(db, EVENTS_COLLECTION, e.id), cleanObject(e));
      }
      for (const a of INITIAL_ACTIVITIES) {
        batch.set(doc(db, ACTIVITIES_COLLECTION, a.id), cleanObject(a));
      }
      for (const mat of INITIAL_MATCHES) {
        batch.set(doc(db, MATCHES_COLLECTION, mat.id), cleanObject(mat));
      }
      for (const b of INITIAL_BETS) {
        batch.set(doc(db, BETS_COLLECTION, b.id), cleanObject(b));
      }
      await batch.commit();
      console.log('[Firestore] Seeded initial data.');
    }
  } catch (err) {
    console.warn('[Firestore Notice] Auto-seed check:', err);
  }
}

// Reset Firestore Database to Default Initial Data
export async function resetFirestoreDatabase(): Promise<void> {
  try {
    const batch = writeBatch(db);

    const [mSnap, eSnap, aSnap, matSnap, bSnap] = await Promise.all([
      getDocs(collection(db, MEMBERS_COLLECTION)),
      getDocs(collection(db, EVENTS_COLLECTION)),
      getDocs(collection(db, ACTIVITIES_COLLECTION)),
      getDocs(collection(db, MATCHES_COLLECTION)),
      getDocs(collection(db, BETS_COLLECTION)),
    ]);

    mSnap.forEach((d) => batch.delete(d.ref));
    eSnap.forEach((d) => batch.delete(d.ref));
    aSnap.forEach((d) => batch.delete(d.ref));
    matSnap.forEach((d) => batch.delete(d.ref));
    bSnap.forEach((d) => batch.delete(d.ref));

    for (const m of INITIAL_MEMBERS) {
      batch.set(doc(db, MEMBERS_COLLECTION, m.id), cleanObject(m));
    }
    for (const e of INITIAL_EVENTS) {
      batch.set(doc(db, EVENTS_COLLECTION, e.id), cleanObject(e));
    }
    for (const a of INITIAL_ACTIVITIES) {
      batch.set(doc(db, ACTIVITIES_COLLECTION, a.id), cleanObject(a));
    }
    for (const mat of INITIAL_MATCHES) {
      batch.set(doc(db, MATCHES_COLLECTION, mat.id), cleanObject(mat));
    }
    for (const b of INITIAL_BETS) {
      batch.set(doc(db, BETS_COLLECTION, b.id), cleanObject(b));
    }

    await batch.commit();
    console.log('[Firestore] Database reset to initial state.');
  } catch (err) {
    console.error('[Firestore Error] Failed resetting database:', err);
  }
}

// Clear all members from Firestore
export async function clearAllMembersFromFirestore(): Promise<void> {
  try {
    const mSnap = await getDocs(collection(db, MEMBERS_COLLECTION));
    const batch = writeBatch(db);
    mSnap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    console.log('[Firestore] All members cleared.');
  } catch (err) {
    console.error('[Firestore Error] Failed clearing members:', err);
  }
}

