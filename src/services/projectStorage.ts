import { Project, ProjectStatus } from '../types';
import { db, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_projects_database_v1';

type ProjectListener = (projects: Project[]) => void;
const listeners: Set<ProjectListener> = new Set();
let memoryProjects: Project[] = [];
let isInitialized = false;

function loadLocalMirror(): Project[] {
  try {
    const data = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!data) return [];
    const parsed: Project[] = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

memoryProjects = loadLocalMirror();

function initFirestoreSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  try {
    const colRef = collection(db, COLLECTIONS.PROJECTS);
    onSnapshot(colRef, (snapshot) => {
      const remoteProjects: Project[] = [];
      snapshot.forEach((d) => {
        remoteProjects.push(d.data() as Project);
      });

      remoteProjects.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      if (remoteProjects.length === 0 && memoryProjects.length > 0) {
        memoryProjects.forEach(p => {
          setDoc(doc(db, COLLECTIONS.PROJECTS, p.id), p).catch(err => {
            console.error('Error migrating project to Firestore:', err);
          });
        });
      } else {
        memoryProjects = remoteProjects;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteProjects));
        } catch {}
        listeners.forEach(fn => fn(memoryProjects));
      }
    }, (error) => {
      console.warn('Firestore projects snapshot listener warning:', error);
    });
  } catch (err) {
    console.error('Failed to init Firestore sync for projects:', err);
  }
}

initFirestoreSync();

export const projectStorage = {
  getProjects(): Project[] {
    return [...memoryProjects];
  },

  subscribe(callback: ProjectListener): () => void {
    listeners.add(callback);
    callback([...memoryProjects]);
    return () => listeners.delete(callback);
  },

  saveProject(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Project {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...input,
      id: input.id || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    memoryProjects = [newProject, ...memoryProjects.filter(p => p.id !== newProject.id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryProjects));
    } catch {}
    listeners.forEach(fn => fn(memoryProjects));

    setDoc(doc(db, COLLECTIONS.PROJECTS, newProject.id), newProject).catch(err => {
      console.error('Firestore saveProject error:', err);
    });

    return newProject;
  },

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const idx = memoryProjects.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const updated: Project = {
      ...memoryProjects[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    memoryProjects[idx] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryProjects));
    } catch {}
    listeners.forEach(fn => fn(memoryProjects));

    updateDoc(doc(db, COLLECTIONS.PROJECTS, id), updates as any).catch(err => {
      console.error('Firestore updateProject error:', err);
    });

    return updated;
  },

  deleteProject(id: string): boolean {
    const prevLen = memoryProjects.length;
    memoryProjects = memoryProjects.filter(p => p.id !== id);
    if (memoryProjects.length === prevLen) return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryProjects));
    } catch {}
    listeners.forEach(fn => fn(memoryProjects));

    deleteDoc(doc(db, COLLECTIONS.PROJECTS, id)).catch(err => {
      console.error('Firestore deleteProject error:', err);
    });

    return true;
  },

  exportCSV(): void {
    const list = this.getProjects();
    const headers = [
      'ID',
      'Project Name',
      'Customer',
      'Status',
      'Progress (%)',
      'Total Budget (DZD)',
      'Monthly Support (DZD)',
      'Start Date',
      'Target End Date',
      'Project Manager',
      'Key Deliverables',
      'Notes'
    ];

    const rows = list.map(p => [
      `"${p.id}"`,
      `"${(p.projectName || '').replace(/"/g, '""')}"`,
      `"${(p.customerName || '').replace(/"/g, '""')}"`,
      `"${p.status}"`,
      `"${p.progress || 0}"`,
      `"${p.budgetDZD || 0}"`,
      `"${p.monthlySupportDZD || 0}"`,
      `"${p.startDate || ''}"`,
      `"${p.targetEndDate || ''}"`,
      `"${(p.projectManager || '').replace(/"/g, '""')}"`,
      `"${(p.keyDeliverables || '').replace(/"/g, '""')}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-projects-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
