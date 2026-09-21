import { Claim, ClaimCategory, ClaimSeverity, ClaimStatus } from '../types';

const STORAGE_KEY = 'jetnext_claims_database_v2';
const LEGACY_STORAGE_KEY = 'jetnext_claims_database_v1';
const FAKE_CLAIM_IDS = ['clm-1', 'clm-2', 'clm-3'];

export const claimStorage = {
  getClaims(): Claim[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }

      const data = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
      if (!data) {
        return [];
      }
      const parsed: Claim[] = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return [];
      }
      // Filter out any fake seed records
      const clean = parsed.filter(c => !FAKE_CLAIM_IDS.includes(c.id));
      if (clean.length !== parsed.length && typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      }
      return clean;
    } catch (err) {
      console.error('Error reading claims from localStorage', err);
      return [];
    }
  },

  saveClaim(input: Omit<Claim, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt'> & { id?: string; claimNumber?: string }): Claim {
    const list = this.getClaims();
    const now = new Date().toISOString();
    const nextNum = list.length + 1;
    const formattedNum = `CLM-2026-${String(nextNum).padStart(3, '0')}`;

    const newClaim: Claim = {
      ...input,
      id: input.id || `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      claimNumber: input.claimNumber || formattedNum,
      createdAt: now,
      updatedAt: now
    };

    const updated = [newClaim, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newClaim;
  },

  updateClaim(id: string, updates: Partial<Claim>): Claim | null {
    const list = this.getClaims();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const current = list[idx];
    let resolvedAt = current.resolvedAt;
    if (updates.status === 'resolved' || updates.status === 'closed') {
      if (!resolvedAt) resolvedAt = new Date().toISOString();
    } else if (updates.status) {
      resolvedAt = undefined;
    }

    const updated: Claim = {
      ...current,
      ...updates,
      resolvedAt,
      updatedAt: new Date().toISOString()
    };

    list[idx] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return updated;
  },

  deleteClaim(id: string): boolean {
    const list = this.getClaims();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length === list.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  exportCSV(): void {
    const list = this.getClaims();
    const headers = [
      'Claim #',
      'Date',
      'Customer',
      'Contact Person',
      'Email',
      'Phone',
      'Title',
      'Category',
      'Severity',
      'Status',
      'Assigned To',
      'Description',
      'Corrective Action (CAPA)',
      'Resolved Date'
    ];

    const rows = list.map(c => [
      `"${c.claimNumber}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
      `"${(c.customerName || '').replace(/"/g, '""')}"`,
      `"${(c.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.severity}"`,
      `"${c.status}"`,
      `"${(c.assignedTo || '').replace(/"/g, '""')}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      `"${(c.correctiveAction || '').replace(/"/g, '""')}"`,
      `"${c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : 'Pending'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-claims-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
