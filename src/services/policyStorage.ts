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

export const DEFAULT_POLICIES: CompanyPolicy[] = [
  {
    id: 'pol-event-policy',
    title: 'JetNext Corporate & Public Event Policy',
    type: 'Event policy',
    category: 'Operations',
    version: 'v1.4',
    status: 'active',
    effectiveDate: '2026-01-01',
    reviewDate: '2026-12-31',
    author: 'Rayan Aouf (CEO)',
    summary: 'Protocol governing official participation in industrial summits, booth sponsorships, client demo workshops, and exhibition presence.',
    content: `1. EVENT PROPOSAL & APPROVAL
- Any public or commercial event (e.g. SAFEX exhibitions, tech summits, client webinars) requires budget and agenda clearance 30 days in advance.
- Marketing materials and demo instances must be verified 1 week prior to show opening.

2. STAFFING & REPRESENTATION
- Team members representing JetNext must adhere to professional dress and corporate presentation standards.
- All leads gathered during trade events must be logged into the CRM within 24 hours of event conclusion.

3. POST-EVENT ROI REVIEW
A lead conversion and expenditure report must be filed within 5 business days after each major exhibition.`,
    mandatoryFor: ['Sales Team', 'Marketing', 'Executive Leadership'],
    tags: ['Event policy', 'Exhibitions', 'Summits', 'Corporate'],
    tasks: [
      { id: 'ptask-1', title: 'Verify booth marketing banners, brochures & company collateral', isMandatory: true },
      { id: 'ptask-2', title: 'Deploy and test offline & cloud ERPNext / IoT live demo sandbox', isMandatory: true },
      { id: 'ptask-3', title: 'Confirm team attendees, corporate attire standards & badges', isMandatory: true },
      { id: 'ptask-4', title: 'Set up digital lead scanner, QR code & CRM real-time intake form', isMandatory: true },
      { id: 'ptask-5', title: 'Verify venue logistics, power backups & presentation slides', isMandatory: false },
      { id: 'ptask-6', title: 'Schedule 24h post-event commercial follow-up & debrief', isMandatory: true }
    ],
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'pol-cleaning-policy',
    title: 'Workplace Hygiene & Daily Cleaning Policy',
    type: 'Cleaning Policy',
    category: 'HR & Workplace',
    version: 'v2.1',
    status: 'active',
    effectiveDate: '2026-01-10',
    reviewDate: '2026-12-31',
    author: 'Sofia Khelil (Quality & Facilities Lead)',
    summary: 'Sanitization schedules, clean desk protocol, server room environmental cleanliness, and waste management standards.',
    content: `1. DAILY CLEANING ROUTINE
- Common areas, meeting boardrooms, and reception desks undergo full daily sanitization at 07:30 and 17:30.
- Trash containers and recycling bins are emptied daily.

2. CLEAN DESK & EQUIPMENT HYGIENE
- Team workstations must be cleared of confidential client papers and food waste at the close of every business day.
- Technical labs and hardware testing benches must be sanitized before and after hardware assembly.

3. SERVER ROOM & IT LAB SPECIFICATIONS
- The server room must remain free of dust, food, beverages, and combustible packaging at all times.
- Weekly inspection of air conditioning and ambient temperature filters is mandatory.`,
    mandatoryFor: ['All Team Members', 'Facilities Staff', 'Tech Lab'],
    tags: ['Cleaning Policy', 'Hygiene', 'Facilities', 'Clean Desk'],
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z'
  },
  {
    id: 'pol-recrutment-policy',
    title: 'Talent Acquisition & Recrutment Policy',
    type: 'Recrutment Policy',
    category: 'HR & Workplace',
    version: 'v1.6',
    status: 'active',
    effectiveDate: '2026-01-15',
    reviewDate: '2026-11-30',
    author: 'Amina Benali (Head of BD & HR)',
    summary: 'Merit-based hiring, candidate vetting procedures, practical coding/business assessments, and onboarding integration.',
    content: `1. TALENT SELECTION PRINCIPLES
- Recruitment is strictly merit-based, evaluating technical capability, cultural alignment with ISO 9001 quality principles, and problem-solving initiative.
- All vacancies are published internally before external public syndication.

2. THREE-STAGE VETTING PROCESS
- Stage 1: Preliminary HR screening and career alignment discussion (30 mins).
- Stage 2: Technical / Commercial practical assessment (ERPNext case study, coding sprint, or mock sales discovery call).
- Stage 3: Executive Leadership interview and offer formulation.

3. STRUCTURED ONBOARDING
Every newly joined team member is assigned an onboarding mentor and must complete CRM, Security, and Quality compliance reviews during their first 14 days.`,
    mandatoryFor: ['Hiring Managers', 'HR', 'Executive Team'],
    tags: ['Recrutment Policy', 'Hiring', 'HR', 'Onboarding'],
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'pol-dayly-policy',
    title: 'Dayly Attendance & Operations Protocol',
    type: 'Dayly policy',
    category: 'Operations & SLA',
    version: 'v1.8',
    status: 'active',
    effectiveDate: '2026-02-01',
    reviewDate: '2026-12-31',
    author: 'Yacine Zerrouki (Operations Lead)',
    summary: 'Daily working hours, 09:15 morning standup expectations, urgent customer support routing, and end-of-day task checkout.',
    content: `1. WORKDAY CORE HOURS & PUNCTUALITY
- Standard operating day commences between 08:30 and 09:00 AM (Sunday through Thursday).
- Core collaborative window is 09:00 to 16:30.

2. MORNING STANDUP (09:15 AM)
- Each functional department conducts a 15-minute synchronous sync covering:
  a) Yesterday's completed deliverables;
  b) Today's prioritized sprint targets;
  c) Immediate operational blockers or client escalations.

3. DAILY LOGGING & CHECKOUT
- All customer interactions, lead phone calls, and claim responses must be logged in the CRM on the same calendar day they occur.
- Sprints and project task boards must reflect current status before end of workday.`,
    mandatoryFor: ['All Team Members', 'Consultants', 'Engineers'],
    tags: ['Dayly policy', 'Operations', 'Daily Standup', 'Attendance'],
    createdAt: '2026-02-01T08:30:00.000Z',
    updatedAt: '2026-02-01T08:30:00.000Z'
  },
  {
    id: 'pol-weekly-policy',
    title: 'Weekly Sprint Planning & Review Policy',
    type: 'Weekly Policy',
    category: 'Operations & SLA',
    version: 'v1.5',
    status: 'active',
    effectiveDate: '2026-02-10',
    reviewDate: '2026-12-31',
    author: 'Yacine Zerrouki & Rayan Aouf',
    summary: 'Thursday retrospective meetings, Sunday sprint kickoffs, client milestone sign-offs, and weekly pipeline synchronization.',
    content: `1. WEEKLY SPRINT CYCLE
- The operational week runs Sunday through Thursday.
- Sunday 10:00 AM: Sprint Kickoff & Milestone Commitment review.
- Thursday 15:30 PM: Retrospective & Customer Deliverable demo.

2. WEEKLY COMMERCIAL & PIPELINE SYNC
- Commercial team reviews stage advancements, deal probabilities, and qualified lead velocity every Wednesday afternoon.
- Stalled inquiries (> 14 days without activity) must be escalated or closed.

3. MANAGEMENT METRICS REPORTING
Weekly summary metrics (new leads, closed opportunities, claim resolution time, and project milestone completion) are compiled automatically into the Executive Dashboard.`,
    mandatoryFor: ['Project Managers', 'Sales Managers', 'Team Leads'],
    tags: ['Weekly Policy', 'Sprint Planning', 'Retrospectives', 'Milestones'],
    createdAt: '2026-02-10T11:00:00.000Z',
    updatedAt: '2026-02-10T11:00:00.000Z'
  },
  {
    id: 'pol-iso-quality-other',
    title: 'ISO 9001 Quality Management & CAPA Policy',
    type: 'other',
    category: 'Quality & ISO 9001',
    version: 'v2.4',
    status: 'active',
    effectiveDate: '2026-01-01',
    reviewDate: '2026-12-31',
    author: 'Rayan Aouf (CEO)',
    summary: 'Standard operating procedures for quality assurance, client claim root-cause investigations, and preventive action mandates.',
    content: `1. COMMITMENT TO ZERO DEFECTS
JetNext adheres to international ISO 9001:2015 benchmarks across ERPNext implementations, custom IoT development, and technical support.

2. CLAIM RESOLUTION MANDATE
Customer claims are acknowledged within 2 hours and investigated with systematic 5-Why root-cause analysis. Corrective and Preventive Actions (CAPA) are logged and monitored.`,
    mandatoryFor: ['All Team Members', 'Support', 'Admins'],
    tags: ['ISO 9001', 'CAPA', 'Quality', 'other'],
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'pol-data-security-other',
    title: 'Data Security, Privacy & Client Confidentiality',
    type: 'other',
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

2. AUTHENTICATION & CREDENTIAL HYGIENE
- Passwords must meet minimum complexity guidelines and must not be shared.`,
    mandatoryFor: ['All Team Members', 'Contractors', 'Admins'],
    tags: ['Security', 'Confidentiality', 'GDPR', 'Encryption', 'other'],
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z'
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
      console.warn('Could not write policy to Firestore (stored locally):', err);
    }

    return newPolicy;
  }

  public async updatePolicy(id: string, updates: Partial<CompanyPolicy>): Promise<CompanyPolicy> {
    const index = this.policies.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Policy with id ${id} not found.`);
    }

    // Check Singleton constraint if type changed
    if (updates.type && updates.type !== 'other') {
      const existing = this.policies.find((p) => p.type === updates.type && p.id !== id);
      if (existing) {
        throw new Error(
          `A policy of type "${updates.type}" already exists: "${existing.title}". Only one is permitted.`
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
