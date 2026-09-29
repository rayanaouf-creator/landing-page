import { CompanyEvent, EventType, EventStatus } from '../types';
import { db, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_events_directory_v1';

export const DEFAULT_EVENTS: CompanyEvent[] = [
  {
    id: 'evt-erpnext-launch-summit',
    title: 'ERPNext v16 Enterprise Solutions Launch Summit',
    description: 'Executive demonstration of JetNext custom ERPNext manufacturing modules, multi-warehouse integrations, and localized Algerian fiscal compliance.',
    type: 'launch',
    status: 'upcoming',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    time: '09:30 - 16:30',
    location: 'El Aurassi Hotel & Virtual Stream, Algiers',
    organizer: 'Rayan Aouf & Amina Benali',
    attendeesCount: 120,
    tags: ['ERPNext', 'Enterprise', 'Product Launch', 'Commercial'],
    isImportant: true,
    tasks: [
      { id: 'et-1', policyTaskId: 'ptask-1', title: 'Verify booth marketing banners, brochures & company collateral', isCompleted: true, completedBy: 'Amina Benali' },
      { id: 'et-2', policyTaskId: 'ptask-2', title: 'Deploy and test offline & cloud ERPNext / IoT live demo sandbox', isCompleted: true, completedBy: 'Yacine Zerrouki' },
      { id: 'et-3', policyTaskId: 'ptask-3', title: 'Confirm team attendees, corporate attire standards & badges', isCompleted: false },
      { id: 'et-4', policyTaskId: 'ptask-4', title: 'Set up digital lead scanner, QR code & CRM real-time intake form', isCompleted: true, completedBy: 'Rayan Aouf' },
      { id: 'et-5', policyTaskId: 'ptask-5', title: 'Verify venue logistics, power backups & presentation slides', isCompleted: false },
      { id: 'et-6', policyTaskId: 'ptask-6', title: 'Schedule 24h post-event commercial follow-up & debrief', isCompleted: false }
    ],
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'evt-iso-surveillance-audit',
    title: 'ISO 9001:2015 Annual Surveillance Audit',
    description: 'External certification body audit evaluating client claim resolution SLAs, internal development standards, and continuous improvement registers.',
    type: 'audit',
    status: 'upcoming',
    startDate: '2026-10-22',
    endDate: '2026-10-23',
    time: '08:30 - 17:00',
    location: 'JetNext Headquarters, Algiers',
    organizer: 'Sofia Khelil (Quality Lead)',
    attendeesCount: 18,
    tags: ['ISO 9001', 'Audit', 'Quality Assurance', 'Compliance'],
    isImportant: true,
    tasks: [
      { id: 'et-7', policyTaskId: 'ptask-1', title: 'Verify audit documentation, register printouts & evidence binders', isCompleted: true, completedBy: 'Sofia Khelil' },
      { id: 'et-8', policyTaskId: 'ptask-3', title: 'Confirm team attendees, corporate attire standards & badges', isCompleted: true, completedBy: 'Sofia Khelil' },
      { id: 'et-9', policyTaskId: 'ptask-5', title: 'Verify boardroom logistics, projector & CAPA presentation slides', isCompleted: true, completedBy: 'Sofia Khelil' },
      { id: 'et-10', policyTaskId: 'ptask-6', title: 'Schedule internal closing meeting & auditor debrief', isCompleted: true, completedBy: 'Rayan Aouf' }
    ],
    createdAt: '2026-09-05T09:00:00.000Z',
    updatedAt: '2026-09-05T09:00:00.000Z'
  },
  {
    id: 'evt-q4-pipeline-strategy',
    title: 'Q4 Commercial Strategy & Pipeline Acceleration Meeting',
    description: 'Quarterly review of enterprise inquiries, target deal conversions, pricing thresholds, and sales rep pipeline quotas.',
    type: 'meeting',
    status: 'upcoming',
    startDate: '2026-10-05',
    endDate: '2026-10-05',
    time: '14:00 - 17:00',
    location: 'Main Boardroom & Google Meet',
    organizer: 'Amina Benali (Head of BD)',
    attendeesCount: 14,
    tags: ['Sales', 'Strategy', 'Pipeline', 'Quarterly'],
    isImportant: false,
    tasks: [
      { id: 'et-11', policyTaskId: 'ptask-2', title: 'Prepare pipeline metrics report and closed-won analytics', isCompleted: false },
      { id: 'et-12', policyTaskId: 'ptask-3', title: 'Confirm commercial team attendance & agenda review', isCompleted: true, completedBy: 'Amina Benali' },
      { id: 'et-13', policyTaskId: 'ptask-6', title: 'Schedule Q4 target allocation assignments debrief', isCompleted: false }
    ],
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z'
  },
  {
    id: 'evt-iot-telematics-workshop',
    title: 'IoT Industrial Telematics Hands-on Training Workshop',
    description: 'Technical deep-dive on sensor hardware calibration, MQTT gateway configuration, and live dashboard telemetry for client operations teams.',
    type: 'training',
    status: 'upcoming',
    startDate: '2026-11-04',
    endDate: '2026-11-05',
    time: '09:00 - 15:30',
    location: 'JetNext Tech Lab, Bab Ezzouar',
    organizer: 'Yacine Zerrouki (Implementation Lead)',
    attendeesCount: 25,
    tags: ['IoT', 'Training', 'Hardware', 'Engineering'],
    isImportant: false,
    createdAt: '2026-09-15T11:00:00.000Z',
    updatedAt: '2026-09-15T11:00:00.000Z'
  },
  {
    id: 'evt-algiers-industry-expo',
    title: 'North Africa Industrial & Tech Exhibition 2026',
    description: 'Primary trade exhibition booth showcase for ERPNext automation, smart warehouse telemetry, and B2B lead generation.',
    type: 'conference',
    status: 'upcoming',
    startDate: '2026-11-18',
    endDate: '2026-11-21',
    time: '10:00 - 18:00',
    location: 'SAFEX Exhibition Center, Pins Maritimes, Algiers',
    organizer: 'Commercial & Marketing Team',
    attendeesCount: 450,
    tags: ['Exhibition', 'SAFEX', 'Leads', 'Conference'],
    isImportant: true,
    createdAt: '2026-09-18T12:00:00.000Z',
    updatedAt: '2026-09-18T12:00:00.000Z'
  }
];

class EventStorageService {
  private events: CompanyEvent[] = [];
  private listeners: ((events: CompanyEvent[]) => void)[] = [];
  private isFirebaseConnected = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      } else {
        this.events = [...DEFAULT_EVENTS];
        this.saveToStorage();
      }
    } catch {
      this.events = [...DEFAULT_EVENTS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
    } catch (err) {
      console.warn('Failed to persist events to localStorage', err);
    }
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener([...this.events]));
  }

  public subscribe(listener: (events: CompanyEvent[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.events]);

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
      const colRef = collection(db, COLLECTIONS.EVENTS);
      onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteEvents: CompanyEvent[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              remoteEvents.push({
                id: docSnap.id,
                title: data.title || 'Untitled Event',
                description: data.description || '',
                type: (data.type || 'meeting') as EventType,
                status: (data.status || 'upcoming') as EventStatus,
                startDate: data.startDate || new Date().toISOString().split('T')[0],
                endDate: data.endDate,
                time: data.time || '',
                location: data.location || 'JetNext Office',
                organizer: data.organizer || 'JetNext Admin',
                attendeesCount: data.attendeesCount || 0,
                tags: Array.isArray(data.tags) ? data.tags : [],
                isImportant: Boolean(data.isImportant),
                tasks: Array.isArray(data.tasks) ? data.tasks : [],
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString()
              });
            });
            this.events = remoteEvents;
            this.notify();
          } else {
            this.seedInitialEvents();
          }
        },
        (error) => {
          console.warn('Firestore events listener error (using local storage):', error);
        }
      );
    } catch (err) {
      console.warn('Could not initialize Firestore events listener:', err);
    }
  }

  private async seedInitialEvents() {
    try {
      for (const item of DEFAULT_EVENTS) {
        const docRef = doc(db, COLLECTIONS.EVENTS, item.id);
        await setDoc(docRef, { ...item });
      }
    } catch (err) {
      console.warn('Error seeding initial events to Firestore:', err);
    }
  }

  public getEvents(): CompanyEvent[] {
    return [...this.events];
  }

  public getEventById(id: string): CompanyEvent | undefined {
    return this.events.find((e) => e.id === id);
  }

  public async createEvent(eventData: Omit<CompanyEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyEvent> {
    const now = new Date().toISOString();
    const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newEvent: CompanyEvent = {
      ...eventData,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.events.unshift(newEvent);
    this.notify();

    try {
      const docRef = doc(db, COLLECTIONS.EVENTS, id);
      await setDoc(docRef, newEvent);
    } catch (err) {
      console.warn('Could not write event to Firestore (stored locally):', err);
    }

    return newEvent;
  }

  public async updateEvent(id: string, updates: Partial<CompanyEvent>): Promise<CompanyEvent> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Event with id ${id} not found.`);
    }

    const updated: CompanyEvent = {
      ...this.events[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };

    this.events[index] = updated;
    this.notify();

    try {
      const docRef = doc(db, COLLECTIONS.EVENTS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: updated.updatedAt
      });
    } catch (err) {
      console.warn('Could not update event in Firestore (saved locally):', err);
    }

    return updated;
  }

  public async toggleTaskCompletion(eventId: string, taskId: string, completedBy: string = 'Current User'): Promise<CompanyEvent> {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) throw new Error(`Event ${eventId} not found.`);

    const currentTasks = event.tasks || [];
    const updatedTasks = currentTasks.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.isCompleted;
        return {
          ...t,
          isCompleted: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
          completedBy: nextCompleted ? completedBy : undefined
        };
      }
      return t;
    });

    return this.updateEvent(eventId, { tasks: updatedTasks });
  }

  public async syncTasksFromEventPolicy(eventId: string, policyTasks: { id: string; title: string; description?: string }[]): Promise<CompanyEvent> {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) throw new Error(`Event ${eventId} not found.`);

    const existingTasks = event.tasks || [];
    const existingPolicyTaskIds = new Set(existingTasks.map(t => t.policyTaskId).filter(Boolean));

    const newMergedTasks = [...existingTasks];
    policyTasks.forEach(pt => {
      if (!existingPolicyTaskIds.has(pt.id)) {
        newMergedTasks.push({
          id: `et-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          policyTaskId: pt.id,
          title: pt.title,
          description: pt.description,
          isCompleted: false
        });
      }
    });

    return this.updateEvent(eventId, { tasks: newMergedTasks });
  }

  public async deleteEvent(id: string): Promise<boolean> {
    this.events = this.events.filter((e) => e.id !== id);
    this.notify();

    try {
      const docRef = doc(db, COLLECTIONS.EVENTS, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete event from Firestore (removed locally):', err);
    }

    return true;
  }

  public async resetToDefaults(): Promise<void> {
    this.events = [...DEFAULT_EVENTS];
    this.notify();
    try {
      for (const item of DEFAULT_EVENTS) {
        const docRef = doc(db, COLLECTIONS.EVENTS, item.id);
        await setDoc(docRef, { ...item });
      }
    } catch (err) {
      console.warn('Could not reset Firestore events:', err);
    }
  }

  public exportCSV(): void {
    const headers = ['ID', 'Title', 'Type', 'Status', 'Start Date', 'End Date', 'Time', 'Location', 'Organizer', 'Attendees', 'Tags'];
    const rows = this.events.map(e => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      e.type,
      e.status,
      e.startDate,
      e.endDate || '',
      `"${(e.time || '').replace(/"/g, '""')}"`,
      `"${e.location.replace(/"/g, '""')}"`,
      `"${e.organizer.replace(/"/g, '""')}"`,
      e.attendeesCount || 0,
      `"${(e.tags || []).join('; ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jetnext_events_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const eventStorage = new EventStorageService();
