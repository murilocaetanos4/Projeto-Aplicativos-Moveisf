import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth"; 
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from "firebase/firestore";

// Configurações do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyForGameboxdProject12345",
  authDomain: "gameboxd-app.firebaseapp.com",
  projectId: "gameboxd-app",
  storageBucket: "gameboxd-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Inicializa o app e os serviços
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Re-exporta funções do CRUD e Auth
export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where 
};