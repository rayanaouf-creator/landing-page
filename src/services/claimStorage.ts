import { Claim, ClaimCategory, ClaimSeverity, ClaimStatus } from '../types';
import { db, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_claims_database_v2';
const FAKE_CLAIM_IDS = ['clm-1', 'clm-2', 'clm-3'];

type ClaimListener = (claims: Claim[]) => void;
const listeners: Set<ClaimListener> = new Set();
let memoryClaims: Claim[] = [];
let isInitialized = false;

function loadLocalMirror(): Claim[] {
  try {
    const data = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!data) return [];
    const parsed: Claim[] = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(c => !FAKE_CLAIM_IDS.includes(c.id));
  } catch {
    return [];
  }
}

memoryClaims = loadLocalMirror();

function initFirestoreSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  try {
    const colRef = collection(db, COLLECTIONS.CLAIMS);
    onSnapshot(colRef, (snapshot) => {
      const remoteClaims: Claim[] = [];
      snapshot.forEach((d) => {
        remoteClaims.push(d.data() as Claim);
      });

      remoteClaims.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      if (remoteClaims.length === 0 && memoryClaims.length > 0) {
        memoryClaims.forEach(c => {
          setDoc(doc(db, COLLECTIONS.CLAIMS, c.id), c).catch(err => {
            console.error('Error migrating claim to Firestore:', err);
          });
        });
      } else {
        memoryClaims = remoteClaims;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteClaims));
        } catch {}
        listeners.forEach(fn => fn(memoryClaims));
      }
    }, (error) => {
      console.warn('Firestore claims snapshot listener warning:', error);
    });
  } catch (err) {
    console.error('Failed to init Firestore sync for claims:', err);
  }
}

initFirestoreSync();

export const claimStorage = {
  getClaims(): Claim[] {
    return [...memoryClaims];
  },

  subscribe(callback: ClaimListener): () => void {
    listeners.add(callback);
    callback([...memoryClaims]);
    return () => listeners.delete(callback);
  },

  saveClaim(input: Omit<Claim, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt'> & { id?: string; claimNumber?: string }): Claim {
    const now = new Date().toISOString();
    const nextNum = memoryClaims.length + 1;
    const formattedNum = `CLM-2026-${String(nextNum).padStart(3, '0')}`;

    const newClaim: Claim = {
      ...input,
      id: input.id || `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      claimNumber: input.claimNumber || formattedNum,
      createdAt: now,
      updatedAt: now
    };

    memoryClaims = [newClaim, ...memoryClaims.filter(c => c.id !== newClaim.id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryClaims));
    } catch {}
    listeners.forEach(fn => fn(memoryClaims));

    setDoc(doc(db, COLLECTIONS.CLAIMS, newClaim.id), newClaim).catch(err => {
      console.error('Firestore saveClaim error:', err);
    });

    return newClaim;
  },

  updateClaim(id: string, updates: Partial<Claim>): Claim | null {
    const idx = memoryClaims.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const current = memoryClaims[idx];
    let resolvedAt = current.resolvedAt;
    if (updates.status === 'resolved' || updates.status === 'closed') {
      if (!resolvedAt) resolvedAt = new Date().toISOString();
    } else if (updates.status) {
      resolvedAt = undefined;
    }

    const updated: Claim = {
      ...current,
      ...updates,
      resolvedAt,
      updatedAt: new Date().toISOString()
    };

    memoryClaims[idx] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryClaims));
    } catch {}
    listeners.forEach(fn => fn(memoryClaims));

    updateDoc(doc(db, COLLECTIONS.CLAIMS, id), updates as any).catch(err => {
      console.error('Firestore updateClaim error:', err);
    });

    return updated;
  },

  deleteClaim(id: string): boolean {
    const prevLen = memoryClaims.length;
    memoryClaims = memoryClaims.filter(c => c.id !== id);
    if (memoryClaims.length === prevLen) return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryClaims));
    } catch {}
    listeners.forEach(fn => fn(memoryClaims));

    deleteDoc(doc(db, COLLECTIONS.CLAIMS, id)).catch(err => {
      console.error('Firestore deleteClaim error:', err);
    });

    return true;
  },

  exportCSV(): void {
    const list = this.getClaims();
    const headers = [
      'Claim #',
      'Date',
      'Customer',
      'Contact Person',
      'Email',
      'Phone',
      'Title',
      'Category',
      'Severity',
      'Status',
      'Assigned To',
      'Description',
      'Corrective Action (CAPA)',
      'Resolved Date'
    ];

    const rows = list.map(c => [
      `"${c.claimNumber}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
      `"${(c.customerName || '').replace(/"/g, '""')}"`,
      `"${(c.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.severity}"`,
      `"${c.status}"`,
      `"${(c.assignedTo || '').replace(/"/g, '""')}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      `"${(c.correctiveAction || '').replace(/"/g, '""')}"`,
      `"${c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : 'Pending'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-claims-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
