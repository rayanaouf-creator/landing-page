import { Opportunity, OpportunityStage, Lead } from '../types';
import { db, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_opportunities_database_v1';

type OpportunityListener = (opportunities: Opportunity[]) => void;
const listeners: Set<OpportunityListener> = new Set();
let memoryOpportunities: Opportunity[] = [];
let isInitialized = false;

function loadLocalMirror(): Opportunity[] {
  try {
    const data = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!data) return [];
    const parsed: Opportunity[] = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

memoryOpportunities = loadLocalMirror();

function initFirestoreSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  try {
    const colRef = collection(db, COLLECTIONS.OPPORTUNITIES);
    onSnapshot(colRef, (snapshot) => {
      const remoteOpportunities: Opportunity[] = [];
      snapshot.forEach((d) => {
        remoteOpportunities.push(d.data() as Opportunity);
      });

      remoteOpportunities.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      if (remoteOpportunities.length === 0 && memoryOpportunities.length > 0) {
        memoryOpportunities.forEach(o => {
          setDoc(doc(db, COLLECTIONS.OPPORTUNITIES, o.id), o).catch(err => {
            console.error('Error migrating opportunity to Firestore:', err);
          });
        });
      } else {
        memoryOpportunities = remoteOpportunities;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteOpportunities));
        } catch {}
        listeners.forEach(fn => fn(memoryOpportunities));
      }
    }, (error) => {
      console.warn('Firestore opportunities snapshot listener warning:', error);
    });
  } catch (err) {
    console.error('Failed to init Firestore sync for opportunities:', err);
  }
}

initFirestoreSync();

export const opportunityStorage = {
  getOpportunities(): Opportunity[] {
    return [...memoryOpportunities];
  },

  subscribe(callback: OpportunityListener): () => void {
    listeners.add(callback);
    callback([...memoryOpportunities]);
    return () => listeners.delete(callback);
  },

  saveOpportunity(input: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Opportunity {
    const now = new Date().toISOString();
    const newOpp: Opportunity = {
      ...input,
      id: input.id || `opp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    memoryOpportunities = [newOpp, ...memoryOpportunities.filter(o => o.id !== newOpp.id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryOpportunities));
    } catch {}
    listeners.forEach(fn => fn(memoryOpportunities));

    setDoc(doc(db, COLLECTIONS.OPPORTUNITIES, newOpp.id), newOpp).catch(err => {
      console.error('Firestore saveOpportunity error:', err);
    });

    return newOpp;
  },

  createFromLead(lead: Lead): Opportunity {
    return this.saveOpportunity({
      title: `${lead.company} - ${lead.serviceRequested || 'ERP Implementation'}`,
      customerName: lead.company,
      contactPerson: lead.name,
      email: lead.email,
      phone: lead.phone,
      stage: 'qualification',
      expectedValueDZD: lead.estimatedValueDZD || 2500000,
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      serviceInterest: lead.serviceRequested || 'ERPNext Implementation',
      notes: `Generated from Lead #${lead.id}. ${lead.notes || lead.message || ''}`
    });
  },

  updateOpportunity(id: string, updates: Partial<Opportunity>): Opportunity | null {
    const idx = memoryOpportunities.findIndex(o => o.id === id);
    if (idx === -1) return null;

    const updated: Opportunity = {
      ...memoryOpportunities[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    memoryOpportunities[idx] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryOpportunities));
    } catch {}
    listeners.forEach(fn => fn(memoryOpportunities));

    updateDoc(doc(db, COLLECTIONS.OPPORTUNITIES, id), updates as any).catch(err => {
      console.error('Firestore updateOpportunity error:', err);
    });

    return updated;
  },

  deleteOpportunity(id: string): boolean {
    const prevLen = memoryOpportunities.length;
    memoryOpportunities = memoryOpportunities.filter(o => o.id !== id);
    if (memoryOpportunities.length === prevLen) return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryOpportunities));
    } catch {}
    listeners.forEach(fn => fn(memoryOpportunities));

    deleteDoc(doc(db, COLLECTIONS.OPPORTUNITIES, id)).catch(err => {
      console.error('Firestore deleteOpportunity error:', err);
    });

    return true;
  },

  exportCSV(): void {
    const list = this.getOpportunities();
    const headers = [
      'ID',
      'Title / Deal',
      'Customer / Company',
      'Contact Person',
      'Email',
      'Phone',
      'Stage',
      'Expected Value (DZD)',
      'Probability (%)',
      'Target Close Date',
      'Service Interest',
      'Assigned To',
      'Notes'
    ];

    const rows = list.map(o => [
      `"${o.id}"`,
      `"${(o.title || '').replace(/"/g, '""')}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${(o.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(o.email || '').replace(/"/g, '""')}"`,
      `"${(o.phone || '').replace(/"/g, '""')}"`,
      `"${o.stage}"`,
      `"${o.expectedValueDZD || 0}"`,
      `"${o.probability || 0}"`,
      `"${o.expectedCloseDate || ''}"`,
      `"${(o.serviceInterest || '').replace(/"/g, '""')}"`,
      `"${(o.assignedTo || '').replace(/"/g, '""')}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-opportunities-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
