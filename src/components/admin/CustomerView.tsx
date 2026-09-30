import { useState, useMemo, FormEvent } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  CheckCircle2, 
  Globe,
  FileText,
  TrendingUp,
  FolderGit2,
  AlertCircle,
  PhoneCall,
  History,
  MessageCircle
} from 'lucide-react';
import { Customer, CustomerStatus, ClientInteraction, ContactChannel } from '../../types';
import { customerStorage } from '../../services/customerStorage';
import { LOCATION_PRESETS, INDUSTRY_PRESETS, JOB_TITLE_PRESETS } from '../../pages/Admin';
import { ClientContactLogModal } from './ClientContactLogModal';

const STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string; bg: string; border: string }> = {
  active: { label: 'Active Client', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  prospect: { label: 'Prospect / In Discussion', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  inactive: { label: 'Inactive / Dormant', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' }
};

interface CustomerViewProps {
  customers: Customer[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
  onFileClaimForCustomer?: (customer: Customer) => void;
  onCreateOpportunityForCustomer?: (customer: Customer) => void;
  onCreateProjectForCustomer?: (customer: Customer) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export function CustomerView({
  customers,
  onRefresh,
  showToast,
  onFileClaimForCustomer,
  onCreateOpportunityForCustomer,
  onCreateProjectForCustomer,
  isAddModalOpen = false,
  onCloseAddModal,
  statusFilter = 'all',
  onStatusFilterChange
}: CustomerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  
  // Sync if parent updates filter
  const currentStatusFilter = onStatusFilterChange ? statusFilter : localStatusFilter;
  const setStatus = (val: string) => {
    if (onStatusFilterChange) onStatusFilterChange(val);
    else setLocalStatusFilter(val);
  };

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(isAddModalOpen);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contactLogCustomer, setContactLogCustomer] = useState<Customer | null>(null);

  const handleLogCustomerContact = (customerId: string, method: string = 'phone', interactionDetails?: Partial<ClientInteraction>) => {
    const existing = customers.find(c => c.id === customerId);
    if (!existing) return;
    const nowIso = interactionDetails?.contactedAt || new Date().toISOString();

    const currentHistory: ClientInteraction[] = existing.contactHistory ? [...existing.contactHistory] : [];
    if (currentHistory.length === 0 && existing.contactedAt) {
      currentHistory.push({
        id: `legacy-${Date.now()}`,
        channel: (existing.contactMethod as any) || 'phone',
        contactedAt: existing.contactedAt,
        summary: 'Prior contact recorded',
        loggedBy: 'Team'
      });
    }

    const newInteraction: ClientInteraction = {
      id: interactionDetails?.id || `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      channel: (method as any) || 'phone',
      contactedAt: nowIso,
      summary: interactionDetails?.summary || '',
      outcome: interactionDetails?.outcome || 'In Discussion / Interested',
      loggedBy: interactionDetails?.loggedBy || 'Rayan Aouf',
      nextFollowUpDate: interactionDetails?.nextFollowUpDate
    };

    const updatedHistory = [newInteraction, ...currentHistory];

    const updates: Partial<Customer> = {
      contactedAt: nowIso,
      contactMethod: method,
      contactHistory: updatedHistory
    };

    customerStorage.updateCustomer(customerId, updates);
    onRefresh();
    if (viewingCustomer?.id === customerId) {
      setViewingCustomer(prev => prev ? { ...prev, ...updates } : null);
    }
    if (contactLogCustomer?.id === customerId) {
      setContactLogCustomer(prev => prev ? { ...prev, ...updates } : null);
    }
    showToast(`Logged ${method} contact with ${existing.company || existing.name}.`);
  };

  const handleDeleteCustomerInteraction = (customerId: string, interactionId: string) => {
    const existing = customers.find(c => c.id === customerId);
    if (!existing || !existing.contactHistory) return;
    const filtered = existing.contactHistory.filter(i => i.id !== interactionId);
    const latest = filtered[0];
    const updates: Partial<Customer> = {
      contactHistory: filtered,
      contactedAt: latest ? latest.contactedAt : undefined,
      contactMethod: latest ? latest.channel : undefined
    };
    customerStorage.updateCustomer(customerId, updates);
    onRefresh();
    if (viewingCustomer?.id === customerId) {
      setViewingCustomer(prev => prev ? { ...prev, ...updates } : null);
    }
    if (contactLogCustomer?.id === customerId) {
      setContactLogCustomer(prev => prev ? { ...prev, ...updates } : null);
    }
    showToast('Contact interaction removed from customer history.');
  };

  // Form inputs (purely customer account fields - no contract, no cost, no monthly support)
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('Directeur Général / CEO / Owner');
  const [location, setLocation] = useState('Alger');
  const [industry, setIndustry] = useState('Fabrication & Production Industrielle');
  const [status, setStatusValue] = useState<CustomerStatus>('active');
  const [website, setWebsite] = useState('');
  const [taxId, setTaxId] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingCustomer(null);
    setCompany('');
    setName('');
    setEmail('');
    setPhone('');
    setJobTitle('Directeur Général / CEO / Owner');
    setLocation('Alger');
    setIndustry('Fabrication & Production Industrielle');
    setStatusValue('active');
    setWebsite('');
    setTaxId('');
    setNotes('');
    setIsFormOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setCompany(c.company);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    setJobTitle(c.jobTitle || 'Directeur Général / CEO / Owner');
    setLocation(c.location || 'Alger');
    setIndustry(c.industry || 'Fabrication & Production Industrielle');
    setStatusValue(c.status);
    setWebsite(c.website || '');
    setTaxId(c.taxId || '');
    setNotes(c.notes || '');
    setIsFormOpen(true);
  };

  const handleSaveCustomer = (e: FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !name.trim() || !email.trim()) {
      showToast('Please fill company, contact name and email');
      return;
    }

    const payload = {
      company: company.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      jobTitle,
      location,
      industry,
      status,
      website: website.trim(),
      taxId: taxId.trim(),
      notes: notes.trim()
    };

    if (editingCustomer) {
      customerStorage.updateCustomer(editingCustomer.id, payload);
      showToast(`Updated customer "${company}"`);
    } else {
      customerStorage.saveCustomer(payload);
      showToast(`Added customer "${company}"`);
    }

    setIsFormOpen(false);
    if (onCloseAddModal) onCloseAddModal();
    onRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await customerStorage.deleteCustomer(customerToDelete.id);
      showToast(`Deleted customer "${customerToDelete.company}"`);
    } catch {
      showToast('Error deleting customer');
    } finally {
      setIsDeleting(false);
      setCustomerToDelete(null);
      onRefresh();
    }
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Status filter
      if (currentStatusFilter !== 'all' && c.status !== currentStatusFilter) {
        return false;
      }
      // Industry filter
      if (industryFilter !== 'all' && c.industry !== industryFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCompany = c.company.toLowerCase().includes(q);
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const matchesLocation = c.location?.toLowerCase().includes(q);
        const matchesIndustry = c.industry?.toLowerCase().includes(q);
        const matchesTaxId = c.taxId?.toLowerCase().includes(q);
        return matchesCompany || matchesName || matchesEmail || matchesPhone || matchesLocation || matchesIndustry || Boolean(matchesTaxId);
      }
      return true;
    });
  }, [customers, currentStatusFilter, industryFilter, searchQuery]);

  // Aggregate stats
  const activeCount = useMemo(() => customers.filter(c => c.status === 'active').length, [customers]);
  const prospectCount = useMemo(() => customers.filter(c => c.status === 'prospect').length, [customers]);
  const inactiveCount = useMemo(() => customers.filter(c => c.status === 'inactive').length, [customers]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#44ACAB]/10 text-[#44ACAB]">
              <Building2 className="h-3.5 w-3.5" />
              Customer Directory
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20" title="All operations persist in Firebase Firestore cloud database">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firebase Firestore
            </span>
            <span className="text-xs text-slate-400 font-medium">CRM Accounts & Companies</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Enterprise Customer Accounts</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Client company registry, executive contacts, industry segmentation, and account status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => customerStorage.exportCSV()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all"
            title="Export all customers to CSV"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#389695] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Accounts</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{customers.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Registered enterprises</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active Clients</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{activeCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active business relationships</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Prospect Accounts</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-blue-700">{prospectCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Pre-sales & discussions</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inactive / Dormant</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-700">{inactiveCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Archived or paused</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="admin-customers-search"
              type="text"
              placeholder="Search company, contact, email, wilaya, industry, tax ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 transition-all outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({customers.length})
              </button>
              <button
                onClick={() => setStatus('active')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentStatusFilter === 'active' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setStatus('prospect')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentStatusFilter === 'prospect' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Prospect ({prospectCount})
              </button>
              <button
                onClick={() => setStatus('inactive')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentStatusFilter === 'inactive' ? 'bg-slate-700 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inactive ({inactiveCount})
              </button>
            </div>

            {/* Industry Filter */}
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:border-[#44ACAB] outline-hidden"
            >
              <option value="all">All Industries</option>
              {INDUSTRY_PRESETS.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-900">No customer accounts found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || currentStatusFilter !== 'all' || industryFilter !== 'all'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'Get started by creating your first client account or converting a Won lead.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {(searchQuery || currentStatusFilter !== 'all' || industryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatus('all');
                    setIndustryFilter('all');
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={openAddModal}
                className="rounded-xl bg-[#44ACAB] px-4 py-2 text-xs font-bold text-white hover:bg-[#389695]"
              >
                + Add Customer
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-light-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Primary Contact</th>
                  <th className="py-3.5 px-4">Location / Wilaya</th>
                  <th className="py-3.5 px-4">Industry Sector</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Contact History</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCustomers.map((c) => {
                  const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.active;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Company */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                            {c.company.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{c.company}</span>
                              {c.taxId && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                  NIF: {c.taxId}
                                </span>
                              )}
                            </div>
                            {c.website && (
                              <a 
                                href={c.website.startsWith('http') ? c.website : `https://${c.website}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[11px] text-[#44ACAB] hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Globe className="h-3 w-3" />
                                <span>{c.website.replace(/^https?:\/\//, '')}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-500">{c.jobTitle || 'Executive Contact'}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                          <a href={`mailto:${c.email}`} className="hover:text-[#44ACAB] flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{c.email}</span>
                          </a>
                          {c.phone && (
                            <a href={`tel:${c.phone}`} className="hover:text-[#44ACAB] flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{c.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{c.location || 'Algérie'}</span>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{c.industry || 'Entreprise'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Contact History */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.contactHistory && c.contactHistory.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setContactLogCustomer(c)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs group"
                            title="Click to view all contact history and log new contact"
                          >
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold">{c.contactHistory.length}</span>
                            <span className="text-[11px] text-emerald-700 capitalize">
                              {c.contactMethod || 'contact'}{c.contactHistory.length > 1 ? 's' : ''}
                            </span>
                          </button>
                        ) : c.contactedAt ? (
                          <button
                            type="button"
                            onClick={() => setContactLogCustomer(c)}
                            className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 font-medium"
                            title="1 contact recorded • Click to view history"
                          >
                            <span>1 contact ({c.contactMethod || 'phone'})</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setContactLogCustomer(c)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#1b6b6a] transition-colors"
                            title="Log client contact (WhatsApp, Mail, Phone, Face-to-Face)"
                          >
                            <PhoneCall className="h-3 w-3 text-slate-400" />
                            <span>+ Log</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setContactLogCustomer(c)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-[#e6f4f4] hover:text-[#1b6b6a] transition-colors relative"
                            title="Log client contact (WhatsApp, Mail, Phone, Face-to-Face) / View History"
                          >
                            <PhoneCall className="h-4 w-4" />
                            {c.contactHistory && c.contactHistory.length > 1 && (
                              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-[#1b6b6a] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {c.contactHistory.length}
                              </span>
                            )}
                          </button>
                          {onCreateOpportunityForCustomer && (
                            <button
                              onClick={() => onCreateOpportunityForCustomer(c)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              title="Create New Opportunity / Deal for this customer"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </button>
                          )}

                          {onCreateProjectForCustomer && (
                            <button
                              onClick={() => onCreateProjectForCustomer(c)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                              title="Start Project for this customer"
                            >
                              <FolderGit2 className="h-4 w-4" />
                            </button>
                          )}

                          {onFileClaimForCustomer && (
                            <button
                              onClick={() => onFileClaimForCustomer(c)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                              title="File Claim / Ticket for this customer"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setViewingCustomer(c)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(c)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setCustomerToDelete(c)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT CUSTOMER MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#44ACAB]/10 text-[#44ACAB] flex items-center justify-center font-bold">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCustomer ? 'Edit Customer Profile' : 'Register New Customer Account'}
                  </h3>
                  <p className="text-xs text-slate-500">Corporate client profile and contact details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveCustomer} className="p-6 overflow-y-auto custom-light-scrollbar space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Enterprise Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SARL Maghreb Plastique & Câblerie"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Primary Contact Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Karim Benali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Job Title / Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title / Function</label>
                  <select
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  >
                    {JOB_TITLE_PRESETS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@company-dz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+213 550 XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Wilaya / Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wilaya / Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  >
                    {LOCATION_PRESETS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Industry Sector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  >
                    {INDUSTRY_PRESETS.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Account Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatusValue(e.target.value as CustomerStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  >
                    <option value="active">Active Client</option>
                    <option value="prospect">Prospect / In Discussion</option>
                    <option value="inactive">Inactive / Dormant</option>
                  </select>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website URL (optional)</label>
                  <input
                    type="text"
                    placeholder="https://company.dz"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Tax ID / NIF */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax ID / NIF / RC (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. NIF 001916010000000"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Internal Notes & Corporate Details</label>
                  <textarea
                    rows={3}
                    placeholder="Key executive contacts, branches, decision maker preferences, background context..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    if (onCloseAddModal) onCloseAddModal();
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#44ACAB] px-5 py-2 text-xs font-bold text-white hover:bg-[#389695] transition-colors"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CUSTOMER DETAIL DRAWER */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs">
                  {viewingCustomer.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewingCustomer.company}</h3>
                  <p className="text-xs text-slate-500">{viewingCustomer.industry || 'Corporate Account'}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-light-scrollbar">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Account Status</span>
                  <p className="font-bold text-slate-800 capitalize mt-0.5">{viewingCustomer.status}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                  <p className="font-bold text-slate-800 mt-0.5">{viewingCustomer.location || 'Algérie'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Contact</h4>
                <p className="text-sm font-bold text-slate-900">{viewingCustomer.name}</p>
                <p className="text-xs text-slate-500">{viewingCustomer.jobTitle || 'Executive Contact'}</p>
                <div className="flex flex-col gap-1 text-xs pt-1">
                  <a href={`mailto:${viewingCustomer.email}`} className="text-[#44ACAB] hover:underline flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{viewingCustomer.email}</span>
                  </a>
                  {viewingCustomer.phone && (
                    <a href={`tel:${viewingCustomer.phone}`} className="text-slate-700 hover:underline flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{viewingCustomer.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {(viewingCustomer.website || viewingCustomer.taxId) && (
                <div className="p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Administrative Information</h4>
                  {viewingCustomer.website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      <a href={viewingCustomer.website.startsWith('http') ? viewingCustomer.website : `https://${viewingCustomer.website}`} target="_blank" rel="noreferrer" className="text-[#44ACAB] hover:underline">
                        {viewingCustomer.website}
                      </a>
                    </div>
                  )}
                  {viewingCustomer.taxId && (
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Tax ID / NIF:</span> {viewingCustomer.taxId}
                    </p>
                  )}
                </div>
              )}

              {/* ── CLIENT CONTACT ACTIVITY TRACKING & HISTORY ── */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-[#1b6b6a]" />
                      <span className="font-bold text-slate-800 text-sm">
                        Client Interaction Log & History
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        {(viewingCustomer.contactHistory?.length || (viewingCustomer.contactedAt ? 1 : 0))} logged
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Record every WhatsApp, phone call, email, or face-to-face meeting with full discussion notes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setContactLogCustomer(viewingCustomer)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b6b6a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#155453] shadow-xs transition-all shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Log Contact</span>
                  </button>
                </div>

                {/* Summary of interactions */}
                {viewingCustomer.contactHistory && viewingCustomer.contactHistory.length > 0 ? (
                  <div className="space-y-2 mt-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Recent Interactions:</span>
                      <button
                        type="button"
                        onClick={() => setContactLogCustomer(viewingCustomer)}
                        className="text-[#1b6b6a] font-bold hover:underline"
                      >
                        View Full History ({viewingCustomer.contactHistory.length}) →
                      </button>
                    </div>
                    {viewingCustomer.contactHistory.slice(0, 3).map((ci, idx) => (
                      <div key={ci.id || idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start justify-between gap-2 text-xs shadow-2xs">
                        <div className="flex items-start gap-2">
                          <span className="capitalize font-bold text-[#1b6b6a] bg-teal-50 px-2 py-0.5 rounded text-[10px] border border-teal-200/60">
                            {ci.channel.replace('_', ' ')}
                          </span>
                          <div>
                            <p className="text-slate-800 font-medium line-clamp-1">{ci.summary || 'Interaction logged'}</p>
                            <span className="text-[10px] text-slate-400">
                              {new Date(ci.contactedAt).toLocaleDateString()} at {new Date(ci.contactedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {ci.loggedBy || 'Team'}
                            </span>
                          </div>
                        </div>
                        {ci.outcome && (
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                            {ci.outcome}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : viewingCustomer.contactedAt ? (
                  <div className="mt-1 p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Contacted on {new Date(viewingCustomer.contactedAt).toLocaleDateString()} via {viewingCustomer.contactMethod || 'phone'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setContactLogCustomer(viewingCustomer)}
                      className="text-xs text-[#1b6b6a] font-bold hover:underline"
                    >
                      Manage History
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 p-3.5 rounded-xl bg-white border border-dashed border-slate-200 text-xs text-slate-400 text-center">
                    No contacts recorded yet for this client account. Click "+ Log Contact" above to record an interaction.
                  </div>
                )}
              </div>

              {viewingCustomer.notes && (
                <div className="p-4 rounded-xl bg-slate-50 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Internal Notes</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{viewingCustomer.notes}</p>
                </div>
              )}

              {/* Quick Actions for this customer */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                {onCreateOpportunityForCustomer && (
                  <button
                    onClick={() => {
                      const c = viewingCustomer;
                      setViewingCustomer(null);
                      onCreateOpportunityForCustomer(c);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>+ New Opportunity</span>
                  </button>
                )}

                {onCreateProjectForCustomer && (
                  <button
                    onClick={() => {
                      const c = viewingCustomer;
                      setViewingCustomer(null);
                      onCreateProjectForCustomer(c);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors"
                  >
                    <FolderGit2 className="h-3.5 w-3.5" />
                    <span>+ Start Project</span>
                  </button>
                )}

                {onFileClaimForCustomer && (
                  <button
                    onClick={() => {
                      const c = viewingCustomer;
                      setViewingCustomer(null);
                      onFileClaimForCustomer(c);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>+ File Claim</span>
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const c = viewingCustomer;
                  setViewingCustomer(null);
                  openEditModal(c);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#44ACAB] hover:underline"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setViewingCustomer(null)}
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Delete Customer Account</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{customerToDelete.company}"</span>? 
              This will remove the customer directory record.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                disabled={isDeleting}
                onClick={() => setCustomerToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENT CONTACT LOG & INTERACTION HISTORY MODAL ── */}
      {contactLogCustomer && (
        <ClientContactLogModal
          isOpen={Boolean(contactLogCustomer)}
          onClose={() => setContactLogCustomer(null)}
          clientName={contactLogCustomer.name}
          clientCompany={contactLogCustomer.company}
          clientPhone={contactLogCustomer.phone}
          clientEmail={contactLogCustomer.email}
          contactHistory={contactLogCustomer.contactHistory || []}
          currentUserName="Rayan Aouf"
          onSaveInteraction={(interaction) => {
            handleLogCustomerContact(contactLogCustomer.id, interaction.channel, interaction);
          }}
          onDeleteInteraction={(interactionId) => {
            handleDeleteCustomerInteraction(contactLogCustomer.id, interactionId);
          }}
        />
      )}
    </div>
  );
}
