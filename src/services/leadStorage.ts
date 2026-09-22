import { Lead, LeadStatus, LeadPriority } from '../types';
import { db, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_leads_database_v1';
const INITIAL_SEEDED_LEADS: Lead[] = [];

type LeadListener = (leads: Lead[]) => void;
const listeners: Set<LeadListener> = new Set();
let memoryLeads: Lead[] = [];
let isInitialized = false;

// Read local mirror first so UI is instant
function loadLocalMirror(): Lead[] {
  try {
    const data = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!data) return [];
    const parsed: Lead[] = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(l => l.id !== 'lead-1' && l.id !== 'lead-2' && l.id !== 'lead-3');
  } catch {
    return [];
  }
}

memoryLeads = loadLocalMirror();

// Setup real-time Firestore listener
function initFirestoreSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  try {
    const colRef = collection(db, COLLECTIONS.LEADS);
    onSnapshot(colRef, (snapshot) => {
      const remoteLeads: Lead[] = [];
      snapshot.forEach((d) => {
        remoteLeads.push(d.data() as Lead);
      });

      // Sort by createdAt descending
      remoteLeads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      // If Firestore is empty but we have local leads, migrate them to Firestore
      if (remoteLeads.length === 0 && memoryLeads.length > 0) {
        memoryLeads.forEach(lead => {
          setDoc(doc(db, COLLECTIONS.LEADS, lead.id), lead).catch(err => {
            console.error('Error migrating lead to Firestore:', err);
          });
        });
      } else {
        memoryLeads = remoteLeads;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteLeads));
        } catch {}
        listeners.forEach(fn => fn(memoryLeads));
      }
    }, (error) => {
      console.warn('Firestore leads snapshot listener warning:', error);
    });
  } catch (err) {
    console.error('Failed to init Firestore sync for leads:', err);
  }
}

initFirestoreSync();

export const leadStorage = {
  getLeads(): Lead[] {
    return [...memoryLeads];
  },

  subscribe(callback: LeadListener): () => void {
    listeners.add(callback);
    callback([...memoryLeads]);
    return () => listeners.delete(callback);
  },

  saveLead(leadInput: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Lead {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...leadInput,
      id: leadInput.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    // Update memory & local mirror immediately
    memoryLeads = [newLead, ...memoryLeads.filter(l => l.id !== newLead.id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryLeads));
    } catch {}
    listeners.forEach(fn => fn(memoryLeads));

    // Persist to Firebase Firestore
    setDoc(doc(db, COLLECTIONS.LEADS, newLead.id), newLead).catch(err => {
      console.error('Firestore saveLead error:', err);
    });

    return newLead;
  },

  updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const index = memoryLeads.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const updatedLead: Lead = {
      ...memoryLeads[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    memoryLeads[index] = updatedLead;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryLeads));
    } catch {}
    listeners.forEach(fn => fn(memoryLeads));

    // Update in Firebase Firestore
    updateDoc(doc(db, COLLECTIONS.LEADS, id), updates as any).catch(err => {
      console.error('Firestore updateLead error:', err);
    });

    return updatedLead;
  },

  deleteLead(id: string): boolean {
    const prevLength = memoryLeads.length;
    memoryLeads = memoryLeads.filter((l) => l.id !== id);
    if (memoryLeads.length === prevLength) return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryLeads));
    } catch {}
    listeners.forEach(fn => fn(memoryLeads));

    // Delete in Firebase Firestore
    deleteDoc(doc(db, COLLECTIONS.LEADS, id)).catch(err => {
      console.error('Firestore deleteLead error:', err);
    });

    return true;
  },

  resetToInitial(): Lead[] {
    memoryLeads = [...INITIAL_SEEDED_LEADS];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDED_LEADS));
    } catch {}
    listeners.forEach(fn => fn(memoryLeads));
    return INITIAL_SEEDED_LEADS;
  },

  exportCSV(): void {
    const leads = this.getLeads();
    const headers = [
      'ID', 
      'Date', 
      'Company', 
      'Contact Person', 
      'Post / Function',
      'Location / Wilaya',
      'Industry / Sector',
      'Emergency Level',
      'Email', 
      'Phone', 
      'Service', 
      'Acquisition Source',
      'Status', 
      'Priority', 
      'Notes'
    ];
    const rows = leads.map(l => [
      `"${l.id}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(l.location || '').replace(/"/g, '""')}"`,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      `"${(l.emergencyLevel || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${([l.phone, ...(l.additionalPhones || [])].filter(Boolean).join(' | ')).replace(/"/g, '""')}"`,
      `"${(l.serviceRequested || '').replace(/"/g, '""')}"`,
      `"${(l.source || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.priority}"`,
      `"${(l.notes || l.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportJSON(): void {
    const leads = this.getLeads();
    const blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-leads-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        memoryLeads = parsed;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        listeners.forEach(fn => fn(memoryLeads));
        parsed.forEach(lead => {
          setDoc(doc(db, COLLECTIONS.LEADS, lead.id), lead).catch(console.error);
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};
