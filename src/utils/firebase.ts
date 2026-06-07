/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer
} from 'firebase/firestore';

// 1. Identify and list missing key environment variables
const envKeys = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingVars: string[] = [];
if (!envKeys.apiKey) missingVars.push('VITE_FIREBASE_API_KEY');
if (!envKeys.authDomain) missingVars.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!envKeys.projectId) missingVars.push('VITE_FIREBASE_PROJECT_ID');
if (!envKeys.storageBucket) missingVars.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!envKeys.messagingSenderId) missingVars.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
if (!envKeys.appId) missingVars.push('VITE_FIREBASE_APP_ID');

export const isFirebaseConfigIncomplete = missingVars.length > 0;
export const missingFirebaseVarsList = missingVars;

if (isFirebaseConfigIncomplete) {
  console.warn(`[Firebase Configuration Incomplete] A(s) seguinte(s) variável(is) está(ão) ausente(s): ${missingVars.join(', ')}`);
}

// 2. Build the config object with fallback to prevent build compilation/runtime crash
const firebaseConfig = {
  apiKey: envKeys.apiKey || '',
  authDomain: envKeys.authDomain || '',
  projectId: envKeys.projectId || '',
  storageBucket: envKeys.storageBucket || '',
  messagingSenderId: envKeys.messagingSenderId || '',
  appId: envKeys.appId || '',
};

// Initialize Firebase Core
const app = initializeApp(firebaseConfig);

// Keep the correct hardcoded firestoreDatabaseId from setup metadata or default database if incomplete
const firestoreDatabaseId = 'ai-studio-62cabf08-6153-404d-8139-2a8879a8a656';
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

// Map Firestore and Firebase Auth code to user friendly Portuguese messages
export function mapFirebaseError(error: any): string {
  const code = error?.code || error?.message || '';
  console.error("DEBUG - Original Firebase error:", error);

  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/operation-not-allowed':
      return 'O login por e-mail e senha não está ativado no Firebase. Vá em Firebase Console > Authentication > Sign-in method > Email/Password e clique em Enable.';
    case 'permission-denied':
      return 'Sem permissão para acessar estes dados. Verifique as regras do Firestore.';
    case 'unavailable':
      return 'Serviço temporariamente indisponível ou sem conexão.';
    case 'failed-precondition':
      return 'O Firestore precisa de configuração adicional.';
    default:
      if (typeof code === 'string' && code.includes('permission-denied')) {
        return 'Sem permissão para acessar estes dados. Verifique as regras do Firestore.';
      }
      return error?.message || 'Falha de comunicação ou conexão com os serviços Firebase.';
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Simple connection check
async function testConnection() {
  if (isFirebaseConfigIncomplete) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();
