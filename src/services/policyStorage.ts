import { CompanyPolicy, PolicyCategory, PolicyStatus, PolicyType } from '../types';
import { db, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_policies_directory_v1';

export const DEFAULT_POLICIES: CompanyPolicy[] = [];

class PolicyStorageService {
  private policies: CompanyPolicy[] = [];
  private listeners: ((policies: CompanyPolicy[]) => void)[] = [];
  private isFirebaseConnected = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        this.policies = Array.isArray(parsed) ? parsed : [];
      } else {
        this.policies = [];
      }
    } catch {
      this.policies = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.policies));
    } catch (err) {
      console.warn('Failed to persist policies to localStorage', err);
    }
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener([...this.policies]));
  }

  public subscribe(listener: (policies: CompanyPolicy[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.policies]);

    if (!this.isFirebaseConnected) {
      this.isFirebaseConnected = true;
      this.setupFirestoreListener();
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private setupFirestoreListener() {
    try {
      const colRef = collection(db, COLLECTIONS.POLICIES);
      onSnapshot(
        colRef,
        (snapshot) => {
          const remotePolicies: CompanyPolicy[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remotePolicies.push({
              id: docSnap.id,
              title: data.title || 'Untitled Policy',
              type: (data.type || 'other') as PolicyType,
              category: data.category || 'Operations & SLA',
              version: data.version || 'v1.0',
              status: (data.status || 'active') as PolicyStatus,
              effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
              reviewDate: data.reviewDate,
              author: data.author || 'JetNext Admin',
              summary: data.summary || '',
              content: data.content || '',
              mandatoryFor: Array.isArray(data.mandatoryFor) ? data.mandatoryFor : ['All Team Members'],
              tags: Array.isArray(data.tags) ? data.tags : [],
              tasks: Array.isArray(data.tasks) ? data.tasks : [],
              documentUrl: data.documentUrl,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString()
            });
          });

          this.policies = remotePolicies;
          this.notify();
        },
        (error) => {
          console.warn('Firestore policies listener error (using local storage):', error);
        }
      );
    } catch (err) {
      console.warn('Could not initialize Firestore policies listener:', err);
    }
  }

  public getPolicies(): CompanyPolicy[] {
    return [...this.policies];
  }

  public getPolicyById(id: string): CompanyPolicy | undefined {
    return this.policies.find((p) => p.id === id);
  }

  /**
   * Checks if a policy of this type can be created.
   * "Event policy", "Cleaning Policy", "Recrutment Policy", "Dayly policy", "Weekly Policy"
   * allow only 1 policy instance. "other" allows unlimited instances.
   */
  public canCreateType(type: PolicyType, currentEditingId?: string): boolean {
    if (type === 'other') return true;
    const existing = this.policies.find(p => p.type === type && p.id !== currentEditingId);
    return !existing;
  }

  public getExistingPolicyForType(type: PolicyType): CompanyPolicy | undefined {
    if (type === 'other') return undefined;
    return this.policies.find(p => p.type === type);
  }

  public async createPolicy(policyData: Omit<CompanyPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyPolicy> {
    // Enforce Singleton constraint for specific policy types
    if (policyData.type !== 'other') {
      const existing = this.policies.find((p) => p.type === policyData.type);
      if (existing) {
        throw new Error(
          `A policy of type "${policyData.type}" already exists: "${existing.title}". Only one is permitted. You can update the existing policy instead.`
        );
      }
    }

    const now = new Date().toISOString();
    const id = `pol-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPolicy: CompanyPolicy = {
      ...policyData,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.policies.unshift(newPolicy);
    this.notify();

    try {
      const docRef = doc(db, COLLECTIONS.POLICIES, id);
      await setDoc(docRef, newPolicy);
    } catch (err) {
      console.warn('Could not save policy to Firestore (saved locally):', err);
    }

    return newPolicy;
  }

  public async updatePolicy(id: string, updates: Partial<CompanyPolicy>): Promise<CompanyPolicy | null> {
    const index = this.policies.findIndex((p) => p.id === id);
    if (index === -1) return null;

    // Check Singleton constraint if type changed
    if (updates.type && updates.type !== 'other') {
      const existing = this.policies.find((p) => p.type === updates.type && p.id !== id);
      if (existing) {
        throw new Error(
          `Cannot change to type "${updates.type}" because policy "${existing.title}" is already using it.`
        );
      }
    }

    const updated: CompanyPolicy = {
      ...this.policies[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };

    this.policies[index] = updated;
    this.notify();

    try {
      const docRef = doc(db, COLLECTIONS.POLICIES, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: updated.updatedAt
      });
    } catch (err) {
      console.warn('Could not update policy in Firestore (saved locally):', err);
    }

    return updated;
  }

  public async deletePolicy(id: string): Promise<boolean> {
    this.policies = this.policies.filter((p) => p.id !== id);
    this.notify();

    try {
      const docRef = doc(db, COLLECTIONS.POLICIES, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete policy from Firestore (removed locally):', err);
    }

    return true;
  }

  public exportCSV(): void {
    const headers = ['ID', 'Title', 'Type', 'Category', 'Version', 'Status', 'Effective Date', 'Author', 'Mandatory For', 'Tags'];
    const rows = this.policies.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.type}"`,
      `"${p.category || ''}"`,
      p.version,
      p.status,
      p.effectiveDate,
      `"${p.author.replace(/"/g, '""')}"`,
      `"${(p.mandatoryFor || []).join('; ')}"`,
      `"${(p.tags || []).join('; ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jetnext_policies_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const policyStorage = new PolicyStorageService();
