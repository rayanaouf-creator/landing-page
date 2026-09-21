import { Lead, LeadStatus, LeadPriority } from '../types';

const STORAGE_KEY = 'jetnext_leads_database_v1';

const INITIAL_SEEDED_LEADS: Lead[] = [];

export const leadStorage = {
  getLeads(): Lead[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }
      const parsed: Lead[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      // Clean out any previously cached fake test leads (lead-1, lead-2, lead-3)
      const cleaned = parsed.filter(
        (l) => l.id !== 'lead-1' && l.id !== 'lead-2' && l.id !== 'lead-3'
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (err) {
      console.error('Error reading leads from localStorage', err);
      return [];
    }
  },

  saveLead(leadInput: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Lead {
    const leads = this.getLeads();
    const now = new Date().toISOString();
    
    const newLead: Lead = {
      ...leadInput,
      id: leadInput.id || `lead-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    const updatedList = [newLead, ...leads];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return newLead;
  },

  updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const leads = this.getLeads();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const updatedLead: Lead = {
      ...leads[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    leads[index] = updatedLead;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    return updatedLead;
  },

  deleteLead(id: string): boolean {
    const leads = this.getLeads();
    const filtered = leads.filter((l) => l.id !== id);
    if (filtered.length === leads.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  resetToInitial(): Lead[] {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDED_LEADS));
    return INITIAL_SEEDED_LEADS;
  },

  exportCSV(): void {
    const leads = this.getLeads();
    const headers = [
      'ID', 
      'Date', 
      'Company', 
      'Contact Person', 
      'Post / Function',
      'Location / Wilaya',
      'Industry / Sector',
      'Emergency Level',
      'Email', 
      'Phone', 
      'Service', 
      'Status', 
      'Priority', 
      'Est Value (DZD)', 
      'Notes'
    ];
    const rows = leads.map(l => [
      `"${l.id}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(l.location || '').replace(/"/g, '""')}"`,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      `"${(l.emergencyLevel || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.serviceRequested || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.priority}"`,
      `"${l.estimatedValueDZD || 0}"`,
      `"${(l.notes || l.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportJSON(): void {
    const leads = this.getLeads();
    const blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-leads-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};
