import { Candidate, CandidateStatus, CandidatePriority } from '../types';
import { db, COLLECTIONS } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_candidates_database_v1';

type CandidateListener = (candidates: Candidate[]) => void;
const listeners: Set<CandidateListener> = new Set();
let memoryCandidates: Candidate[] = [];
let isInitialized = false;

// Read local mirror first so UI is instant
function loadLocalMirror(): Candidate[] {
  try {
    const data = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!data) return [];
    const parsed: Candidate[] = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

memoryCandidates = loadLocalMirror();

// Real-time Firestore sync: STRICTLY READ-ONLY in onSnapshot to prevent cyclical loops
function initFirestoreSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  try {
    const colRef = collection(db, COLLECTIONS.CANDIDATES);
    onSnapshot(colRef, (snapshot) => {
      const remoteCandidates: Candidate[] = [];

      snapshot.forEach((d) => {
        remoteCandidates.push(d.data() as Candidate);
      });

      // Sort by appliedDate descending (most recent first)
      remoteCandidates.sort((a, b) => new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime());

      // Update memory & local mirror with Firestore source of truth
      memoryCandidates = remoteCandidates;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteCandidates));
      } catch {}
      listeners.forEach(fn => fn(memoryCandidates));
    }, (error) => {
      console.warn('Firestore candidates snapshot listener warning:', error);
    });
  } catch (err) {
    console.error('Failed to init Firestore sync for candidates:', err);
  }
}

initFirestoreSync();

export const candidateStorage = {
  getCandidates(): Candidate[] {
    return [...memoryCandidates];
  },

  subscribe(callback: CandidateListener): () => void {
    listeners.add(callback);
    callback([...memoryCandidates]);
    return () => listeners.delete(callback);
  },

  saveCandidate(candidateInput: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Candidate {
    const now = new Date().toISOString();
    const newCandidate: Candidate = {
      ...candidateInput,
      id: candidateInput.id || `candidate-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    // Update memory & local mirror immediately
    memoryCandidates = [newCandidate, ...memoryCandidates.filter(c => c.id !== newCandidate.id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCandidates));
    } catch {}
    listeners.forEach(fn => fn(memoryCandidates));

    // Persist to Firebase Firestore - remove undefined fields
    const firestoreData = Object.fromEntries(
      Object.entries(newCandidate).filter(([_, value]) => value !== undefined)
    );
    setDoc(doc(db, COLLECTIONS.CANDIDATES, newCandidate.id), firestoreData)
      .catch(err => {
        console.warn('Candidate saved locally only (Firestore sync failed):', err);
      });

    return newCandidate;
  },

  updateCandidate(id: string, updates: Partial<Candidate>): Candidate | null {
    const idx = memoryCandidates.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const updated: Candidate = {
      ...memoryCandidates[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    memoryCandidates[idx] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCandidates));
    } catch {}
    listeners.forEach(fn => fn(memoryCandidates));

    // Persist to Firebase Firestore - remove undefined fields
    const firestoreUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    updateDoc(doc(db, COLLECTIONS.CANDIDATES, id), firestoreUpdates)
      .catch(err => {
        console.warn('Candidate updated locally only (Firestore sync failed):', err);
      });

    return updated;
  },

  deleteCandidate(id: string): boolean {
    const idx = memoryCandidates.findIndex(c => c.id === id);
    if (idx === -1) return false;

    memoryCandidates = memoryCandidates.filter(c => c.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCandidates));
    } catch {}
    listeners.forEach(fn => fn(memoryCandidates));

    // Delete from Firebase Firestore
    deleteDoc(doc(db, COLLECTIONS.CANDIDATES, id)).catch(err => {
      console.warn('Candidate deleted locally only (Firestore sync failed):', err);
    });

    return true;
  },

  getCandidatesByStatus(status: CandidateStatus): Candidate[] {
    return memoryCandidates.filter(c => c.status === status);
  },

  getPendingCandidates(): Candidate[] {
    return memoryCandidates.filter(c => ['applied', 'screening', 'interview'].includes(c.status));
  },

  getHiredCandidates(): Candidate[] {
    return memoryCandidates.filter(c => c.status === 'hired');
  }
};
