// ══════════════════════════════════════════════════════════════
// HOW TO SET UP YOUR FREE FIREBASE PROJECT (takes 3 minutes)
// ══════════════════════════════════════════════════════════════
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" → give it a name (e.g. "cricket-hub")
// 3. Disable Google Analytics (optional) → Create project
// 4. Click "Web" icon (</>) → Register app → Give it a nickname
// 5. Copy the firebaseConfig object and paste it below
// 6. In Firebase Console: Build → Firestore Database → Create Database
//    → Start in TEST MODE → Choose your nearest region → Done
// 7. Your app is now live worldwide! Anyone opening the URL sees live data.
// ══════════════════════════════════════════════════════════════

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'

// ▼▼▼ PASTE YOUR FIREBASE CONFIG HERE ▼▼▼
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
}
// ▲▲▲ PASTE YOUR FIREBASE CONFIG HERE ▲▲▲

// Check if Firebase is configured
export const firebaseConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY'

let app = null
let db  = null

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig)
  db  = getFirestore(app)
}

export { db }

// ── The single Firestore document that holds ALL app data ──
const DATA_DOC = 'cricket-hub/app-data'

/**
 * Push the full store state to Firestore.
 * Called every time the Pinia store mutates.
 */
export async function pushToFirestore(state) {
  if (!firebaseConfigured || !db) return
  try {
    const [col, docId] = DATA_DOC.split('/')
    await setDoc(doc(db, col, docId), {
      players: state.players,
      teams: state.teams,
      matches: state.matches,
      nextPlayerId: state.nextPlayerId,
      nextTeamId: state.nextTeamId,
      nextMatchId: state.nextMatchId,
      updatedAt: Date.now(),
    })
  } catch (err) {
    console.warn('[Firebase] push failed:', err.message)
  }
}

/**
 * Pull the full state from Firestore once (on boot).
 * Returns null if not configured or no data yet.
 */
export async function pullFromFirestore() {
  if (!firebaseConfigured || !db) return null
  try {
    const [col, docId] = DATA_DOC.split('/')
    const snap = await getDoc(doc(db, col, docId))
    return snap.exists() ? snap.data() : null
  } catch (err) {
    console.warn('[Firebase] pull failed:', err.message)
    return null
  }
}

/**
 * Subscribe to real-time updates from Firestore.
 * onData(data) is called instantly whenever another device changes data.
 * Returns an unsubscribe function.
 */
export function subscribeFirestore(onData) {
  if (!firebaseConfigured || !db) return () => {}
  const [col, docId] = DATA_DOC.split('/')
  return onSnapshot(doc(db, col, docId), (snap) => {
    if (snap.exists()) onData(snap.data())
  })
}
