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
  BookOpen,
  Calendar,
  Sparkles,
  Info,
  Lock,
  Layers,
  CheckSquare,
  ListTodo
} from 'lucide-react';
import { CompanyPolicy, PolicyCategory, PolicyStatus, PolicyType, POLICY_TYPES, PolicyTask } from '../../types';
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
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals
  const [viewingPolicy, setViewingPolicy] = useState<CompanyPolicy | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CompanyPolicy | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<CompanyPolicy | null>(null);

  // Form State
  const [formTasks, setFormTasks] = useState<PolicyTask[]>([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [formData, setFormData] = useState<{
    title: string;
    type: PolicyType;
    category: PolicyCategory | string;
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
    type: 'other',
    category: 'Operations & SLA',
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
        p.type.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));

      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [policies, searchTerm, typeFilter, statusFilter]);

  // Quota counts for each policy type
  const typeQuotas = useMemo(() => {
    return POLICY_TYPES.map((t) => {
      const existing = policies.filter((p) => p.type === t.id);
      return {
        ...t,
        count: existing.length,
        isFilled: t.isSingleton && existing.length >= 1,
        existingPolicy: existing[0]
      };
    });
  }, [policies]);

  // General metrics
  const metrics = useMemo(() => {
    return {
      total: policies.length,
      active: policies.filter(p => p.status === 'active').length,
      singletonsCreated: policies.filter(p => p.type !== 'other').length,
      othersCreated: policies.filter(p => p.type === 'other').length
    };
  }, [policies]);

  const handleOpenAdd = (presetType?: PolicyType) => {
    // Choose selected or first available type
    let chosenType: PolicyType = 'other';
    if (presetType) {
      const isTaken = presetType !== 'other' && policies.some(p => p.type === presetType);
      if (isTaken) {
        showToast(`A policy for "${presetType}" already exists (max 1 allowed). Defaulting to "other". You can edit the existing one instead.`, 'info');
        chosenType = 'other';
      } else {
        chosenType = presetType;
      }
    } else {
      // Find first available singleton type, or fall back to 'other'
      const available = POLICY_TYPES.find(t => t.id !== 'other' && !policies.some(p => p.type === t.id));
      chosenType = available ? available.id : 'other';
    }

    setEditingPolicy(null);
    if (chosenType === 'Event policy') {
      setFormTasks([
        { id: `ptask-${Date.now()}-1`, title: 'Verify booth marketing banners, brochures & company collateral', isMandatory: true },
        { id: `ptask-${Date.now()}-2`, title: 'Deploy and test offline & cloud ERPNext / IoT live demo sandbox', isMandatory: true },
        { id: `ptask-${Date.now()}-3`, title: 'Confirm team attendees, corporate attire standards & badges', isMandatory: true },
        { id: `ptask-${Date.now()}-4`, title: 'Set up digital lead scanner, QR code & CRM real-time intake form', isMandatory: true },
        { id: `ptask-${Date.now()}-5`, title: 'Verify venue logistics, power backups & presentation slides', isMandatory: false },
        { id: `ptask-${Date.now()}-6`, title: 'Schedule 24h post-event commercial follow-up & debrief', isMandatory: true }
      ]);
    } else {
      setFormTasks([]);
    }
    setNewTaskInput('');
    setFormData({
      title: '',
      type: chosenType,
      category: 'Operations & SLA',
      version: 'v1.0',
      status: 'active',
      effectiveDate: new Date().toISOString().split('T')[0],
      reviewDate: '',
      author: 'JetNext Admin',
      summary: '',
      content: '',
      mandatoryFor: 'All Team Members',
      tags: `${chosenType}, Standard`
    });
    setIsFormOpen(true);
    setTimeout(() => {
      document.getElementById('policy-editor-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleOpenEdit = (policy: CompanyPolicy) => {
    setEditingPolicy(policy);
    setFormTasks(policy.tasks ? [...policy.tasks] : []);
    setNewTaskInput('');
    setFormData({
      title: policy.title,
      type: policy.type,
      category: policy.category || 'Operations & SLA',
      version: policy.version,
      status: policy.status,
      effectiveDate: policy.effectiveDate,
      reviewDate: policy.reviewDate || '',
      author: policy.author,
      summary: policy.summary,
      content: policy.content,
      mandatoryFor: (policy.mandatoryFor || []).join(', '),
      tags: (policy.tags || []).join(', ')
    });
    setIsFormOpen(true);
    setTimeout(() => {
      document.getElementById('policy-editor-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleSavePolicy = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim()) {
      showToast('Title, Summary, and Policy Content are required.', 'error');
      return;
    }

    // Check Singleton constraint
    if (formData.type !== 'other') {
      const existing = policies.find((p) => p.type === formData.type && p.id !== editingPolicy?.id);
      if (existing) {
        showToast(
          `Cannot save: A policy of type "${formData.type}" already exists ("${existing.title}"). Only one is permitted.`,
          'error'
        );
        return;
      }
    }

    const payload = {
      title: formData.title.trim(),
      type: formData.type,
      category: formData.category,
      version: formData.version.trim() || 'v1.0',
      status: formData.status,
      effectiveDate: formData.effectiveDate,
      reviewDate: formData.reviewDate ? formData.reviewDate : undefined,
      author: formData.author.trim() || 'JetNext Admin',
      summary: formData.summary.trim(),
      content: formData.content.trim(),
      mandatoryFor: formData.mandatoryFor.split(',').map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
      tasks: formTasks
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error saving policy document.';
      showToast(msg, 'error');
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

  const getTypeColor = (type: PolicyType) => {
    switch (type) {
      case 'Event policy':
        return { badge: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' };
      case 'Cleaning Policy':
        return { badge: 'bg-teal-100 text-teal-800 border-teal-200', dot: 'bg-teal-500' };
      case 'Recrutment Policy':
        return { badge: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' };
      case 'Dayly policy':
        return { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
      case 'Weekly Policy':
        return { badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' };
      case 'other':
      default:
        return { badge: 'bg-slate-100 text-slate-800 border-slate-200', dot: 'bg-slate-500' };
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
              Company Policy System
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firestore Synced
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Singleton Constraints Active
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Policies & Operating Standards
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Official operational policies: Event, Cleaning, Recrutment, Dayly, and Weekly policies (1 allowed per type), plus unlimited general policies under Other.
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
            onClick={() => {
              if (isFormOpen && !editingPolicy) {
                setIsFormOpen(false);
              } else {
                handleOpenAdd();
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1b6b6a] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#155453] transition-all transform hover:scale-[1.01]"
          >
            {isFormOpen && !editingPolicy ? (
              <>
                <X className="h-4 w-4" />
                <span>Close Form</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>+ New Policy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── ON-PAGE CREATE / EDIT POLICY FORM ── */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            id="policy-editor-form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-white shadow-md ring-1 ring-slate-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#44ACAB]/20 text-[#44ACAB]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingPolicy ? `Edit Policy Document: ${editingPolicy.title}` : 'Create New Policy Document'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Select policy type (1 allowed per specific type, unlimited for 'Other')
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingPolicy(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                title="Close Form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="flex flex-col">
              <div className="p-6 space-y-4">
                
                {/* POLICY TYPE SELECTION (SINGLETON RULE ENFORCEMENT) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                    <span>Policy Type *</span>
                    <span className="text-[11px] font-normal text-slate-500">1 max per specific type • Unlimited for "other"</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {POLICY_TYPES.map((t) => {
                      const isSelected = formData.type === t.id;
                      const isSingleton = t.isSingleton;
                      const existing = policies.find(p => p.type === t.id && p.id !== editingPolicy?.id);
                      const isTaken = isSingleton && Boolean(existing);

                      return (
                        <div
                          key={t.id}
                          className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                            isTaken 
                              ? 'opacity-85 bg-slate-50/90 border-amber-200/80'
                              : isSelected
                              ? 'border-[#44ACAB] bg-[#e6f4f4] ring-2 ring-[#44ACAB]/40 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <button
                            type="button"
                            disabled={isTaken}
                            onClick={() => setFormData({ ...formData, type: t.id })}
                            className={`w-full text-left ${isTaken ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-bold ${isTaken ? 'text-slate-600 line-through decoration-amber-500/50' : isSelected ? 'text-[#1b6b6a]' : 'text-slate-800'}`}>
                                {t.label}
                              </span>
                              {isSingleton ? (
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                  isTaken ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {isTaken ? '1/1 Reached' : '0/1 Available'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 shrink-0">
                                  Unlimited
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{t.description}</p>
                          </button>

                          {isTaken && existing && (
                            <div className="mt-1.5 pt-1.5 border-t border-amber-100/90 flex items-center justify-between text-[10px]">
                              <span className="text-amber-800 truncate max-w-[120px]" title={existing.title}>
                                "{existing.title}"
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(existing);
                                }}
                                className="text-amber-900 font-bold hover:underline shrink-0 ml-1"
                              >
                                Edit instead →
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* POLICY CREATION RULES INFO BANNER */}
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-[#1b6b6a] shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed text-slate-600 space-y-0.5">
                      <span className="font-bold text-slate-800">Policy Rules:</span> Exactly <strong>1</strong> policy can be created for <em>Event policy</em>, <em>Cleaning Policy</em>, <em>Recrutment Policy</em>, <em>Dayly policy</em>, and <em>Weekly Policy</em>. For <em>other</em>, you can create as many policies as needed.
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Policy Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Workplace Sanitization & Cleaning Policy"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    placeholder="Brief overview explaining purpose and primary requirements..."
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
                    placeholder="Section 1. Purpose&#10;Section 2. Standard Operating Procedures..."
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
                      placeholder="ISO 9001, Checklist, Guidelines"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* ── EVENT PREPARATION CHECKLIST TASKS ── */}
                <div className="pt-3 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <CheckSquare className="h-4 w-4 text-[#1b6b6a]" />
                        <span>Preparation Checklist Tasks ({formTasks.length})</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        These tasks will automatically appear on all future corporate events as a preparation checklist before attending and presenting.
                      </p>
                    </div>
                  </div>

                  {/* Task items list */}
                  <div className="space-y-2 mb-3">
                    {formTasks.length === 0 ? (
                      <div className="p-3.5 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-400">
                        No preparation checklist tasks added yet. Add tasks below to enforce event readiness.
                      </div>
                    ) : (
                      formTasks.map((task, idx) => (
                        <div key={task.id || idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => {
                              const next = [...formTasks];
                              next[idx].title = e.target.value;
                              setFormTasks(next);
                            }}
                            placeholder="Task title..."
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-hidden focus:border-[#44ACAB]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...formTasks];
                              next[idx].isMandatory = !next[idx].isMandatory;
                              setFormTasks(next);
                            }}
                            className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors shrink-0 ${
                              task.isMandatory
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {task.isMandatory ? 'Required' : 'Optional'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormTasks(formTasks.filter((_, i) => i !== idx));
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors shrink-0"
                            title="Remove task"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Task Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTaskInput.trim()) {
                            setFormTasks([
                              ...formTasks,
                              {
                                id: `ptask-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                title: newTaskInput.trim(),
                                isMandatory: true
                              }
                            ]);
                            setNewTaskInput('');
                          }
                        }
                      }}
                      placeholder="e.g. Verify marketing roll-ups and client demo credentials..."
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#44ACAB] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTaskInput.trim()) {
                          setFormTasks([
                            ...formTasks,
                            {
                              id: `ptask-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                              title: newTaskInput.trim(),
                              isMandatory: true
                            }
                          ]);
                          setNewTaskInput('');
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-800 text-white px-3 py-1.5 text-xs font-bold hover:bg-slate-900 transition-colors shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingPolicy(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1b6b6a] hover:bg-[#155453] px-5 py-2 text-xs font-bold text-white shadow-md transition-all"
                >
                  {editingPolicy ? 'Save Changes' : 'Publish Policy Document'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="rounded-2xl bg-white p-3.5 sm:p-4 shadow-xs ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-64 md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="admin-search-policies"
              type="text"
              placeholder="Search policies, tags, authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          {/* Policy Types & Allocation Limits Dropdown Filter (right side of search bar) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Type & Limit:</span>
            <select
              id="admin-policy-type-quota-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 transition-all shadow-2xs"
            >
              <option value="all">All Policy Types & Limits ({policies.length})</option>
              {typeQuotas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} • {t.isSingleton ? (t.isFilled ? '1/1 Allocated (Max 1)' : '0/1 Available (Max 1)') : `${t.count} Policies (Unlimited)`}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
            <select
              id="admin-policy-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 transition-all shadow-2xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="under_review">Under Review</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Quick Create shortcut if an unfilled singleton type is selected */}
          {typeFilter !== 'all' && (() => {
            const selectedQuota = typeQuotas.find(t => t.id === typeFilter);
            if (selectedQuota && selectedQuota.isSingleton && !selectedQuota.isFilled) {
              return (
                <button
                  type="button"
                  onClick={() => handleOpenAdd(selectedQuota.id)}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create {selectedQuota.label}</span>
                </button>
              );
            }
            return null;
          })()}

          {/* Reset Filters button */}
          {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
              className="ml-auto text-xs font-bold text-[#1b6b6a] hover:text-[#155453] hover:underline whitespace-nowrap pl-1"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* ── POLICIES CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPolicies.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-white p-12 text-center shadow-xs ring-1 ring-slate-200">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-700">No policy documents found</p>
            <p className="text-xs text-slate-400 mt-1">
              {policies.length === 0
                ? "Start building your organization's governance by publishing your first policy document."
                : 'Try adjusting your search keywords or filter options.'}
            </p>
            {policies.length === 0 && (
              <button
                type="button"
                onClick={() => handleOpenAdd()}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#1b6b6a] px-4 py-2 text-xs font-bold text-white hover:bg-[#155453] transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Policy</span>
              </button>
            )}
          </div>
        ) : (
          filteredPolicies.map((policy) => {
            const colors = getTypeColor(policy.type);
            const isSingleton = policy.type !== 'other';

            return (
              <div
                key={policy.id}
                className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-200 hover:shadow-md hover:ring-[#44ACAB]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Policy Type Badge */}
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${colors.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                        {policy.type}
                      </span>

                      {isSingleton ? (
                        <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded" title="Only 1 instance allowed of this policy type">
                          <Lock className="h-2.5 w-2.5 mr-0.5 text-slate-400" />
                          Singleton (Limit 1)
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                          Other (Unlimited)
                        </span>
                      )}

                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {policy.version}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audience:</span>
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

                  {/* Preparation Checklist Tasks */}
                  {policy.tasks && policy.tasks.length > 0 && (
                    <div className="mt-3 flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <CheckSquare className="h-3.5 w-3.5 text-[#1b6b6a]" />
                        <span>{policy.tasks.length} Event Checklist Tasks</span>
                      </div>
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-medium border border-teal-200/50">
                        Syncs to Events
                      </span>
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

      {/* Table Footer */}
      <div className="border-t border-slate-200 bg-slate-50/70 p-4 rounded-xl flex items-center justify-between text-xs text-slate-500">
        <span>Showing <strong>{filteredPolicies.length}</strong> of <strong>{policies.length}</strong> policy documents</span>
        {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setStatusFilter('all');
            }}
            className="text-xs font-bold text-[#1b6b6a] hover:text-[#155453] hover:underline"
          >
            Clear filters
          </button>
        )}
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
                      {viewingPolicy.type} • {viewingPolicy.version}
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
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Policy Type</span>
                    <span className="font-bold text-slate-800 capitalize">{viewingPolicy.type}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {viewingPolicy.type !== 'other' ? 'Singleton (1/1 allowed)' : 'Unlimited'}
                    </span>
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
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Status</span>
                    <span className="font-bold text-emerald-700 capitalize">{viewingPolicy.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Executive Summary</h4>
                  <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 text-xs text-slate-800 font-medium leading-relaxed">
                    {viewingPolicy.summary}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Standard Operating Text</h4>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                    {viewingPolicy.content}
                  </div>
                </div>

                {/* Preparation Tasks */}
                {viewingPolicy.tasks && viewingPolicy.tasks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <CheckSquare className="h-3.5 w-3.5 text-[#1b6b6a]" />
                        <span>Preparation Checklist Tasks ({viewingPolicy.tasks.length})</span>
                      </h4>
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium border border-teal-200/50">
                        Automatically populated into future events
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                      {viewingPolicy.tasks.map((task, idx) => (
                        <div key={task.id || idx} className="flex items-start gap-2.5 text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-[#1b6b6a] text-[10px] font-bold shrink-0 mt-0.5 border border-teal-200/60">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-slate-900">{task.title}</span>
                            {task.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                            )}
                          </div>
                          {task.isMandatory && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60 shrink-0">
                              Mandatory
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-500">Applicable Audience:</span>
                    <span className="text-slate-700">{(viewingPolicy.mandatoryFor || []).join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(viewingPolicy.tags || []).map((t, idx) => (
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
                Are you sure you want to remove <strong>"{deletingPolicy.title}"</strong> ({deletingPolicy.type}) from the repository?
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
