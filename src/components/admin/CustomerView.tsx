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
  Calendar, 
  DollarSign, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Layers,
  ArrowUpRight,
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';
import { Customer, CustomerStatus, CustomerTier } from '../../types';
import { customerStorage } from '../../services/customerStorage';
import { LOCATION_PRESETS, INDUSTRY_PRESETS, JOB_TITLE_PRESETS } from '../../pages/Admin';

const STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string; bg: string; border: string }> = {
  active: { label: 'Active Contract', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  onboarding: { label: 'In Onboarding', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  paused: { label: 'Suspended / Paused', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  churned: { label: 'Completed / Churned', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' }
};

const TIER_CONFIG: Record<CustomerTier, { label: string; color: string; bg: string; border: string }> = {
  enterprise: { label: 'Enterprise Tier', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  growth: { label: 'Growth Tier', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  standard: { label: 'Standard Tier', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' }
};

interface CustomerViewProps {
  customers: Customer[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
  onFileClaimForCustomer?: (customer: Customer) => void;
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
  isAddModalOpen = false,
  onCloseAddModal,
  statusFilter = 'all',
  onStatusFilterChange
}: CustomerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
  const [tierFilter, setTierFilter] = useState<string>('all');
  
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

  // Form inputs
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('Directeur Général / CEO / Owner');
  const [location, setLocation] = useState('Alger');
  const [industry, setIndustry] = useState('Fabrication & Production Industrielle');
  const [status, setStatusValue] = useState<CustomerStatus>('active');
  const [tier, setTier] = useState<CustomerTier>('growth');
  const [activeService, setActiveService] = useState('ERPNext Implementation');
  const [contractValueDZD, setContractValueDZD] = useState<number | ''>(2500000);
  const [mrrDZD, setMrrDZD] = useState<number | ''>(100000);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
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
    setTier('growth');
    setActiveService('ERPNext Implementation');
    setContractValueDZD(2500000);
    setMrrDZD(100000);
    setStartDate(new Date().toISOString().slice(0, 10));
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
    setTier(c.tier);
    setActiveService(c.activeService);
    setContractValueDZD(c.contractValueDZD !== undefined ? c.contractValueDZD : '');
    setMrrDZD(c.mrrDZD !== undefined ? c.mrrDZD : '');
    setStartDate(c.startDate || new Date().toISOString().slice(0, 10));
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
      tier,
      activeService,
      contractValueDZD: contractValueDZD === '' ? 0 : Number(contractValueDZD),
      mrrDZD: mrrDZD === '' ? 0 : Number(mrrDZD),
      startDate,
      notes: notes.trim()
    };

    if (editingCustomer) {
      customerStorage.updateCustomer(editingCustomer.id, payload);
      showToast(`Updated customer "${company}"`);
    } else {
      customerStorage.saveCustomer(payload);
      showToast(`Added new customer "${company}"`);
    }

    setIsFormOpen(false);
    if (onCloseAddModal) onCloseAddModal();
    onRefresh();
  };

  const handleDeleteConfirm = () => {
    if (!customerToDelete) return;
    customerStorage.deleteCustomer(customerToDelete.id);
    showToast(`Deleted customer "${customerToDelete.company}"`);
    setCustomerToDelete(null);
    onRefresh();
  };

  const handleQuickStatusChange = (id: string, newStatus: CustomerStatus) => {
    customerStorage.updateCustomer(id, { status: newStatus });
    showToast(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
    onRefresh();
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = `${c.company} ${c.name} ${c.email} ${c.phone} ${c.location} ${c.industry} ${c.activeService}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }
      // Status
      if (currentStatusFilter !== 'all' && c.status !== currentStatusFilter) return false;
      // Tier
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
      return true;
    });
  }, [customers, searchQuery, currentStatusFilter, tierFilter]);

  // Statistics
  const totalValue = customers.reduce((sum, c) => sum + (c.contractValueDZD || 0), 0);
  const totalMrr = customers.reduce((sum, c) => sum + (c.mrrDZD || 0), 0);
  const activeCount = customers.filter(c => c.status === 'active').length;
  const onboardingCount = customers.filter(c => c.status === 'onboarding').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-[#e6f4f4] px-2.5 py-0.5 text-xs font-bold text-[#1b6b6a]">
              Customer Directory
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {filteredCustomers.length} of {customers.length} Accounts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Customer Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active ERPNext deployments, ISO 9001 certifications & retained SLAs
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="admin-export-customers-btn"
            onClick={() => customerStorage.exportCSV()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            id="admin-add-customer-btn"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#389695] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Accounts</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{customers.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active enterprise roster</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active Contracts</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{activeCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Under live operational SLA</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">In Onboarding</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-teal-700">{onboardingCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Implementation phase</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Monthly Recurring SLA</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-purple-700">
            {totalMrr.toLocaleString()} <span className="text-xs font-semibold text-slate-400">DZD/mo</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Total Pipeline: {totalValue.toLocaleString()} DZD
          </p>
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
              placeholder="Search company, contact person, email, city, industry..."
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
            {/* Status filter tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
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
                onClick={() => setStatus('onboarding')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentStatusFilter === 'onboarding' ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Onboarding ({onboardingCount})
              </button>
            </div>

            {/* Tier filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:border-[#44ACAB] outline-hidden"
            >
              <option value="all">All Tiers</option>
              <option value="enterprise">Enterprise Tier</option>
              <option value="growth">Growth Tier</option>
              <option value="standard">Standard Tier</option>
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
              {searchQuery || currentStatusFilter !== 'all' || tierFilter !== 'all'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'Get started by creating your first client account or converting a Won lead.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {(searchQuery || currentStatusFilter !== 'all' || tierFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatus('all');
                    setTierFilter('all');
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
                  <th className="py-3.5 px-4">Company & Tier</th>
                  <th className="py-3.5 px-4">Primary Contact</th>
                  <th className="py-3.5 px-4">Service & Location</th>
                  <th className="py-3.5 px-4">Contract / MRR</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCustomers.map((c) => {
                  const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.active;
                  const tierInfo = TIER_CONFIG[c.tier] || TIER_CONFIG.growth;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Company & Tier */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                            {c.company.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{c.company}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${tierInfo.bg} ${tierInfo.color} ${tierInfo.border}`}>
                                {tierInfo.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{c.industry || 'Enterprise'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-500">{c.jobTitle || 'Representative'}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
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

                      {/* Service & Location */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{c.activeService}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{c.location || 'Algeria'}</span>
                          <span className="text-slate-300">•</span>
                          <span>Since {c.startDate ? new Date(c.startDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>

                      {/* Contract / MRR */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">
                          {c.contractValueDZD ? `${c.contractValueDZD.toLocaleString()} DZD` : '—'}
                        </p>
                        <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
                          {c.mrrDZD ? `${c.mrrDZD.toLocaleString()} DZD / mo` : 'No recurring SLA'}
                        </p>
                      </td>

                      {/* Status with quick switcher */}
                      <td className="py-3.5 px-4">
                        <select
                          value={c.status}
                          onChange={(e) => handleQuickStatusChange(c.id, e.target.value as CustomerStatus)}
                          className={`text-[11px] font-bold py-1 px-2 rounded-lg border cursor-pointer outline-hidden ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                        >
                          <option value="active">Active Contract</option>
                          <option value="onboarding">In Onboarding</option>
                          <option value="paused">Suspended / Paused</option>
                          <option value="churned">Completed / Churned</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onFileClaimForCustomer && (
                            <button
                              onClick={() => onFileClaimForCustomer(c)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="File Claim / Support Ticket for this customer"
                            >
                              <LifeBuoy className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setViewingCustomer(c)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Account Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-slate-400 hover:text-[#44ACAB] hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit Account Details"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCustomerToDelete(c)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Account"
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

      {/* ADD / EDIT CUSTOMER MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#44ACAB]/15 text-[#1b6b6a]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCustomer ? 'Edit Customer Account' : 'Register New Customer Account'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Client credentials, service agreement details, and SLA parameters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCustomer} className="flex-1 overflow-y-auto custom-light-scrollbar px-6 py-5 space-y-4">
              {/* Row 1: Company & Contact Person */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Enterprise Name *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Cevital Agro, Biopharm, Condor..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. M. Karim Hadj"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.dz"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+213 550 00 00 00"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>
              </div>

              {/* Row 3: Role, Location & Industry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role / Function</label>
                  <select
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  >
                    {JOB_TITLE_PRESETS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Wilaya</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  >
                    {LOCATION_PRESETS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  >
                    {INDUSTRY_PRESETS.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Status, Tier & Active Service */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contract Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatusValue(e.target.value as CustomerStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  >
                    <option value="active">Active Contract</option>
                    <option value="onboarding">In Onboarding</option>
                    <option value="paused">Suspended / Paused</option>
                    <option value="churned">Completed / Churned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as CustomerTier)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  >
                    <option value="enterprise">Enterprise Tier</option>
                    <option value="growth">Growth Tier</option>
                    <option value="standard">Standard Tier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Active Service</label>
                  <select
                    value={activeService}
                    onChange={(e) => setActiveService(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  >
                    <option value="ERPNext Implementation">ERPNext Implementation</option>
                    <option value="ERPNext Pharma Suite & ISO 9001:2015">ERPNext Pharma & ISO 9001</option>
                    <option value="ISO 9001 Certification & Audit">ISO 9001 Certification & Audit</option>
                    <option value="Annual SLA Support & Hosting">Annual SLA Support & Hosting</option>
                    <option value="Frappe Custom Development">Frappe Custom Development</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Financials & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contract Value (DZD)</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={contractValueDZD}
                    onChange={(e) => setContractValueDZD(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="2500000"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Support (MRR DZD)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={mrrDZD}
                    onChange={(e) => setMrrDZD(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="120000"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Engagement Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Account Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key project goals, SLA terms, server credentials link, key account stakeholders..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#44ACAB] px-5 py-2 text-xs font-bold text-white hover:bg-[#389695] shadow-xs"
                >
                  {editingCustomer ? 'Update Account' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CUSTOMER PROFILE DRAWER / MODAL */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-sm">
                  {viewingCustomer.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewingCustomer.company}</h3>
                  <p className="text-xs text-slate-500">{viewingCustomer.industry || 'Client Enterprise'}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-light-scrollbar space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Tier</p>
                  <p className="font-bold text-purple-700 mt-0.5 capitalize">{viewingCustomer.tier} Tier</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                  <p className="font-bold text-emerald-700 mt-0.5 capitalize">{viewingCustomer.status}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Contact</p>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1.5">
                  <p className="font-bold text-slate-900 text-sm">{viewingCustomer.name}</p>
                  <p className="text-slate-500">{viewingCustomer.jobTitle || 'Executive'}</p>
                  <div className="flex flex-col gap-1 pt-1 text-slate-600">
                    <a href={`mailto:${viewingCustomer.email}`} className="flex items-center gap-2 hover:text-[#44ACAB]">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{viewingCustomer.email}</span>
                    </a>
                    {viewingCustomer.phone && (
                      <a href={`tel:${viewingCustomer.phone}`} className="flex items-center gap-2 hover:text-[#44ACAB]">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{viewingCustomer.phone}</span>
                      </a>
                    )}
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{viewingCustomer.location || 'Algeria'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Commercial Contract</p>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-bold text-slate-900">{viewingCustomer.activeService}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contract Value:</span>
                    <span className="font-bold text-slate-900">
                      {viewingCustomer.contractValueDZD ? `${viewingCustomer.contractValueDZD.toLocaleString()} DZD` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Monthly Support SLA:</span>
                    <span className="font-bold text-purple-700">
                      {viewingCustomer.mrrDZD ? `${viewingCustomer.mrrDZD.toLocaleString()} DZD/mo` : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Engagement Date:</span>
                    <span className="font-medium text-slate-700">
                      {viewingCustomer.startDate ? new Date(viewingCustomer.startDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {viewingCustomer.notes && (
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Internal Account Notes</p>
                  <p className="p-3 rounded-xl bg-slate-50 text-slate-700 leading-relaxed">
                    {viewingCustomer.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
              {onFileClaimForCustomer && (
                <button
                  onClick={() => {
                    const cust = viewingCustomer;
                    setViewingCustomer(null);
                    onFileClaimForCustomer(cust);
                  }}
                  className="rounded-xl border border-amber-300 bg-amber-50 text-amber-800 px-3.5 py-2 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5"
                >
                  <LifeBuoy className="h-3.5 w-3.5" />
                  <span>File Support Ticket / Claim</span>
                </button>
              )}
              <button
                onClick={() => {
                  const cust = viewingCustomer;
                  setViewingCustomer(null);
                  openEditModal(cust);
                }}
                className="rounded-xl bg-[#44ACAB] text-white px-4 py-2 text-xs font-bold hover:bg-[#389695]"
              >
                Edit Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Customer Account?</h3>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{customerToDelete.company}"</span>? This will permanently remove their records from your CRM database.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
