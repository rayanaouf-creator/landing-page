import { Customer, Lead } from '../types';
import { db, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_customers_database_v2';
const FAKE_CUSTOMER_IDS = ['cust-101', 'cust-102', 'cust-103'];

type CustomerListener = (customers: Customer[]) => void;
const listeners: Set<CustomerListener> = new Set();
let memoryCustomers: Customer[] = [];
let isInitialized = false;

function loadLocalMirror(): Customer[] {
  try {
    const data = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!data) return [];
    const parsed: Customer[] = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(c => !FAKE_CUSTOMER_IDS.includes(c.id));
  } catch {
    return [];
  }
}

memoryCustomers = loadLocalMirror();

function initFirestoreSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  try {
    const colRef = collection(db, COLLECTIONS.CUSTOMERS);
    onSnapshot(colRef, (snapshot) => {
      const remoteCustomers: Customer[] = [];
      snapshot.forEach((d) => {
        remoteCustomers.push(d.data() as Customer);
      });

      remoteCustomers.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      if (remoteCustomers.length === 0 && memoryCustomers.length > 0) {
        memoryCustomers.forEach(c => {
          setDoc(doc(db, COLLECTIONS.CUSTOMERS, c.id), c).catch(err => {
            console.error('Error migrating customer to Firestore:', err);
          });
        });
      } else {
        memoryCustomers = remoteCustomers;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteCustomers));
        } catch {}
        listeners.forEach(fn => fn(memoryCustomers));
      }
    }, (error) => {
      console.warn('Firestore customers snapshot listener warning:', error);
    });
  } catch (err) {
    console.error('Failed to init Firestore sync for customers:', err);
  }
}

initFirestoreSync();

export const customerStorage = {
  getCustomers(): Customer[] {
    return [...memoryCustomers];
  },

  subscribe(callback: CustomerListener): () => void {
    listeners.add(callback);
    callback([...memoryCustomers]);
    return () => listeners.delete(callback);
  },

  saveCustomer(input: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Customer {
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...input,
      id: input.id || `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    memoryCustomers = [newCustomer, ...memoryCustomers.filter(c => c.id !== newCustomer.id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCustomers));
    } catch {}
    listeners.forEach(fn => fn(memoryCustomers));

    setDoc(doc(db, COLLECTIONS.CUSTOMERS, newCustomer.id), newCustomer).catch(err => {
      console.error('Firestore saveCustomer error:', err);
    });

    return newCustomer;
  },

  convertLeadToCustomer(lead: Lead): Customer {
    return this.saveCustomer({
      company: lead.company,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      additionalPhones: lead.additionalPhones || [],
      jobTitle: lead.jobTitle || 'Lead / Executive',
      location: lead.location || 'Alger',
      industry: lead.industry || 'Services professionnels & IT',
      status: 'active',
      notes: `Converted from Sales Lead #${lead.id}. Origin: ${lead.source}. Initial notes: ${lead.notes || lead.message || 'None'}`
    });
  },

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const idx = memoryCustomers.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const updated: Customer = {
      ...memoryCustomers[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    memoryCustomers[idx] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCustomers));
    } catch {}
    listeners.forEach(fn => fn(memoryCustomers));

    updateDoc(doc(db, COLLECTIONS.CUSTOMERS, id), updates as any).catch(err => {
      console.error('Firestore updateCustomer error:', err);
    });

    return updated;
  },

  deleteCustomer(id: string): boolean {
    const prevLen = memoryCustomers.length;
    memoryCustomers = memoryCustomers.filter(c => c.id !== id);
    if (memoryCustomers.length === prevLen) return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCustomers));
    } catch {}
    listeners.forEach(fn => fn(memoryCustomers));

    deleteDoc(doc(db, COLLECTIONS.CUSTOMERS, id)).catch(err => {
      console.error('Firestore deleteCustomer error:', err);
    });

    return true;
  },

  exportCSV(): void {
    const list = this.getCustomers();
    const headers = [
      'ID',
      'Company',
      'Contact Person',
      'Post / Role',
      'Email',
      'Phone',
      'Location',
      'Industry',
      'Status',
      'Website',
      'Tax ID (NIF/RC)',
      'Notes'
    ];

    const rows = list.map(c => [
      `"${c.id}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${(c.industry || '').replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${(c.website || '').replace(/"/g, '""')}"`,
      `"${(c.taxId || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
