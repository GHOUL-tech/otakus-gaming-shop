import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { Booking, Game, GamePackage, ActiveSession } from '../types';
import { DEFAULT_GAMES, DEFAULT_PACKAGES } from '../data/defaultData';

const firebaseConfig = {
  projectId: "ai-studio-applet-webapp-8c6f3",
  appId: "1:702039312504:web:e084ee54fff8605abdc58d",
  apiKey: "AIzaSyDbKphV8oMQOPC4b2b0cNB8C_INgvddsRk",
  authDomain: "ai-studio-applet-webapp-8c6f3.firebaseapp.com",
  storageBucket: "ai-studio-applet-webapp-8c6f3.firebasestorage.app",
  messagingSenderId: "702039312504"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the dedicated Database ID
export const db = getFirestore(app, "ai-studio-otakusgaminghave-1373fad9-15c0-401a-9b0f-d26a52da2f18");

// Collections
const BOOKINGS_COL = 'bookings';
const GAMES_COL = 'games';
const PACKAGES_COL = 'packages';
const SESSIONS_COL = 'activeSessions';

// --- Mandatory Firestore Error Handling Setup ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Seeding Helpers (Run once if collections are empty) ---
export async function seedInitialDataIfEmpty() {
  try {
    // 1. Seed Games
    let gamesSnap;
    try {
      gamesSnap = await getDocs(collection(db, GAMES_COL));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, GAMES_COL);
    }

    if (gamesSnap.empty) {
      console.log('Seeding initial games to Firestore...');
      for (const game of DEFAULT_GAMES) {
        try {
          await setDoc(doc(db, GAMES_COL, game.id), game);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `${GAMES_COL}/${game.id}`);
        }
      }
    }

    // 2. Seed Packages
    let packagesSnap;
    try {
      packagesSnap = await getDocs(collection(db, PACKAGES_COL));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, PACKAGES_COL);
    }

    if (packagesSnap.empty) {
      console.log('Seeding initial packages to Firestore...');
      for (const pkg of DEFAULT_PACKAGES) {
        try {
          await setDoc(doc(db, PACKAGES_COL, pkg.id), pkg);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `${PACKAGES_COL}/${pkg.id}`);
        }
      }
    }

    // 3. Seed Bookings
    let bookingsSnap;
    try {
      bookingsSnap = await getDocs(collection(db, BOOKINGS_COL));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, BOOKINGS_COL);
    }

    if (bookingsSnap.empty) {
      console.log('Seeding initial bookings to Firestore...');
      const initialBookings: Booking[] = [
        {
          id: 'seed-1',
          name: 'Shakil Khan',
          phone: '01712345678',
          system: 'PC',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          duration: 2,
          amount: 200,
          status: 'approved',
          code: '#PC-8821'
        },
        {
          id: 'seed-2',
          name: 'Nayeem Hasan',
          phone: '01899112233',
          system: 'PSP',
          date: new Date().toISOString().split('T')[0],
          time: '16:30',
          duration: 1,
          amount: 60,
          status: 'approved',
          code: '#PSP-4412'
        }
      ];
      for (const b of initialBookings) {
        try {
          await setDoc(doc(db, BOOKINGS_COL, b.id), b);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `${BOOKINGS_COL}/${b.id}`);
        }
      }
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// --- Real-time Subscriptions ---

export function subscribeBookings(callback: (bookings: Booking[]) => void) {
  const colRef = collection(db, BOOKINGS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: Booking[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Booking);
    });
    list.sort((a, b) => b.id.localeCompare(a.id));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, BOOKINGS_COL);
  });
}

export function subscribeGames(callback: (games: Game[]) => void) {
  const colRef = collection(db, GAMES_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: Game[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Game);
    });
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, GAMES_COL);
  });
}

export function subscribePackages(callback: (packages: GamePackage[]) => void) {
  const colRef = collection(db, PACKAGES_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: GamePackage[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as GamePackage);
    });
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, PACKAGES_COL);
  });
}

export function subscribeActiveSessions(callback: (sessions: ActiveSession[]) => void) {
  const colRef = collection(db, SESSIONS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: ActiveSession[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as ActiveSession);
    });
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, SESSIONS_COL);
  });
}

// --- Mutation Handlers ---

export async function fbAddBooking(booking: Booking) {
  try {
    await setDoc(doc(db, BOOKINGS_COL, booking.id), booking);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${BOOKINGS_COL}/${booking.id}`);
  }
}

export async function fbUpdateBookingStatus(id: string, status: 'approved' | 'cancelled') {
  try {
    const snapRef = doc(db, BOOKINGS_COL, id);
    await setDoc(snapRef, { status }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${BOOKINGS_COL}/${id}`);
  }
}

export async function fbDeleteBooking(id: string) {
  try {
    await deleteDoc(doc(db, BOOKINGS_COL, id));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${BOOKINGS_COL}/${id}`);
  }
}

export async function fbAddGame(game: Game) {
  try {
    await setDoc(doc(db, GAMES_COL, game.id), game);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${GAMES_COL}/${game.id}`);
  }
}

export async function fbAddPackage(pkg: GamePackage) {
  try {
    await setDoc(doc(db, PACKAGES_COL, pkg.id), pkg);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${PACKAGES_COL}/${pkg.id}`);
  }
}

export async function fbDeletePackage(id: string) {
  try {
    await deleteDoc(doc(db, PACKAGES_COL, id));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${PACKAGES_COL}/${id}`);
  }
}

export async function fbSaveActiveSession(session: ActiveSession) {
  try {
    await setDoc(doc(db, SESSIONS_COL, session.id), session);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${SESSIONS_COL}/${session.id}`);
  }
}

export async function fbDeleteActiveSession(id: string) {
  try {
    await deleteDoc(doc(db, SESSIONS_COL, id));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${SESSIONS_COL}/${id}`);
  }
}

