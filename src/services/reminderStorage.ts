import { Reminder, ReminderStatus, ReminderPriority } from '../types';
import { db, COLLECTIONS } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_reminders_database_v1';

type ReminderListener = (reminders: Reminder[]) => void;
const listeners: Set<ReminderListener> = new Set();
let memoryReminders: Reminder[] = [];
let isInitialized = false;

// Read local mirror first so UI is instant
function loadLocalMirror(): Reminder[] {
  try {
    const data = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!data) return [];
    const parsed: Reminder[] = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

memoryReminders = loadLocalMirror();

// Real-time Firestore sync: STRICTLY READ-ONLY in onSnapshot to prevent cyclical loops
function initFirestoreSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  try {
    const colRef = collection(db, COLLECTIONS.REMINDERS);
    onSnapshot(colRef, (snapshot) => {
      const remoteReminders: Reminder[] = [];

      snapshot.forEach((d) => {
        remoteReminders.push(d.data() as Reminder);
      });

      // Sort by dueDate ascending (earliest first)
      remoteReminders.sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());

      // Update memory & local mirror with Firestore source of truth
      memoryReminders = remoteReminders;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteReminders));
      } catch {}
      listeners.forEach(fn => fn(memoryReminders));
    }, (error) => {
      console.warn('Firestore reminders snapshot listener warning:', error);
    });
  } catch (err) {
    console.error('Failed to init Firestore sync for reminders:', err);
  }
}

initFirestoreSync();

export const reminderStorage = {
  getReminders(): Reminder[] {
    return [...memoryReminders];
  },

  subscribe(callback: ReminderListener): () => void {
    listeners.add(callback);
    callback([...memoryReminders]);
    return () => listeners.delete(callback);
  },

  saveReminder(reminderInput: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Reminder {
    const now = new Date().toISOString();
    const newReminder: Reminder = {
      ...reminderInput,
      id: reminderInput.id || `reminder-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    // Update memory & local mirror immediately
    memoryReminders = [newReminder, ...memoryReminders.filter(r => r.id !== newReminder.id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryReminders));
    } catch {}
    listeners.forEach(fn => fn(memoryReminders));

    // Persist to Firebase Firestore - remove undefined fields
    const firestoreData = Object.fromEntries(
      Object.entries(newReminder).filter(([_, value]) => value !== undefined)
    );
    setDoc(doc(db, COLLECTIONS.REMINDERS, newReminder.id), firestoreData)
      .catch(err => {
        console.warn('Reminder saved locally only (Firestore sync failed):', err);
      });

    return newReminder;
  },

  updateReminder(id: string, updates: Partial<Reminder>): Reminder | null {
    const idx = memoryReminders.findIndex(r => r.id === id);
    if (idx === -1) return null;

    const updated: Reminder = {
      ...memoryReminders[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    memoryReminders[idx] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryReminders));
    } catch {}
    listeners.forEach(fn => fn(memoryReminders));

    // Persist to Firebase Firestore - remove undefined fields
    const firestoreUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    updateDoc(doc(db, COLLECTIONS.REMINDERS, id), firestoreUpdates)
      .catch(err => {
        console.warn('Reminder updated locally only (Firestore sync failed):', err);
      });

    return updated;
  },

  deleteReminder(id: string): boolean {
    const idx = memoryReminders.findIndex(r => r.id === id);
    if (idx === -1) return false;

    memoryReminders = memoryReminders.filter(r => r.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryReminders));
    } catch {}
    listeners.forEach(fn => fn(memoryReminders));

    // Delete from Firebase Firestore
    deleteDoc(doc(db, COLLECTIONS.REMINDERS, id)).catch(err => {
      console.error('Firestore deleteReminder error:', err);
    });

    return true;
  },

  markAsCompleted(id: string, completionNotes?: string): Reminder | null {
    const updates: any = {
      status: 'completed',
      completedAt: new Date().toISOString()
    };
    if (completionNotes) {
      updates.completionNotes = completionNotes;
    }
    return this.updateReminder(id, updates);
  },

  getRemindersByLead(leadId: string): Reminder[] {
    return memoryReminders.filter(r => r.leadId === leadId);
  },

  getPendingReminders(): Reminder[] {
    return memoryReminders.filter(r => r.status === 'pending');
  },

  getOverdueReminders(): Reminder[] {
    const now = new Date();
    return memoryReminders.filter(r => {
      if (r.status !== 'pending') return false;
      const dueDate = new Date(r.dueDate);
      return dueDate < now;
    });
  },

  fetchRemindersFromFirestore(): Promise<Reminder[]> {
    return new Promise((resolve) => {
      const colRef = collection(db, COLLECTIONS.REMINDERS);
      onSnapshot(colRef, (snapshot) => {
        const remoteReminders: Reminder[] = [];
        snapshot.forEach((d) => {
          remoteReminders.push(d.data() as Reminder);
        });
        remoteReminders.sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());
        resolve(remoteReminders);
      }, (error) => {
        console.error('Firestore fetchReminders error:', error);
        resolve([]);
      });
    });
  }
};
