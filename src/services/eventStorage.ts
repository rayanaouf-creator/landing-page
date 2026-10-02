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

export const DEFAULT_EVENTS: CompanyEvent[] = [];

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
        this.events = [];
      }
    } catch {
      this.events = [];
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
            this.events = [];
            this.notify();
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
