// Placeholder for Firebase utilities
// IMPORTANT: This is a STUB file to resolve module errors.
// Actual Firebase functionality requires proper implementation and configuration.

import { OnlineGameState } from '../types';

// Define a simple Unsubscribe type, as it would come from 'firebase/firestore'
export type Unsubscribe = () => void;

const FIREBASE_CONFIGURED = false; // Set to true once Firebase is properly configured

console.warn(
  "FirebaseUtils: Firebase is not fully configured. Online functionality will be limited or non-operational. " +
  "Please implement and configure Firebase in 'utils/firebaseUtils.ts'."
);

export function isFirebaseConfigured(): boolean {
  if (!FIREBASE_CONFIGURED) {
    // console.warn("FirebaseUtils: isFirebaseConfigured() called, but Firebase is not set up.");
  }
  return FIREBASE_CONFIGURED;
}

export async function createGameInFirestore(gameId: string, initialHostState: OnlineGameState): Promise<void> {
  console.warn(`FirebaseUtils: STUB - createGameInFirestore called for gameId: ${gameId}`, initialHostState);
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase not configured. Cannot create game.");
  }
  // Placeholder: In a real implementation, this would interact with Firestore.
  // For now, we can simulate local storage or just log.
  // localStorage.setItem(`firebase_stub_game_${gameId}`, JSON.stringify(initialHostState));
  return Promise.resolve();
}

export async function getGameFromFirestore(gameId: string): Promise<OnlineGameState | null> {
  console.warn(`FirebaseUtils: STUB - getGameFromFirestore called for gameId: ${gameId}`);
  if (!isFirebaseConfigured()) {
    return null;
  }
  // Placeholder
  // const gameData = localStorage.getItem(`firebase_stub_game_${gameId}`);
  // return gameData ? JSON.parse(gameData) : null;
  return Promise.resolve(null); 
}

export async function updateGameStateInFirestore(gameId: string, updates: Partial<OnlineGameState>): Promise<void> {
  console.warn(`FirebaseUtils: STUB - updateGameStateInFirestore called for gameId: ${gameId}`, updates);
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase not configured. Cannot update game state.");
  }
  // Placeholder
  // const gameData = localStorage.getItem(`firebase_stub_game_${gameId}`);
  // if (gameData) {
  //   const existingState = JSON.parse(gameData);
  //   localStorage.setItem(`firebase_stub_game_${gameId}`, JSON.stringify({ ...existingState, ...updates }));
  // }
  return Promise.resolve();
}

export function listenToGameStateChanges(gameId: string, callback: (gameState: OnlineGameState | null) => void): Unsubscribe {
  console.warn(`FirebaseUtils: STUB - listenToGameStateChanges called for gameId: ${gameId}`);
  if (!isFirebaseConfigured()) {
    callback(null); // Indicate no game state if Firebase isn't up
    return () => {}; // Return a no-op unsubscribe function
  }
  // Placeholder: This would set up a Firestore listener.
  // For a stub, we can do nothing or simulate a one-time fetch.
  // getGameFromFirestore(gameId).then(callback);
  
  // Return a dummy unsubscribe function
  return () => {
    console.warn(`FirebaseUtils: STUB - Unsubscribe called for gameId: ${gameId}`);
  };
}

export async function deleteGameFromFirestore(gameId: string): Promise<void> {
  console.warn(`FirebaseUtils: STUB - deleteGameFromFirestore called for gameId: ${gameId}`);
  if (!isFirebaseConfigured()) {
    // Potentially throw an error or just log, depending on desired strictness for stubs
    // throw new Error("Firebase not configured. Cannot delete game.");
    return Promise.resolve();
  }
  // Placeholder
  // localStorage.removeItem(`firebase_stub_game_${gameId}`);
  return Promise.resolve();
}
