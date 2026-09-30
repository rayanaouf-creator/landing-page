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

// Real-time Firestore sync: STRICTLY READ-ONLY in onSnapshot to prevent cyclical loops
function initFirestoreSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  try {
    const colRef = collection(db, COLLECTIONS.LEADS);
    onSnapshot(colRef, (snapshot) => {
      const remoteLeads: Lead[] = [];

      snapshot.forEach((d) => {
        if (d.id !== 'lead-1' && d.id !== 'lead-2' && d.id !== 'lead-3') {
          remoteLeads.push(d.data() as Lead);
        }
      });

      // Sort by createdAt descending
      remoteLeads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      // Update memory & local mirror with Firestore source of truth
      memoryLeads = remoteLeads;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteLeads));
      } catch {}
      listeners.forEach(fn => fn(memoryLeads));
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

  async deleteLead(id: string): Promise<boolean> {
    // 1. Immediately remove from local memory & storage
    const prevLength = memoryLeads.length;
    memoryLeads = memoryLeads.filter((l) => l.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryLeads));
    } catch {}
    listeners.forEach(fn => fn(memoryLeads));

    // 2. Await deletion on Firestore cloud database
    try {
      await deleteDoc(doc(db, COLLECTIONS.LEADS, id));
    } catch (err) {
      console.error('Firestore deleteLead error:', err);
    }

    return memoryLeads.length !== prevLength;
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
      'Urgency',
      'Requested Solution', 
      'Status', 
      'Priority', 
      'Acquisition Source', 
      'Phone', 
      'Email', 
      'Additional Phones',
      'Notes & Message'
    ];

    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(l.location || '').replace(/"/g, '""')}"`,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      `"${l.emergencyLevel || 'medium'}"`,
      `"${(l.serviceRequested || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.priority}"`,
      `"${l.source}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${(l.additionalPhones || []).join('; ')}"`,
      `"${(l.notes || l.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jetnext_leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  exportJSON(): void {
    const dataStr = JSON.stringify(this.getLeads(), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jetnext_leads_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) return false;
      
      const validated: Lead[] = parsed.map((item) => {
        const id = item.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        return {
          id,
          name: item.name || 'Anonymous Contact',
          email: item.email || '',
          phone: item.phone || '',
          additionalPhones: Array.isArray(item.additionalPhones) ? item.additionalPhones : [],
          company: item.company || 'Enterprise Client',
          jobTitle: item.jobTitle || 'Executive Contact',
          location: item.location || 'Alger',
          industry: item.industry || 'Distribution & Commerce',
          emergencyLevel: item.emergencyLevel || 'medium',
          serviceRequested: item.serviceRequested || 'Consulting & ERP',
          message: item.message || '',
          status: item.status || 'new',
          priority: item.priority || 'medium',
          source: item.source || 'direct_entry',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: item.notes || item.message || ''
        };
      });

      memoryLeads = [...validated, ...memoryLeads];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryLeads));
      } catch {}
      listeners.forEach(fn => fn(memoryLeads));

      // Sync to Firebase Firestore
      validated.forEach(lead => {
        setDoc(doc(db, COLLECTIONS.LEADS, lead.id), lead).catch(err => {
          console.error('Firestore import lead error:', err);
        });
      });

      return true;
    } catch {
      return false;
    }
  }
};
