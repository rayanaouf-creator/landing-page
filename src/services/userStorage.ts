import { AppUser, UserRole, UserStatus, CrmResource } from '../types';
import { db, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_users_directory_v2';

export const DEFAULT_USERS: AppUser[] = [];

function sanitizeForFirestore(user: AppUser): Record<string, any> {
  return {
    id: user.id || '',
    name: (user.name || '').trim(),
    username: (user.username || '').trim().toLowerCase().replace(/^@/, ''),
    password: (user.password || '').trim(),
    email: (user.email || '').trim().toLowerCase(),
    role: user.role || 'sales_rep',
    status: user.status || 'active',
    assignedResources: Array.isArray(user.assignedResources) ? user.assignedResources : ['lead', 'opportunity'],
    department: (user.department || '').trim(),
    title: (user.title || '').trim(),
    phone: (user.phone || '').trim(),
    notes: (user.notes || '').trim(),
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString()
  };
}

class UserStorageService {
  private users: AppUser[] = [];
  private listeners: ((users: AppUser[]) => void)[] = [];
  private isFirebaseConnected = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.users = parsed;
          return;
        }
      }
      this.users = [];
    } catch {
      this.users = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.users));
      }
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

    if (!this.isFirebaseConnected) {
      this.isFirebaseConnected = true;
      this.setupFirestoreListener();
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private setupFirestoreListener() {
    try {
      const usersCol = collection(db, COLLECTIONS.USERS);
      onSnapshot(
        usersCol,
        (snapshot) => {
          if (snapshot.empty) {
            this.users = [];
            this.notify();
            return;
          }

          const remoteUsers: AppUser[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteUsers.push({
              id: docSnap.id,
              name: data.name || '',
              username: (data.username || '').trim().toLowerCase().replace(/^@/, ''),
              password: data.password || '',
              email: (data.email || '').trim().toLowerCase(),
              role: (data.role || 'sales_rep') as UserRole,
              status: (data.status || 'active') as UserStatus,
              assignedResources: Array.isArray(data.assignedResources) ? data.assignedResources : ['lead', 'opportunity'],
              department: data.department || '',
              title: data.title || '',
              phone: data.phone || '',
              notes: data.notes || '',
              lastLoginAt: data.lastLoginAt,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString()
            });
          });

          // Intelligent merge: keep any pending local additions that haven't synchronized to remote yet
          const remoteIds = new Set(remoteUsers.map((u) => u.id));
          const pendingLocals = this.users.filter((u) => !remoteIds.has(u.id) && u.id.startsWith('user-'));

          this.users = [...remoteUsers, ...pendingLocals].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          this.notify();
        },
        (error) => {
          console.warn('Firestore user subscription error (operating in offline fallback):', error);
        }
      );
    } catch (e) {
      console.warn('Could not initialize Firestore user listener:', e);
    }
  }

  /**
   * Directly fetch freshest users from Firestore cloud database.
   * Crucial for verifying login credentials on devices where local cache is cold.
   */
  public async fetchUsersFromFirestore(): Promise<AppUser[]> {
    try {
      const usersCol = collection(db, COLLECTIONS.USERS);
      const snapshot = await getDocs(usersCol);
      if (!snapshot.empty) {
        const remoteUsers: AppUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          remoteUsers.push({
            id: docSnap.id,
            name: data.name || '',
            username: (data.username || '').trim().toLowerCase().replace(/^@/, ''),
            password: data.password || '',
            email: (data.email || '').trim().toLowerCase(),
            role: (data.role || 'sales_rep') as UserRole,
            status: (data.status || 'active') as UserStatus,
            assignedResources: Array.isArray(data.assignedResources) ? data.assignedResources : ['lead', 'opportunity'],
            department: data.department || '',
            title: data.title || '',
            phone: data.phone || '',
            notes: data.notes || '',
            lastLoginAt: data.lastLoginAt,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString()
          });
        });

        if (remoteUsers.length > 0) {
          const remoteIds = new Set(remoteUsers.map((u) => u.id));
          const pendingLocals = this.users.filter((u) => !remoteIds.has(u.id) && u.id.startsWith('user-'));
          this.users = [...remoteUsers, ...pendingLocals].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Error fetching fresh users from Firestore:', err);
    }
    return [...this.users];
  }

  public getUsers(): AppUser[] {
    if (this.users.length === 0) {
      this.loadFromStorage();
    }
    return [...this.users];
  }

  public getUserById(id: string): AppUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  /**
   * Instant user creation:
   * 1. Updates memory & localStorage synchronously (instant UI response & modal close).
   * 2. Synchronizes to Firebase Firestore asynchronously without blocking or hanging popup.
   */
  public async createUser(userData: Omit<AppUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppUser> {
    const cleanUsername = (userData.username || '').trim().toLowerCase().replace(/^@/, '');
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    if (!cleanUsername) {
      throw new Error('Username handle cannot be blank.');
    }
    if (!cleanEmail) {
      throw new Error('Email address cannot be blank.');
    }

    if (this.users.length === 0) {
      this.loadFromStorage();
    }

    // Check duplicate username or email
    const duplicate = this.users.find(
      (u) =>
        (u.username && u.username.toLowerCase().replace(/^@/, '') === cleanUsername) ||
        (u.email && u.email.toLowerCase() === cleanEmail)
    );
    if (duplicate) {
      if (duplicate.username?.toLowerCase().replace(/^@/, '') === cleanUsername) {
        throw new Error(`Username @${cleanUsername} is already registered to ${duplicate.name}. Please choose another.`);
      }
      throw new Error(`Email ${cleanEmail} is already registered to user ${duplicate.name}.`);
    }

    const now = new Date().toISOString();
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newUser: AppUser = {
      ...userData,
      id,
      username: cleanUsername,
      email: cleanEmail,
      createdAt: now,
      updatedAt: now
    };

    // 1. Immediately update memory and localStorage
    this.users.push(newUser);
    this.notify();

    // 2. Persist to Firebase Firestore asynchronously without blocking the UI
    const sanitized = sanitizeForFirestore(newUser);
    const docRef = doc(db, COLLECTIONS.USERS, id);
    setDoc(docRef, sanitized).catch((err) => {
      console.warn('User saved locally; cloud sync pending/offline:', err);
    });

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
      id,
      updatedAt: new Date().toISOString()
    };

    if (updates.username) {
      updatedUser.username = updates.username.trim().toLowerCase().replace(/^@/, '');
    }
    if (updates.email) {
      updatedUser.email = updates.email.trim().toLowerCase();
    }
    if (updates.password) {
      updatedUser.password = updates.password.trim();
    }

    this.users[index] = updatedUser;
    this.notify();

    const sanitized = sanitizeForFirestore(updatedUser);
    const docRef = doc(db, COLLECTIONS.USERS, id);
    setDoc(docRef, sanitized, { merge: true }).catch((err) => {
      console.warn('User updated locally; cloud sync pending/offline:', err);
    });

    return updatedUser;
  }

  public async updateUserRole(id: string, role: UserRole): Promise<AppUser> {
    return this.updateUser(id, { role });
  }

  public async updateUserStatus(id: string, status: UserStatus): Promise<AppUser> {
    return this.updateUser(id, { status });
  }

  public async updateUserCredentials(id: string, username: string, password?: string): Promise<AppUser> {
    const updates: Partial<AppUser> = { username: username.trim().toLowerCase().replace(/^@/, '') };
    if (password !== undefined && password.trim() !== '') {
      updates.password = password.trim();
    }
    return this.updateUser(id, updates);
  }

  public async updateUserResources(id: string, assignedResources: CrmResource[]): Promise<AppUser> {
    return this.updateUser(id, { assignedResources });
  }

  public async deleteUser(id: string): Promise<boolean> {
    this.users = this.users.filter((u) => u.id !== id);
    this.notify();

    const docRef = doc(db, COLLECTIONS.USERS, id);
    deleteDoc(docRef).catch((err) => {
      console.warn('User deleted locally; cloud sync pending/offline:', err);
    });

    return true;
  }

  /**
   * Unified Authentication Method
   * Supports username (with or without @), email address, full name, and case-tolerant matching.
   */
  public authenticate(identifier: string, passInput: string): { user?: AppUser; error?: string } {
    const cleanId = (identifier || '').trim().toLowerCase().replace(/^@/, '');
    const cleanPass = (passInput || '').trim();

    if (!cleanId) {
      return { error: 'Please enter your username or email address.' };
    }
    if (!cleanPass) {
      return { error: 'Please enter your password.' };
    }

    // Refresh users from storage if empty
    let list = this.users;
    if (list.length === 0) {
      this.loadFromStorage();
      list = this.users;
    }

    // Lookup user by username, email, or full name
    const matched = list.find((u) => {
      const uUsername = (u.username || '').trim().toLowerCase().replace(/^@/, '');
      const uEmail = (u.email || '').trim().toLowerCase();
      const uName = (u.name || '').trim().toLowerCase();
      return uUsername === cleanId || uEmail === cleanId || uName === cleanId;
    });

    if (!matched) {
      return { error: `No registered account found for "${identifier}". Please check with an administrator.` };
    }

    if (matched.status === 'inactive' || matched.status === 'suspended') {
      return {
        error: `Account @${matched.username || matched.name} is ${matched.status}. Access denied. Please contact an administrator.`
      };
    }

    const savedPass = (matched.password || '').trim();
    const isValid = 
      savedPass && (
        cleanPass === savedPass || 
        passInput === matched.password ||
        cleanPass.toLowerCase() === savedPass.toLowerCase()
      );

    if (!isValid) {
      return { error: 'Incorrect password for this account. Please verify and try again.' };
    }

    return { user: matched };
  }

  /**
   * Async Authentication with Automatic Cloud Firestore Fallback
   */
  public async authenticateAsync(identifier: string, passInput: string): Promise<{ user?: AppUser; error?: string }> {
    let result = this.authenticate(identifier, passInput);
    if (!result.user) {
      // Fetch fresh users directly from cloud in case this is a cold session
      await this.fetchUsersFromFirestore();
      result = this.authenticate(identifier, passInput);
    }
    return result;
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
