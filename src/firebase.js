// Firebase initialization
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyALc2RMzMt5jAUwV0NKVb-i7vEtdDuxLN8",
  authDomain: "ucc-node-react.firebaseapp.com",
  projectId: "ucc-node-react",
  storageBucket: "ucc-node-react.firebasestorage.app",
  messagingSenderId: "342956410857",
  appId: "1:342956410857:web:d878e5d812684745ffad78",
  measurementId: "G-Q918VZ6RG3"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
