import { CompanyPolicy, PolicyCategory, PolicyStatus } from '../types';
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

export const DEFAULT_POLICIES: CompanyPolicy[] = [
  {
    id: 'pol-iso-9001-quality',
    title: 'ISO 9001:2015 Quality Management & CAPA Policy',
    category: 'Quality & ISO 9001',
    version: 'v2.4',
    status: 'active',
    effectiveDate: '2026-01-01',
    reviewDate: '2026-12-31',
    author: 'Rayan Aouf (Lead Admin)',
    summary: 'Standard operating procedures for quality assurance, client claim root-cause investigations, and preventive action mandates.',
    content: `1. PURPOSE & COMMITMENT
JetNext is committed to delivering digital enterprise solutions (ERPNext, IoT, and custom engineering) meeting international ISO 9001:2015 quality criteria and zero-defect objectives.

2. CLAIM INVESTIGATION PROTOCOL
- All customer claims must be acknowledged within 2 hours of receipt.
- A root-cause analysis using the 5-Why framework must be initiated within 24 hours.
- Corrective and Preventive Actions (CAPA) must be logged and approved by the Quality Lead.

3. CONTINUOUS AUDIT & VERIFICATION
- Internal quarterly audits shall assess customer satisfaction metrics, milestone delivery punctuality, and SLA adherence.
- Results are reported directly to the executive management team.`,
    mandatoryFor: ['All Employees', 'Support Team', 'Quality Leads'],
    tags: ['ISO 9001', 'CAPA', 'Quality Assurance', 'Claims'],
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'pol-customer-sla-escalation',
    title: 'Customer SLA, Support Escalation & Ticket Resolution Policy',
    category: 'Operations & SLA',
    version: 'v1.8',
    status: 'active',
    effectiveDate: '2026-01-15',
    reviewDate: '2026-11-30',
    author: 'Sofia Khelil (Quality & Support Lead)',
    summary: 'Tiered response times, critical system incident escalation, and 24/7 on-call procedures for enterprise support contracts.',
    content: `1. SEVERITY TIERS & TARGET RESOLUTION
- Critical / Production Down: 15-minute response time, 4-hour target resolution. Requires incident commander mobilization.
- High / Major Feature Impairment: 1-hour response, 12-hour resolution.
- Medium / Normal Operational Inquiry: 4-hour response, 48-hour resolution.
- Low / Feature Request or Minor UI: 1 business day response.

2. ESCALATION PATHWAYS
If an incident exceeds 50% of the target resolution window, automated notifications dispatch to the Technical Project Manager and Head of Operations.

3. POST-INCIDENT REPORTING
A formal Post-Mortem review must be delivered to affected clients within 72 hours of incident mitigation.`,
    mandatoryFor: ['Support Team', 'Project Managers', 'Engineering'],
    tags: ['SLA', 'Escalation', 'Customer Support', 'Incidents'],
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z'
  },
  {
    id: 'pol-data-security-privacy',
    title: 'Information Security, Data Protection & Client Confidentiality',
    category: 'Security & Privacy',
    version: 'v3.1',
    status: 'active',
    effectiveDate: '2026-02-01',
    reviewDate: '2027-01-31',
    author: 'Rayan Aouf (CEO)',
    summary: 'Standards for data encryption, password management, role-based database privileges, and non-disclosure obligations.',
    content: `1. DATA CONFIDENTIALITY & ACCESS CONTROL
- Customer enterprise databases, credentials, financial forecasts, and pipeline deals are confidential proprietary assets.
- Access is governed strictly by the Principle of Least Privilege (RBAC).
- Team members must never export, copy, or distribute customer records outside authorized CRM endpoints.

2. AUTHENTICATION & CREDENTIAL HYGIENE
- Multi-factor authentication is recommended for all administrator accounts.
- Passwords must meet minimum complexity guidelines and must not be shared.
- Immediately revoke access upon offboarding or contract completion.

3. CLOUD BACKUPS & ENCRYPTION
All database documents at rest and in transit are protected using TLS 1.3 encryption protocols.`,
    mandatoryFor: ['All Team Members', 'Contractors', 'Admins'],
    tags: ['Security', 'Confidentiality', 'GDPR', 'RBAC', 'Encryption'],
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'pol-commercial-proposal-rules',
    title: 'Commercial Proposal, Pricing & Sales Pipeline Integrity',
    category: 'Sales & Commercial',
    version: 'v2.0',
    status: 'active',
    effectiveDate: '2026-02-15',
    reviewDate: '2026-12-15',
    author: 'Amina Benali (Head of BD)',
    summary: 'Rules for quoting discounts, qualifying opportunities, logging call notes, and transitioning qualified leads into pipeline deals.',
    content: `1. LEAD QUALIFICATION PROTOCOL
- Inbound inquiries must be contacted within 4 business hours.
- Initial contact method and notes must be logged directly into the CRM Lead Card.
- An opportunity deal may only be created after verifying budget authority, operational timeline, and specific scope.

2. PRICING & DISCOUNT AUTHORIZATION
- Standard catalog rates apply to all ERPNext and custom development milestones.
- Discounts exceeding 10% require written approval from the Sales Manager.
- Discounts exceeding 20% require Executive Admin authorization.

3. COMMISSION & STAGE INTEGRITY
Deals are marked Closed Won only after countersigned contracts and receipt of the deposit invoice.`,
    mandatoryFor: ['Sales Team', 'Commercial BD', 'Account Executives'],
    tags: ['Sales', 'Pricing', 'Pipeline', 'Opportunities'],
    createdAt: '2026-02-15T11:00:00.000Z',
    updatedAt: '2026-02-15T11:00:00.000Z'
  },
  {
    id: 'pol-project-milestone-warranty',
    title: 'Project Milestone Delivery, Scope Changes & Warranty Policy',
    category: 'Operations & SLA',
    version: 'v1.5',
    status: 'active',
    effectiveDate: '2026-03-01',
    reviewDate: '2027-02-28',
    author: 'Yacine Zerrouki (Implementation Lead)',
    summary: 'Guidelines for sprint acceptance sign-offs, customer scope deviations, and the 90-day post-go-live warranty coverage.',
    content: `1. MILESTONE SIGN-OFF PROCEDURES
- Each project milestone (e.g. ERPNext Blueprint, Data Migration, User Acceptance Testing) requires written client sign-off.
- Progress percentage in the CRM Project View must be synchronized weekly.

2. SCOPE CREEP & CHANGE ORDERS
Any feature request not explicitly enumerated in the signed Statement of Work requires a formal Change Order and budget adjustment prior to engineering commencement.

3. 90-DAY POST-GO-LIVE WARRANTY
All custom software sprints include 90 days of corrective defect maintenance without additional charge.`,
    mandatoryFor: ['Project Managers', 'Engineering', 'Consultants'],
    tags: ['Projects', 'Warranty', 'Milestones', 'Scope'],
    createdAt: '2026-03-01T12:00:00.000Z',
    updatedAt: '2026-03-01T12:00:00.000Z'
  }
];

