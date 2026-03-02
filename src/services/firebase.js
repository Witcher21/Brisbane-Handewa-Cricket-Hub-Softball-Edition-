/**
 * src/services/firebase.js
 * ────────────────────────
 * Firebase initialization — Firestore (live data) + Authentication (users)
 * Instagram/Facebook grade persistent auth using Firebase Auth.
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'

// ── Firebase Config ───────────────────────────────────────────────
const firebaseConfig = {
  apiKey: 'AIzaSyDJpTeZhOAxFnVXgpxiWoTI2Lh5z6vn_bo',
  authDomain: 'brisbane-handewa-cricket-hub.firebaseapp.com',
  projectId: 'brisbane-handewa-cricket-hub',
  storageBucket: 'brisbane-handewa-cricket-hub.firebasestorage.app',
  messagingSenderId: '1089761741785',
  appId: '1:1089761741785:web:230bffd4e049975a9ca7c8',
  measurementId: 'G-3RTB6XWC6L',
}

// ── Initialize ────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const firebaseConfigured = true

// ── Auth Functions ────────────────────────────────────────────────

/**
 * Register a new user with username + password.
 * Firebase uses email format. We store username as displayName.
 * Returns the Firebase user object on success.
 */
export async function firebaseSignUp(username, password) {
  // Use username@cricketapp.local as internal email format
  const email = `${username.toLowerCase()}@cricketapp.local`
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  // Save displayName (username) on the Firebase user profile
  await updateProfile(credential.user, { displayName: username })
  return credential.user
}

/**
 * Sign in an existing user with username + password.
 * Returns the Firebase user object on success.
 */
export async function firebaseSignIn(username, password) {
  const email = `${username.toLowerCase()}@cricketapp.local`
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

/**
 * Sign out the current user.
 */
export async function firebaseLogout() {
  await signOut(auth)
}

/**
 * Listen to auth state changes (like Instagram - keeps user logged in).
 * Calls callback(user) whenever authentication state changes.
 * user is null when logged out, Firebase user object when logged in.
 * Returns an unsubscribe function.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

// ── Firestore Game Data Functions ─────────────────────────────────
const DATA_DOC = 'cricket-hub/app-data'

export async function pushToFirestore(state) {
  if (!db) return
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

export async function pullFromFirestore() {
  if (!db) return null
  try {
    const [col, docId] = DATA_DOC.split('/')
    const snap = await getDoc(doc(db, col, docId))
    return snap.exists() ? snap.data() : null
  } catch (err) {
    console.warn('[Firebase] pull failed:', err.message)
    return null
  }
}

export function subscribeFirestore(onData) {
  if (!db) return () => {}
  const [col, docId] = DATA_DOC.split('/')
  return onSnapshot(doc(db, col, docId), (snap) => {
    if (snap.exists()) onData(snap.data())
  })
}
