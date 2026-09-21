import { useState, useMemo, FormEvent } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  Building2,
  UserCheck,
  FileCheck2,
  Filter
} from 'lucide-react';
import { Claim, ClaimCategory, ClaimSeverity, ClaimStatus, Customer } from '../../types';
import { claimStorage } from '../../services/claimStorage';

const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; bg: string; border: string }> = {
  open: { label: 'Open / Unassigned', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  investigating: { label: 'Investigating', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  in_progress: { label: 'Action in Progress', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  resolved: { label: 'Resolved (CAPA Applied)', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  closed: { label: 'Closed / Verified', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' }
};

const SEVERITY_CONFIG: Record<ClaimSeverity, { label: string; color: string; bg: string; dot: string }> = {
  critical: { label: 'Critical (Blocker)', color: 'text-rose-700 bg-rose-50 border-rose-200', bg: 'bg-rose-50', dot: 'bg-rose-600' },
  high: { label: 'High Severity', color: 'text-amber-700 bg-amber-50 border-amber-200', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  medium: { label: 'Medium', color: 'text-blue-700 bg-blue-50 border-blue-200', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  low: { label: 'Low / Minor', color: 'text-slate-600 bg-slate-50 border-slate-200', bg: 'bg-slate-50', dot: 'bg-slate-400' }
};

const CATEGORY_CONFIG: Record<ClaimCategory, { label: string; tag: string }> = {
  erp_bug: { label: 'ERP / Frappe System Bug', tag: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  iso_non_conformity: { label: 'ISO 9001 Non-Conformity', tag: 'bg-amber-50 text-amber-800 border-amber-200' },
  service_delay: { label: 'Service / Milestone Delay', tag: 'bg-orange-50 text-orange-700 border-orange-200' },
  billing: { label: 'Billing / Invoice Dispute', tag: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  support_request: { label: 'Operational Support / Helpdesk', tag: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  training_gap: { label: 'User Training / Skill Gap', tag: 'bg-purple-50 text-purple-700 border-purple-200' }
};

interface ClaimViewProps {
  claims: Claim[];
  customers: Customer[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  initialCustomerForClaim?: Customer | null;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export function ClaimView({
  claims,
  customers,
  onRefresh,
  showToast,
  isAddModalOpen = false,
  onCloseAddModal,
  initialCustomerForClaim = null,
  statusFilter = 'all',
  onStatusFilterChange
}: ClaimViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const currentStatusFilter = onStatusFilterChange ? statusFilter : localStatusFilter;
  const setStatus = (val: string) => {
    if (onStatusFilterChange) onStatusFilterChange(val);
    else setLocalStatusFilter(val);
  };

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(isAddModalOpen || !!initialCustomerForClaim);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [viewingClaim, setViewingClaim] = useState<Claim | null>(null);
  const [claimToDelete, setClaimToDelete] = useState<Claim | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState(initialCustomerForClaim?.company || '');
  const [contactPerson, setContactPerson] = useState(initialCustomerForClaim?.name || '');
  const [email, setEmail] = useState(initialCustomerForClaim?.email || '');
  const [phone, setPhone] = useState(initialCustomerForClaim?.phone || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ClaimCategory>('erp_bug');
  const [severity, setSeverity] = useState<ClaimSeverity>('high');
  const [statusVal, setStatusVal] = useState<ClaimStatus>('open');
  const [description, setDescription] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [assignedTo, setAssignedTo] = useState('Lead Support Engineer');

  const openAddModal = () => {
    setEditingClaim(null);
    setCustomerName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setTitle('');
    setCategory('erp_bug');
    setSeverity('high');
    setStatusVal('open');
    setDescription('');
    setCorrectiveAction('');
    setAssignedTo('Lead Support Engineer');
    setIsFormOpen(true);
  };

  const openEditModal = (clm: Claim) => {
    setEditingClaim(clm);
    setCustomerName(clm.customerName);
    setContactPerson(clm.contactPerson);
    setEmail(clm.email);
    setPhone(clm.phone || '');
    setTitle(clm.title);
    setCategory(clm.category);
    setSeverity(clm.severity);
    setStatusVal(clm.status);
    setDescription(clm.description);
    setCorrectiveAction(clm.correctiveAction || '');
    setAssignedTo(clm.assignedTo || 'Lead Support Engineer');
    setIsFormOpen(true);
  };

  const handleSelectExistingCustomer = (custName: string) => {
    setCustomerName(custName);
    const found = customers.find(c => c.company === custName);
    if (found) {
      setContactPerson(found.name);
      setEmail(found.email);
      setPhone(found.phone);
    }
  };

  const handleSaveClaim = (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !title.trim() || !description.trim()) {
      showToast('Please fill in customer name, claim title, and description');
      return;
    }

    const payload = {
      customerName: customerName.trim(),
      contactPerson: contactPerson.trim() || 'Client Contact',
      email: email.trim(),
      phone: phone.trim(),
      title: title.trim(),
      category,
      severity,
      status: statusVal,
      description: description.trim(),
      correctiveAction: correctiveAction.trim(),
      assignedTo: assignedTo.trim()
    };

    if (editingClaim) {
      claimStorage.updateClaim(editingClaim.id, payload);
      showToast(`Updated claim ${editingClaim.claimNumber}`);
    } else {
      const created = claimStorage.saveClaim(payload);
      showToast(`Filed new claim ${created.claimNumber}`);
    }

    setIsFormOpen(false);
    if (onCloseAddModal) onCloseAddModal();
    onRefresh();
  };

  const handleDeleteConfirm = () => {
    if (!claimToDelete) return;
    claimStorage.deleteClaim(claimToDelete.id);
    showToast(`Deleted claim ${claimToDelete.claimNumber}`);
    setClaimToDelete(null);
    onRefresh();
  };

  const handleQuickStatusChange = (id: string, newStatus: ClaimStatus) => {
    claimStorage.updateClaim(id, { status: newStatus });
    showToast(`Claim status changed to ${STATUS_CONFIG[newStatus].label}`);
    onRefresh();
  };

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const full = `${c.claimNumber} ${c.title} ${c.customerName} ${c.contactPerson} ${c.email} ${c.description} ${c.assignedTo || ''}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      // Status
      if (currentStatusFilter !== 'all' && c.status !== currentStatusFilter) return false;
      // Severity
      if (severityFilter !== 'all' && c.severity !== severityFilter) return false;
      // Category
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      return true;
    });
  }, [claims, searchQuery, currentStatusFilter, severityFilter, categoryFilter]);

  // Statistics
  const openCount = claims.filter(c => c.status === 'open').length;
  const inProgressCount = claims.filter(c => c.status === 'in_progress' || c.status === 'investigating').length;
  const resolvedCount = claims.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const criticalCount = claims.filter(c => c.severity === 'critical' && (c.status === 'open' || c.status === 'in_progress')).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
              ISO 9001 & Support Desk
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {filteredClaims.length} of {claims.length} Claims Filed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Claims & Non-Conformity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Customer complaints, Frappe / ERPNext defect reports & CAPA resolutions
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="admin-export-claims-btn"
            onClick={() => claimStorage.exportCSV()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            id="admin-add-claim-btn"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#389695] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>File New Claim</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Open Tickets</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-700">{openCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting initial evaluation</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active CAPA / In Progress</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-blue-700">{inProgressCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Corrective actions ongoing</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Resolved & Closed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{resolvedCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Solution confirmed by client</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Critical Priority</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-700">{criticalCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">High SLA attention needed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="admin-claims-search"
              type="text"
              placeholder="Search claim #, customer, description, assigned engineer..."
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
            {/* Status tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({claims.length})
              </button>
              <button
                onClick={() => setStatus('open')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentStatusFilter === 'open' ? 'bg-rose-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Open ({openCount})
              </button>
              <button
                onClick={() => setStatus('in_progress')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentStatusFilter === 'in_progress' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                onClick={() => setStatus('resolved')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentStatusFilter === 'resolved' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>

            {/* Severity filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:border-[#44ACAB] outline-hidden"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:border-[#44ACAB] outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="erp_bug">ERP / System Bug</option>
              <option value="iso_non_conformity">ISO Non-Conformity</option>
              <option value="service_delay">Service Delay</option>
              <option value="billing">Billing Dispute</option>
              <option value="support_request">Helpdesk Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filteredClaims.length === 0 ? (
          <div className="py-16 text-center px-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-900">No claims or non-conformities found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || currentStatusFilter !== 'all' || severityFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'All clear! No customer claims or quality discrepancies currently open.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={openAddModal}
                className="rounded-xl bg-[#44ACAB] px-4 py-2 text-xs font-bold text-white hover:bg-[#389695]"
              >
                + File New Claim
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-light-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Claim # & Date</th>
                  <th className="py-3.5 px-4">Customer & Contact</th>
                  <th className="py-3.5 px-4">Issue Description & Category</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Resolution Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredClaims.map((c) => {
                  const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
                  const sevInfo = SEVERITY_CONFIG[c.severity] || SEVERITY_CONFIG.medium;
                  const catInfo = CATEGORY_CONFIG[c.category] || CATEGORY_CONFIG.erp_bug;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Claim Number & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-xs">
                          {c.claimNumber}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-teal-50 text-[#1b6b6a] font-bold flex items-center justify-center text-xs shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.customerName}</p>
                            <p className="text-[11px] text-slate-500">{c.contactPerson}</p>
                          </div>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2">
                          {c.email && (
                            <a href={`mailto:${c.email}`} className="hover:text-[#44ACAB] flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{c.email}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Issue Description & Category */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catInfo.tag}`}>
                            {catInfo.label}
                          </span>
                          {c.assignedTo && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                              <UserCheck className="h-3 w-3 text-slate-400" />
                              <span>{c.assignedTo}</span>
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-900 line-clamp-1">{c.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{c.description}</p>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${sevInfo.color}`}>
                          <span className={`h-2 w-2 rounded-full ${sevInfo.dot} ${c.severity === 'critical' ? 'animate-pulse' : ''}`} />
                          <span>{sevInfo.label}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={c.status}
                          onChange={(e) => handleQuickStatusChange(c.id, e.target.value as ClaimStatus)}
                          className={`text-[11px] font-bold py-1 px-2 rounded-lg border cursor-pointer outline-hidden ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                        >
                          <option value="open">Open / Unassigned</option>
                          <option value="investigating">Investigating</option>
                          <option value="in_progress">Action in Progress</option>
                          <option value="resolved">Resolved (CAPA Applied)</option>
                          <option value="closed">Closed / Verified</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingClaim(c)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Full Claim & CAPA Audit"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-slate-400 hover:text-[#44ACAB] hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit Claim Details"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setClaimToDelete(c)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Claim"
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

      {/* ADD / EDIT CLAIM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingClaim ? `Edit Claim ${editingClaim.claimNumber}` : 'File New Customer Claim / Discrepancy'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ISO 9001 non-conformance logging, incident tracking & CAPA resolution
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
            <form onSubmit={handleSaveClaim} className="flex-1 overflow-y-auto custom-light-scrollbar px-6 py-5 space-y-4">
              {/* Row 1: Customer Name & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Account *
                  </label>
                  {customers.length > 0 && (
                    <select
                      value={customerName}
                      onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden mb-1.5"
                    >
                      <option value="">-- Choose Existing Account or Custom --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.company}>{c.company}</option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter or confirm company name..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person & Email</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Contact Person (e.g. M. Karim Hadj)"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@company.dz"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Claim Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Claim Summary / Subject *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ERPNext VAT calculation discrepancy in invoice printing..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#44ACAB] outline-hidden"
                />
              </div>

              {/* Row 3: Category, Severity, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discrepancy Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ClaimCategory)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  >
                    <option value="erp_bug">ERP / System Bug</option>
                    <option value="iso_non_conformity">ISO 9001 Non-Conformity</option>
                    <option value="service_delay">Service / Milestone Delay</option>
                    <option value="billing">Billing Dispute</option>
                    <option value="support_request">Operational Helpdesk</option>
                    <option value="training_gap">User Training Gap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as ClaimSeverity)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  >
                    <option value="critical">Critical (Blocker / Stop Production)</option>
                    <option value="high">High Severity</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low / Minor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Investigation Status</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value as ClaimStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  >
                    <option value="open">Open / Unassigned</option>
                    <option value="investigating">Investigating</option>
                    <option value="in_progress">Action in Progress</option>
                    <option value="resolved">Resolved (CAPA Applied)</option>
                    <option value="closed">Closed / Verified</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Assigned To & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Consultant / Engineer</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="e.g. Lead ERP Engineer, Senior ISO Auditor..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+213 550 00 00 00"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                  />
                </div>
              </div>

              {/* Row 5: Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Incident Description & Findings *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of the issue encountered, steps to reproduce or ISO audit observation..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#44ACAB] outline-hidden"
                />
              </div>

              {/* Row 6: Corrective and Preventive Action (CAPA) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileCheck2 className="h-4 w-4 text-emerald-600" />
                    <span>Corrective & Preventive Action (CAPA - ISO 9001 Plan)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Continuous Improvement</span>
                </div>
                <textarea
                  rows={2}
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  placeholder="Root cause diagnosis, code patch applied, SOP adjustment, and preventive measures implemented..."
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
                  {editingClaim ? 'Update Claim' : 'Register Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CLAIM PROFILE MODAL */}
      {viewingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                      {viewingClaim.claimNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      Filed {new Date(viewingClaim.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{viewingClaim.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setViewingClaim(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-light-scrollbar space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Severity</p>
                  <p className="font-bold text-rose-700 mt-0.5 capitalize">{viewingClaim.severity}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                  <p className="font-bold text-slate-800 mt-0.5 capitalize">{STATUS_CONFIG[viewingClaim.status]?.label}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Account</p>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
                  <p className="font-bold text-slate-900 text-sm">{viewingClaim.customerName}</p>
                  <p className="text-slate-600">Contact: {viewingClaim.contactPerson}</p>
                  <p className="text-slate-500">{viewingClaim.email} {viewingClaim.phone ? `• ${viewingClaim.phone}` : ''}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Discrepancy Details</p>
                <div className="p-3.5 rounded-xl bg-slate-50 text-slate-800 leading-relaxed">
                  {viewingClaim.description}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4" />
                  <span>Corrective & Preventive Action (CAPA Plan)</span>
                </p>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-900 leading-relaxed">
                  {viewingClaim.correctiveAction || 'CAPA investigation in progress by lead technical consultant.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700">Assigned To: </span>
                  {viewingClaim.assignedTo || 'Unassigned'}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Resolved Date: </span>
                  {viewingClaim.resolvedAt ? new Date(viewingClaim.resolvedAt).toLocaleDateString() : 'Pending'}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const clm = viewingClaim;
                  setViewingClaim(null);
                  openEditModal(clm);
                }}
                className="rounded-xl bg-[#44ACAB] text-white px-4 py-2 text-xs font-bold hover:bg-[#389695]"
              >
                Edit Claim & CAPA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {claimToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Claim Record?</h3>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete claim <span className="font-mono font-bold text-slate-900">{claimToDelete.claimNumber}</span> for <span className="font-bold">{claimToDelete.customerName}</span>?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setClaimToDelete(null)}
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