class PolicyStorageService {
  private policies: CompanyPolicy[] = [];
  private listeners: ((policies: CompanyPolicy[]) => void)[] = [];
  private isFirebaseConnected = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.policies = JSON.parse(stored);
      } else {
        this.policies = [...DEFAULT_POLICIES];
        this.saveToStorage();
      }
    } catch {
      this.policies = [...DEFAULT_POLICIES];
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
          if (!snapshot.empty) {
            const remotePolicies: CompanyPolicy[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              remotePolicies.push({
                id: docSnap.id,
                title: data.title || 'Untitled Policy',
                category: (data.category || 'Operations & SLA') as PolicyCategory,
                version: data.version || 'v1.0',
                status: (data.status || 'active') as PolicyStatus,
                effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
                reviewDate: data.reviewDate,
                author: data.author || 'JetNext Admin',
                summary: data.summary || '',
                content: data.content || '',
                mandatoryFor: Array.isArray(data.mandatoryFor) ? data.mandatoryFor : ['All Team Members'],
                tags: Array.isArray(data.tags) ? data.tags : [],
                documentUrl: data.documentUrl,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString()
              });
            });
            this.policies = remotePolicies;
            this.notify();
          } else {
            this.seedInitialPolicies();
          }
        },
        (error) => {
          console.warn('Firestore policies listener error (using local storage):', error);
        }
      );
    } catch (err) {
      console.warn('Could not initialize Firestore policies listener:', err);
    }
  }

  private async seedInitialPolicies() {
    try {
      for (const item of DEFAULT_POLICIES) {
        const docRef = doc(db, COLLECTIONS.POLICIES, item.id);
        await setDoc(docRef, { ...item });
      }
    } catch (err) {
      console.warn('Error seeding initial policies to Firestore:', err);
    }
  }

  public getPolicies(): CompanyPolicy[] {
    return [...this.policies];
  }

  public getPolicyById(id: string): CompanyPolicy | undefined {
    return this.policies.find((p) => p.id === id);
  }

  public async createPolicy(policyData: Omit<CompanyPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyPolicy> {
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
      console.warn('Could not write policy to Firestore (stored locally):', err);
    }

    return newPolicy;
  }

  public async updatePolicy(id: string, updates: Partial<CompanyPolicy>): Promise<CompanyPolicy> {
    const index = this.policies.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Policy with id ${id} not found.`);
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

  public async resetToDefaults(): Promise<void> {
    this.policies = [...DEFAULT_POLICIES];
    this.notify();
    try {
      for (const item of DEFAULT_POLICIES) {
        const docRef = doc(db, COLLECTIONS.POLICIES, item.id);
        await setDoc(docRef, { ...item });
      }
    } catch (err) {
      console.warn('Could not reset Firestore policies:', err);
    }
  }

  public exportCSV(): void {
    const headers = ['ID', 'Title', 'Category', 'Version', 'Status', 'Effective Date', 'Author', 'Mandatory For', 'Tags'];
    const rows = this.policies.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.category,
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
