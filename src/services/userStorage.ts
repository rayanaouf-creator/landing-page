import { AppUser, UserRole, UserStatus } from '../types';
import { db, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_users_directory_v1';

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user-rayan-aouf',
    name: 'Rayan Aouf',
    username: 'rayan.aouf',
    password: 'Admin@JetNext2026',
    email: 'rayanaouf@jethings.com',
    role: 'admin',
    status: 'active',
    department: 'Executive',
    title: 'Lead Administrator & CEO',
    phone: '+213 550 12 34 56',
    notes: 'Super administrator with full rights over CRM, projects, claims, and team access.',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'user-amina-benali',
    name: 'Amina Benali',
    username: 'amina.benali',
    password: 'Sales#JetNext2026',
    email: 'amina.benali@jethings.com',
    role: 'sales_manager',
    status: 'active',
    department: 'Commercial & Sales',
    title: 'Head of Business Development',
    phone: '+213 551 23 45 67',
    notes: 'Oversees pipeline deals, qualified leads, and enterprise proposal submissions.',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z'
  },
  {
    id: 'user-karim-messaoudi',
    name: 'Karim Messaoudi',
    username: 'karim.m',
    password: 'Commercial@2026',
    email: 'karim.m@jethings.com',
    role: 'sales_rep',
    status: 'active',
    department: 'Commercial & Sales',
    title: 'Senior Account Executive',
    phone: '+213 552 34 56 78',
    notes: 'Handles client inquiries, daily cold/warm lead outreach, and initial discovery calls.',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'user-sofia-khelil',
    name: 'Sofia Khelil',
    username: 'sofia.k',
    password: 'Support#CAPA2026',
    email: 'sofia.k@jethings.com',
    role: 'support_agent',
    status: 'active',
    department: 'Customer Success',
    title: 'ISO 9001 Quality & Support Lead',
    phone: '+213 553 45 67 89',
    notes: 'Manages incoming claims, client tickets, incident logs, and ISO 9001 CAPA records.',
    createdAt: '2026-02-10T11:00:00.000Z',
    updatedAt: '2026-02-10T11:00:00.000Z'
  },
  {
    id: 'user-yacine-zerrouki',
    name: 'Yacine Zerrouki',
    username: 'yacine.z',
    password: 'ERPNext#Lead2026',
    email: 'yacine.z@jethings.com',
    role: 'project_manager',
    status: 'active',
    department: 'Technical Operations',
    title: 'ERPNext Implementation Lead',
    phone: '+213 554 56 78 90',
    notes: 'Supervises ERP client rollouts, custom software sprints, and technical milestones.',
    createdAt: '2026-02-15T14:30:00.000Z',
    updatedAt: '2026-02-15T14:30:00.000Z'
  }
];

class UserStorageService {
  private users: AppUser[] = [];
  private listeners: ((users: AppUser[]) => void)[] = [];
  private isFirebaseConnected = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.users = JSON.parse(stored);
      } else {
        this.users = [...DEFAULT_USERS];
        this.saveToStorage();
      }
    } catch {
      this.users = [...DEFAULT_USERS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.warn('Error saving users to local storage:', e);
    }
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener([...this.users]));
  }

  public subscribe(callback: (users: AppUser[]) => void): () => void {
    this.listeners.push(callback);
    callback([...this.users]);

    let unsubscribeFirestore: (() => void) | null = null;
    try {
      const usersCol = collection(db, COLLECTIONS.USERS);
      unsubscribeFirestore = onSnapshot(
        usersCol,
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (snapshot.empty) {
            // First time seeding to Firestore
            this.seedInitialUsers();
            return;
          }
          const loaded: AppUser[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              id: docSnap.id,
              name: data.name || '',
              username: data.username || '',
              password: data.password || '',
              email: data.email || '',
              role: (data.role || 'viewer') as UserRole,
              status: (data.status || 'active') as UserStatus,
              department: data.department || '',
              title: data.title || '',
              phone: data.phone || '',
              notes: data.notes || '',
              lastLoginAt: data.lastLoginAt,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString()
            });
          });

          // Sort by creation date or name
          loaded.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          this.users = loaded;
          this.notify();
        },
        (error) => {
          console.warn('Firestore user subscription error (offline fallback used):', error);
          this.isFirebaseConnected = false;
        }
      );
    } catch (e) {
      console.warn('Could not initialize Firestore user listener:', e);
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }

  private async seedInitialUsers() {
    try {
      for (const item of DEFAULT_USERS) {
        const docRef = doc(db, COLLECTIONS.USERS, item.id);
        await setDoc(docRef, { ...item });
      }
    } catch (err) {
      console.warn('Error seeding initial users to Firestore:', err);
    }
  }

  public getUsers(): AppUser[] {
    return [...this.users];
  }

  public getUserById(id: string): AppUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  public async createUser(userData: Omit<AppUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppUser> {
    const now = new Date().toISOString();
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newUser: AppUser = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.users.push(newUser);
    this.notify();

    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      await setDoc(docRef, newUser);
    } catch (err) {
      console.warn('Could not write user to Firestore (stored locally):', err);
    }

    return newUser;
  }

  public async updateUser(id: string, updates: Partial<AppUser>): Promise<AppUser> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found.`);
    }

    const updatedUser: AppUser = {
      ...this.users[index],
      ...updates,
      id, // Preserve id
      updatedAt: new Date().toISOString()
    };

    this.users[index] = updatedUser;
    this.notify();

    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: updatedUser.updatedAt
      });
    } catch (err) {
      console.warn('Could not update user in Firestore (saved locally):', err);
    }

    return updatedUser;
  }

  public async updateUserRole(id: string, role: UserRole): Promise<AppUser> {
    return this.updateUser(id, { role });
  }

  public async updateUserStatus(id: string, status: UserStatus): Promise<AppUser> {
    return this.updateUser(id, { status });
  }

  public async updateUserCredentials(id: string, username: string, password?: string): Promise<AppUser> {
    const updates: Partial<AppUser> = { username: username.trim().toLowerCase() };
    if (password !== undefined && password.trim() !== '') {
      updates.password = password.trim();
    }
    return this.updateUser(id, updates);
  }

  public async deleteUser(id: string): Promise<boolean> {
    this.users = this.users.filter((u) => u.id !== id);
    this.notify();

    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete user from Firestore (removed locally):', err);
    }

    return true;
  }

  public async resetToDefaults(): Promise<void> {
    this.users = [...DEFAULT_USERS];
    this.notify();

    try {
      for (const item of DEFAULT_USERS) {
        const docRef = doc(db, COLLECTIONS.USERS, item.id);
        await setDoc(docRef, { ...item });
      }
    } catch (err) {
      console.warn('Could not reset users in Firestore:', err);
    }
  }

  public exportCSV() {
    const headers = ['ID', 'Name', 'Username', 'Email', 'Role', 'Status', 'Department', 'Title', 'Phone', 'Created Date'];
    const rows = this.users.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${(u.username || '').replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${(u.department || '').replace(/"/g, '""')}"`,
      `"${(u.title || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${u.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jetnext-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const userStorage = new UserStorageService();
