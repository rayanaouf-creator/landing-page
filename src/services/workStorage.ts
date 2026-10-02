import { WorkProject } from '../types';
import { db, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jetnext_work_projects_database_v1';

export const DEFAULT_WORK_PROJECTS: WorkProject[] = [];

type WorkListener = (projects: WorkProject[]) => void;
const listeners: Set<WorkListener> = new Set();
let memoryWork: WorkProject[] = [];
let isInitialized = false;

function loadLocalMirror(): WorkProject[] {
  try {
    const data = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!data) return [];
    const parsed: WorkProject[] = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return parsed;
  } catch {
    return [];
  }
}

memoryWork = loadLocalMirror();

function initFirestoreSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  try {
    const colRef = collection(db, COLLECTIONS.WORK_PROJECTS);
    onSnapshot(colRef, (snapshot) => {
      const remoteWork: WorkProject[] = [];
      snapshot.forEach((d) => {
        remoteWork.push(d.data() as WorkProject);
      });

      remoteWork.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      memoryWork = remoteWork;

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryWork));
      } catch {}
      listeners.forEach((fn) => fn(memoryWork));
    }, (error) => {
      console.warn('Firestore work_projects snapshot listener warning:', error);
    });
  } catch (err) {
    console.error('Failed to init Firestore sync for work_projects:', err);
  }
}

initFirestoreSync();

export const workStorage = {
  getProjects(): WorkProject[] {
    return [...memoryWork].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  },

  getPublishedProjects(): WorkProject[] {
    return memoryWork
      .filter((p) => p.published)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  },

  subscribe(callback: WorkListener): () => void {
    listeners.add(callback);
    callback(this.getProjects());
    return () => listeners.delete(callback);
  },

  saveProject(input: Omit<WorkProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): WorkProject {
    const now = new Date().toISOString();
    const newProject: WorkProject = {
      ...input,
      id: input.id || `work-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      logoLetter: input.logoLetter || (input.name ? input.name.trim().charAt(0).toUpperCase() : 'W'),
      published: input.published ?? true,
      order: input.order ?? (memoryWork.length + 1)
    };

    memoryWork = [newProject, ...memoryWork.filter((p) => p.id !== newProject.id)]
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryWork));
    } catch {}
    listeners.forEach((fn) => fn(memoryWork));

    setDoc(doc(db, COLLECTIONS.WORK_PROJECTS, newProject.id), newProject).catch((err) => {
      console.error('Firestore saveWorkProject error:', err);
    });

    return newProject;
  },

  updateProject(id: string, updates: Partial<WorkProject>): WorkProject | null {
    const idx = memoryWork.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const updated: WorkProject = {
      ...memoryWork[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.name && !updates.logoLetter) {
      updated.logoLetter = updates.name.trim().charAt(0).toUpperCase();
    }

    memoryWork[idx] = updated;
    memoryWork.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryWork));
    } catch {}
    listeners.forEach((fn) => fn(memoryWork));

    updateDoc(doc(db, COLLECTIONS.WORK_PROJECTS, id), updates as any).catch((err) => {
      console.error('Firestore updateWorkProject error:', err);
    });

    return updated;
  },

  togglePublish(id: string): WorkProject | null {
    const project = memoryWork.find((p) => p.id === id);
    if (!project) return null;
    return this.updateProject(id, { published: !project.published });
  },

  deleteProject(id: string): boolean {
    const prevLen = memoryWork.length;
    memoryWork = memoryWork.filter((p) => p.id !== id);
    if (memoryWork.length === prevLen) return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryWork));
    } catch {}
    listeners.forEach((fn) => fn(memoryWork));

    deleteDoc(doc(db, COLLECTIONS.WORK_PROJECTS, id)).catch((err) => {
      console.error('Firestore deleteWorkProject error:', err);
    });

    return true;
  },

  exportCSV(): void {
    const list = this.getProjects();
    const headers = [
      'ID',
      'Client Name',
      'Industry',
      'Category',
      'Status',
      'Key Metric',
      'Metric Label',
      'Order',
      'Description',
      'Solution',
      'Highlights'
    ];

    const rows = list.map((p) => [
      `"${p.id}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.industry || '').replace(/"/g, '""')}"`,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      `"${p.published ? 'Published' : 'Draft'}"`,
      `"${(p.metricValue || '').replace(/"/g, '""')}"`,
      `"${(p.metricLabel || '').replace(/"/g, '""')}"`,
      `"${p.order ?? 0}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      `"${(p.solution || '').replace(/"/g, '""')}"`,
      `"${(p.highlights || []).join(' | ').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-our-work-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
