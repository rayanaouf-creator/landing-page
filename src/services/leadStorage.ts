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
const DELETED_LEADS_KEY = 'jetnext_deleted_lead_ids_v1';
const MIGRATED_FLAG_KEY = 'jetnext_leads_migrated_flag_v2';
const INITIAL_SEEDED_LEADS: Lead[] = [];

type LeadListener = (leads: Lead[]) => void;
const listeners: Set<LeadListener> = new Set();
let memoryLeads: Lead[] = [];
let isInitialized = false;

function getDeletedLeadIds(): Set<string> {
  try {
    const raw = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(DELETED_LEADS_KEY) : null;
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function addDeletedLeadId(id: string): void {
  try {
    const set = getDeletedLeadIds();
    set.add(id);
    localStorage.setItem(DELETED_LEADS_KEY, JSON.stringify([...set]));
  } catch {}
}

function removeDeletedLeadId(id: string): void {
  try {
    const set = getDeletedLeadIds();
    set.delete(id);
    localStorage.setItem(DELETED_LEADS_KEY, JSON.stringify([...set]));
  } catch {}
}

// Read local mirror first so UI is instant
function loadLocalMirror(): Lead[] {
  try {
    const data = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!data) return [];
    const parsed: Lead[] = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    const deleted = getDeletedLeadIds();
    return parsed.filter(l => l.id !== 'lead-1' && l.id !== 'lead-2' && l.id !== 'lead-3' && !deleted.has(l.id));
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
      const deletedIds = getDeletedLeadIds();
      const remoteLeads: Lead[] = [];

      snapshot.forEach((d) => {
        const lead = d.data() as Lead;
        // If this ID was marked deleted locally, purge it from Firestore and ignore it
        if (deletedIds.has(d.id)) {
          deleteDoc(doc(db, COLLECTIONS.LEADS, d.id)).catch(() => {});
        } else if (d.id !== 'lead-1' && d.id !== 'lead-2' && d.id !== 'lead-3') {
          remoteLeads.push(lead);
        }
      });

      // Sort by createdAt descending
      remoteLeads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      // One-time initial migration only if Firestore is completely empty on first boot
      const hasMigrated = localStorage.getItem(MIGRATED_FLAG_KEY) === 'true';
      if (!hasMigrated) {
        localStorage.setItem(MIGRATED_FLAG_KEY, 'true');
        if (remoteLeads.length === 0 && memoryLeads.length > 0) {
          memoryLeads.forEach(lead => {
            if (!deletedIds.has(lead.id)) {
              setDoc(doc(db, COLLECTIONS.LEADS, lead.id), lead).catch(err => {
                console.error('Error migrating lead to Firestore:', err);
              });
            }
          });
          return;
        }
      }

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

    removeDeletedLeadId(newLead.id);

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
    // 1. Record in permanent tombstone set
    addDeletedLeadId(id);

    // 2. Remove from memory and localStorage mirror
    const prevLength = memoryLeads.length;
    memoryLeads = memoryLeads.filter((l) => l.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryLeads));
    } catch {}
    listeners.forEach(fn => fn(memoryLeads));

    // 3. Await deletion on Firestore cloud database
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
        removeDeletedLeadId(id);
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
