import { useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCircle,
  Plus,
  Search,
  Mail,
  Phone,
  Edit3,
  Trash2,
  Briefcase,
  CheckCircle2,
  X,
  AlertTriangle
} from 'lucide-react';
import { Candidate, CandidateStatus, CandidatePriority } from '../../types';
import { candidateStorage } from '../../services/candidateStorage';

interface CandidateViewProps {
  candidates: Candidate[];
  currentUser?: any;
  onRefresh: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const STATUS_CONFIG: Record<CandidateStatus, { label: string; color: string; bg: string; border: string }> = {
  applied: { label: 'Applied', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
  screening: { label: 'Screening', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  interview: { label: 'Interview', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  offer: { label: 'Offer', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  hired: { label: 'Hired', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  rejected: { label: 'Rejected', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  withdrawn: { label: 'Withdrawn', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-300' }
};

const PRIORITY_CONFIG: Record<CandidatePriority, { label: string; color: string; bg: string; border: string; dot: string }> = {
  high: { label: 'High', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500' },
  medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-500' }
};

export function CandidateView({ candidates, currentUser, onRefresh, showToast }: CandidateViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    experience: string;
    skills: string;
    resumeUrl: string;
    linkedinUrl: string;
    status: CandidateStatus;
    priority: CandidatePriority;
    appliedDate: string;
    interviewDate: string;
    notes: string;
    assignedTo: string;
  }>({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    experience: '',
    skills: '',
    resumeUrl: '',
    linkedinUrl: '',
    status: 'applied',
    priority: 'medium',
    appliedDate: new Date().toISOString().slice(0, 10),
    interviewDate: '',
    notes: '',
    assignedTo: ''
  });

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.position.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [candidates, searchTerm, statusFilter, priorityFilter]);

  const metrics = useMemo(() => {
    return {
      total: candidates.length,
      pending: candidates.filter(c => ['applied', 'screening', 'interview'].includes(c.status)).length,
      hired: candidates.filter(c => c.status === 'hired').length,
      rejected: candidates.filter(c => c.status === 'rejected').length
    };
  }, [candidates]);

  const handleOpenAdd = () => {
    setEditingCandidate(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      experience: '',
      skills: '',
      resumeUrl: '',
      linkedinUrl: '',
      status: 'applied',
      priority: 'medium',
      appliedDate: new Date().toISOString().slice(0, 10),
      interviewDate: '',
      notes: '',
      assignedTo: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone || '',
      position: candidate.position,
      department: candidate.department || '',
      experience: candidate.experience || '',
      skills: (candidate.skills || []).join(', '),
      resumeUrl: candidate.resumeUrl || '',
      linkedinUrl: candidate.linkedinUrl || '',
      status: candidate.status,
      priority: candidate.priority,
      appliedDate: candidate.appliedDate.slice(0, 10),
      interviewDate: candidate.interviewDate?.slice(0, 10) || '',
      notes: candidate.notes || '',
      assignedTo: candidate.assignedTo || ''
    });
    setIsFormOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.position.trim()) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    const candidateData: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      position: formData.position,
      department: formData.department || undefined,
      experience: formData.experience || undefined,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      resumeUrl: formData.resumeUrl || undefined,
      linkedinUrl: formData.linkedinUrl || undefined,
      status: formData.status,
      priority: formData.priority,
      appliedDate: new Date(formData.appliedDate).toISOString(),
      interviewDate: formData.interviewDate ? new Date(formData.interviewDate).toISOString() : undefined,
      notes: formData.notes || undefined,
      assignedTo: formData.assignedTo || undefined
    };

    if (editingCandidate) {
      candidateStorage.updateCandidate(editingCandidate.id, candidateData);
      showToast('Candidate updated successfully');
    } else {
      candidateStorage.saveCandidate(candidateData);
      showToast('Candidate created successfully');
    }

    setIsFormOpen(false);
    setEditingCandidate(null);
    onRefresh();
  };

  const handleDelete = () => {
    if (!deletingCandidate) return;
    candidateStorage.deleteCandidate(deletingCandidate.id);
    showToast('Candidate deleted');
    setDeletingCandidate(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Candidates</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{metrics.total}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">All candidates</p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200 border-l-4 border-blue-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">In Progress</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-blue-600">{metrics.pending}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Screening & interviews</p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200 border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Hired</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-600">{metrics.hired}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Successfully hired</p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200 border-l-4 border-rose-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Rejected</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-rose-600">{metrics.rejected}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Not selected</p>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:border-[#44ACAB] outline-none"
          >
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:border-[#44ACAB] outline-none"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-4 py-2 text-xs font-bold text-white hover:bg-[#328887] transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Candidates List */}
      {filteredCandidates.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-xs ring-1 ring-slate-200">
          <UserCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No candidates found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try clearing your filters or search'
              : 'Add your first candidate to start tracking recruitment'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredCandidates.map((candidate) => {
              const statusCfg = STATUS_CONFIG[candidate.status];
              const priorityCfg = PRIORITY_CONFIG[candidate.priority];

              return (
                <div
                  key={candidate.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">{candidate.name}</h4>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${priorityCfg.bg} ${priorityCfg.color} ${priorityCfg.border}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${priorityCfg.dot}`}></span>
                          {priorityCfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{candidate.position}</span>
                        </div>

                        {candidate.department && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-medium">{candidate.department}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{candidate.email}</span>
                        </div>

                        {candidate.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{candidate.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>

                        {candidate.experience && (
                          <span className="text-[10px] text-slate-500">
                            {candidate.experience} experience
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(candidate)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCandidate(candidate)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md"
            />
            <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-8 sm:px-6 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingCandidate ? 'Edit Candidate' : 'New Candidate'}
                  </h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Position *
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as CandidateStatus })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#44ACAB] outline-none"
                      >
                        <option value="applied">Applied</option>
                        <option value="screening">Screening</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as CandidatePriority })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#44ACAB] outline-none"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-lg bg-[#44ACAB] text-sm font-bold text-white hover:bg-[#328887] transition-colors"
                    >
                      {editingCandidate ? 'Update' : 'Create'} Candidate
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingCandidate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingCandidate(null)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md"
            />
            <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-8 sm:px-6 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Candidate</h3>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  Are you sure you want to delete the candidate "{deletingCandidate.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingCandidate(null)}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 rounded-lg bg-rose-600 text-sm font-bold text-white hover:bg-rose-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
