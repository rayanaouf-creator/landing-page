import { Customer, Lead } from '../types';

const STORAGE_KEY = 'jetnext_customers_database_v2';
const LEGACY_STORAGE_KEY = 'jetnext_customers_database_v1';
const FAKE_CUSTOMER_IDS = ['cust-101', 'cust-102', 'cust-103'];

export const customerStorage = {
  getCustomers(): Customer[] {
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
      const parsed: Customer[] = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return [];
      }
      // Remove any fake seed records
      const clean = parsed.filter(c => !FAKE_CUSTOMER_IDS.includes(c.id));
      if (clean.length !== parsed.length && typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      }
      return clean;
    } catch (err) {
      console.error('Error reading customers from localStorage', err);
      return [];
    }
  },

  saveCustomer(input: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Customer {
    const list = this.getCustomers();
    const now = new Date().toISOString();

    const newCustomer: Customer = {
      ...input,
      id: input.id || `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    const updated = [newCustomer, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newCustomer;
  },

  convertLeadToCustomer(lead: Lead): Customer {
    return this.saveCustomer({
      company: lead.company,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      jobTitle: lead.jobTitle || 'Lead / Executive',
      location: lead.location || 'Alger',
      industry: lead.industry || 'Services professionnels & IT',
      status: 'onboarding',
      tier: (lead.estimatedValueDZD && lead.estimatedValueDZD > 3000000) ? 'enterprise' : 'growth',
      activeService: lead.serviceRequested || 'ERPNext Implementation',
      contractValueDZD: lead.estimatedValueDZD || 2500000,
      mrrDZD: Math.round((lead.estimatedValueDZD || 2500000) * 0.05),
      startDate: new Date().toISOString().slice(0, 10),
      notes: `Converted from Sales Lead #${lead.id}. Origin: ${lead.source}. Initial notes: ${lead.notes || lead.message || 'None'}`
    });
  },

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const list = this.getCustomers();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const updated: Customer = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    list[idx] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return updated;
  },

  deleteCustomer(id: string): boolean {
    const list = this.getCustomers();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length === list.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  exportCSV(): void {
    const list = this.getCustomers();
    const headers = [
      'ID',
      'Company',
      'Contact Person',
      'Post / Role',
      'Email',
      'Phone',
      'Location',
      'Industry',
      'Status',
      'Tier',
      'Active Service',
      'Contract Value (DZD)',
      'Monthly Support (DZD)',
      'Start Date',
      'Notes'
    ];

    const rows = list.map(c => [
      `"${c.id}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${(c.industry || '').replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${c.tier}"`,
      `"${(c.activeService || '').replace(/"/g, '""')}"`,
      `"${c.contractValueDZD || 0}"`,
      `"${c.mrrDZD || 0}"`,
      `"${c.startDate}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jetnext-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
