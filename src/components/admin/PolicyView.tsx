import { useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Search, 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Tag, 
  Eye, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { CompanyPolicy, PolicyCategory, PolicyStatus } from '../../types';
import { policyStorage } from '../../services/policyStorage';

interface PolicyViewProps {
  policies: CompanyPolicy[];
  onRefresh: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORIES: PolicyCategory[] = [
  'Quality & ISO 9001',
  'Security & Privacy',
  'Sales & Commercial',
  'Operations & SLA',
  'HR & Workplace'
];

export function PolicyView({ policies, onRefresh, showToast }: PolicyViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals
  const [viewingPolicy, setViewingPolicy] = useState<CompanyPolicy | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CompanyPolicy | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<CompanyPolicy | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: PolicyCategory;
    version: string;
    status: PolicyStatus;
    effectiveDate: string;
    reviewDate: string;
    author: string;
    summary: string;
    content: string;
    mandatoryFor: string;
    tags: string;
  }>({
    title: '',
    category: 'Quality & ISO 9001',
    version: 'v1.0',
    status: 'active',
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: '',
    author: 'JetNext Admin',
    summary: '',
    content: '',
    mandatoryFor: 'All Team Members',
    tags: 'Compliance, Standards'
  });

  // Filtered Policies
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));

      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [policies, searchTerm, categoryFilter, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: policies.length,
      active: policies.filter(p => p.status === 'active').length,
      underReview: policies.filter(p => p.status === 'under_review').length,
      isoQuality: policies.filter(p => p.category === 'Quality & ISO 9001').length
    };
  }, [policies]);

  const handleOpenAdd = () => {
    setEditingPolicy(null);
    setFormData({
      title: '',
      category: 'Quality & ISO 9001',
      version: 'v1.0',
      status: 'active',
      effectiveDate: new Date().toISOString().split('T')[0],
      reviewDate: '',
      author: 'JetNext Admin',
      summary: '',
      content: '',
      mandatoryFor: 'All Team Members',
      tags: 'Compliance, Standard'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (policy: CompanyPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      category: policy.category,
      version: policy.version,
      status: policy.status,
      effectiveDate: policy.effectiveDate,
      reviewDate: policy.reviewDate || '',
      author: policy.author,
      summary: policy.summary,
      content: policy.content,
      mandatoryFor: policy.mandatoryFor.join(', '),
      tags: policy.tags.join(', ')
    });
    setIsFormOpen(true);
  };

  const handleSavePolicy = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim()) {
      showToast('Title, Summary, and Policy Content are required.', 'error');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      version: formData.version.trim() || 'v1.0',
      status: formData.status,
      effectiveDate: formData.effectiveDate,
      reviewDate: formData.reviewDate ? formData.reviewDate : undefined,
      author: formData.author.trim() || 'JetNext Admin',
      summary: formData.summary.trim(),
      content: formData.content.trim(),
      mandatoryFor: formData.mandatoryFor.split(',').map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editingPolicy) {
        await policyStorage.updatePolicy(editingPolicy.id, payload);
        showToast(`Policy "${payload.title}" updated successfully!`, 'success');
      } else {
        await policyStorage.createPolicy(payload);
        showToast(`New policy "${payload.title}" published!`, 'success');
      }
      setIsFormOpen(false);
      setEditingPolicy(null);
      onRefresh();
    } catch {
      showToast('Error saving policy document.', 'error');
    }
  };

  const handleDeletePolicy = async () => {
    if (!deletingPolicy) return;
    try {
      await policyStorage.deletePolicy(deletingPolicy.id);
      showToast(`Policy "${deletingPolicy.title}" deleted.`, 'info');
      setDeletingPolicy(null);
      onRefresh();
    } catch {
      showToast('Failed to delete policy.', 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('Restore default organizational policies & compliance standards?')) {
      await policyStorage.resetToDefaults();
      showToast('Default policies restored.', 'success');
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
              <FileText className="h-3.5 w-3.5" />
              Company Policies & Governance
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firestore Synced
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ISO 9001 & Compliance Registry
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Policies, Standards & Guidelines
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Official operational procedures, ISO 9001 quality rules, SLA response criteria, and confidentiality standards for the JetNext team.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => policyStorage.exportCSV()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="admin-create-policy-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1b6b6a] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#155453] transition-all transform hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Policy</span>
          </button>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Policies</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{metrics.total}</p>
          <p className="mt-0.5 text-xs text-slate-400">In directory</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-emerald-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Active & In Force</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{metrics.active}</p>
          <p className="mt-0.5 text-xs text-slate-400">Operational standards</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-rose-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">ISO 9001 Quality</p>
          <p className="mt-1 text-2xl font-black text-rose-600">{metrics.isoQuality}</p>
          <p className="mt-0.5 text-xs text-slate-400">Quality & CAPA rules</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-amber-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Under Review</p>
          <p className="mt-1 text-2xl font-black text-amber-600">{metrics.underReview}</p>
          <p className="mt-0.5 text-xs text-slate-400">Annual audit pending</p>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search policies, ISO rules, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#44ACAB] focus:outline-hidden"
          >
            <option value="all">All Categories ({policies.length})</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat} ({policies.filter(p => p.category === cat).length})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#44ACAB] focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="under_review">Under Review</option>
            <option value="archived">Archived</option>
          </select>

          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── POLICIES CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPolicies.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-white p-12 text-center shadow-xs ring-1 ring-slate-200">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-700">No policy documents match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search keywords or filter options.</p>
          </div>
        ) : (
          filteredPolicies.map((policy) => {
            const isISO = policy.category === 'Quality & ISO 9001';
            return (
              <div
                key={policy.id}
                className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-200 hover:shadow-md hover:ring-[#44ACAB]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                        isISO
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : policy.category === 'Security & Privacy'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : policy.category === 'Operations & SLA'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <ShieldCheck className="h-3 w-3" />
                        {policy.category}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {policy.version}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      policy.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : policy.status === 'under_review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        policy.status === 'active' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`} />
                      {policy.status === 'active' ? 'In Force' : policy.status === 'under_review' ? 'Reviewing' : 'Archived'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-[#1b6b6a] cursor-pointer transition-colors"
                    onClick={() => setViewingPolicy(policy)}
                  >
                    {policy.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {policy.summary}
                  </p>

                  {/* Mandatory Audience */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scope:</span>
                    {(policy.mandatoryFor || []).map((scope, idx) => (
                      <span key={idx} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {scope}
                      </span>
                    ))}
                  </div>

                  {/* Tags */}
                  {policy.tags && policy.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {policy.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">
                          <Tag className="h-2.5 w-2.5" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Effective: <strong>{policy.effectiveDate}</strong></span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingPolicy(policy)}
                      className="p-1.5 text-slate-500 hover:text-[#1b6b6a] hover:bg-teal-50 rounded-lg transition-colors"
                      title="Read Policy Document"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(policy)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Policy"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingPolicy(policy)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Policy"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Table Footer Reset */}
      <div className="border-t border-slate-200 bg-slate-50/70 p-4 rounded-xl flex items-center justify-between text-xs text-slate-500">
        <span>Showing <strong>{filteredPolicies.length}</strong> of <strong>{policies.length}</strong> policy documents</span>
        <button
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Restore Default Policies</span>
        </button>
      </div>

      {/* ── POLICY READER MODAL ── */}
      <AnimatePresence>
        {viewingPolicy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col relative"
            >
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between text-white shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                      {viewingPolicy.category} • {viewingPolicy.version}
                    </span>
                    <h3 className="font-bold text-base leading-tight">
                      {viewingPolicy.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setViewingPolicy(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-dark-scrollbar">
                {/* Meta details bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Status</span>
                    <span className="font-bold text-emerald-700 capitalize">{viewingPolicy.status.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Effective Date</span>
                    <span className="font-bold text-slate-800">{viewingPolicy.effectiveDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Author</span>
                    <span className="font-bold text-slate-800 truncate block">{viewingPolicy.author}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Next Review</span>
                    <span className="font-bold text-slate-800">{viewingPolicy.reviewDate || 'Annual'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Executive Summary</h4>
                  <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 text-xs text-slate-800 font-medium leading-relaxed">
                    {viewingPolicy.summary}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Official Standard Operating Text</h4>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                    {viewingPolicy.content}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-500">Applicable Audience:</span>
                    <span className="text-slate-700">{viewingPolicy.mandatoryFor.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {viewingPolicy.tags.map((t, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <button
                  onClick={() => {
                    const toEdit = viewingPolicy;
                    setViewingPolicy(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1b6b6a] hover:underline"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit this Document</span>
                </button>
                <button
                  onClick={() => setViewingPolicy(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD / EDIT POLICY MODAL ── */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col relative"
            >
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between text-white shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#44ACAB]/20 text-[#44ACAB]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">
                      {editingPolicy ? 'Edit Policy Document' : 'Create New Policy'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Publish compliance rules, ISO operating guidelines, and client SLA standards
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSavePolicy} className="flex-1 overflow-y-auto min-h-0 flex flex-col custom-dark-scrollbar">
                <div className="p-6 space-y-4 flex-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Policy Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ISO 9001:2015 Incident CAPA & Root-Cause Policy"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as PolicyCategory })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Version *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="v1.0"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as PolicyStatus })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      >
                        <option value="active">Active (In Force)</option>
                        <option value="under_review">Under Review</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Effective Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.effectiveDate}
                        onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Author / Sponsor
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="e.g. Rayan Aouf (CEO)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Executive Summary *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Brief overview explaining why this policy exists and key principles..."
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Full Policy Text / Clauses *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Section 1. Purpose&#10;Section 2. Mandatory Procedures..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 font-mono focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Mandatory Audience (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="All Employees, Support, Sales"
                        value={formData.mandatoryFor}
                        onChange={(e) => setFormData({ ...formData, mandatoryFor: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="ISO 9001, SLA, Warranty"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0 sticky bottom-0 z-20">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#1b6b6a] hover:bg-[#155453] px-5 py-2 text-xs font-bold text-white shadow-md transition-all"
                  >
                    {editingPolicy ? 'Save Changes' : 'Publish Policy'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deletingPolicy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 text-center my-auto"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Policy?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>"{deletingPolicy.title}"</strong> from the governance repository?
              </p>

              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingPolicy(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePolicy}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
