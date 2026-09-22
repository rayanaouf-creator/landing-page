import { useState, useMemo, FormEvent } from 'react';
import { 
  FolderGit2, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Calendar, 
  DollarSign, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  UserCheck
} from 'lucide-react';
import { Project, ProjectStatus, Customer } from '../../types';
import { projectStorage } from '../../services/projectStorage';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string; border: string }> = {
  planning: { label: 'Planning & Scoping', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  in_progress: { label: 'In Progress / Implementation', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  on_hold: { label: 'On Hold / Blocked', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  completed: { label: 'Completed & Delivered', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' }
};

interface ProjectViewProps {
  projects: Project[];
  customers: Customer[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  initialCustomer?: Customer | null;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export function ProjectView({
  projects,
  customers,
  onRefresh,
  showToast,
  isAddModalOpen = false,
  onCloseAddModal,
  initialCustomer,
  statusFilter = 'all',
  onStatusFilterChange
}: ProjectViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);

  const currentStatus = onStatusFilterChange ? statusFilter : localStatusFilter;
  const setStatus = (val: string) => {
    if (onStatusFilterChange) onStatusFilterChange(val);
    else setLocalStatusFilter(val);
  };

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(isAddModalOpen || Boolean(initialCustomer));
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Form State
  const [projectName, setProjectName] = useState(initialCustomer ? `${initialCustomer.company} - Implementation` : '');
  const [customerId, setCustomerId] = useState(initialCustomer?.id || '');
  const [customerName, setCustomerName] = useState(initialCustomer?.company || '');
  const [statusValue, setStatusValue] = useState<ProjectStatus>('in_progress');
  const [budgetDZD, setBudgetDZD] = useState<number | ''>(3500000);
  const [monthlySupportDZD, setMonthlySupportDZD] = useState<number | ''>(120000);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetEndDate, setTargetEndDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [progress, setProgress] = useState<number>(25);
  const [projectManager, setProjectManager] = useState('Lead ERP Technical Consultant');
  const [keyDeliverables, setKeyDeliverables] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = (cust?: Customer) => {
    setEditingProject(null);
    setProjectName(cust ? `${cust.company} - ERP Deployment` : '');
    setCustomerId(cust?.id || '');
    setCustomerName(cust?.company || '');
    setStatusValue('in_progress');
    setBudgetDZD(3500000);
    setMonthlySupportDZD(120000);
    setStartDate(new Date().toISOString().slice(0, 10));
    setTargetEndDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setProgress(20);
    setProjectManager('Lead ERP Technical Consultant');
    setKeyDeliverables('Requirements Gathering, Frappe DocType Modeling, Data Migration, User Acceptance Testing');
    setNotes('');
    setIsFormOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setProjectName(proj.projectName);
    setCustomerId(proj.customerId || '');
    setCustomerName(proj.customerName);
    setStatusValue(proj.status);
    setBudgetDZD(proj.budgetDZD);
    setMonthlySupportDZD(proj.monthlySupportDZD !== undefined ? proj.monthlySupportDZD : '');
    setStartDate(proj.startDate);
    setTargetEndDate(proj.targetEndDate || '');
    setProgress(proj.progress);
    setProjectManager(proj.projectManager || '');
    setKeyDeliverables(proj.keyDeliverables || '');
    setNotes(proj.notes || '');
    setIsFormOpen(true);
  };

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const found = customers.find(c => c.id === id);
    if (found) {
      setCustomerName(found.company);
      if (!projectName) {
        setProjectName(`${found.company} - ERPNext Project`);
      }
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !customerName.trim()) {
      showToast('Please specify project name and customer');
      return;
    }

    const payload = {
      projectName: projectName.trim(),
      customerId: customerId || undefined,
      customerName: customerName.trim(),
      status: statusValue,
      budgetDZD: budgetDZD === '' ? 0 : Number(budgetDZD),
      monthlySupportDZD: monthlySupportDZD === '' ? 0 : Number(monthlySupportDZD),
      startDate,
      targetEndDate: targetEndDate || undefined,
      progress: Number(progress),
      projectManager: projectManager.trim(),
      keyDeliverables: keyDeliverables.trim(),
      notes: notes.trim()
    };

    if (editingProject) {
      projectStorage.updateProject(editingProject.id, payload);
      showToast(`Updated project "${projectName}"`);
    } else {
      projectStorage.saveProject(payload);
      showToast(`Created project "${projectName}"`);
    }

    setIsFormOpen(false);
    if (onCloseAddModal) onCloseAddModal();
    onRefresh();
  };

  const handleDelete = () => {
    if (!projectToDelete) return;
    projectStorage.deleteProject(projectToDelete.id);
    showToast(`Deleted project "${projectToDelete.projectName}"`);
    setProjectToDelete(null);
    onRefresh();
  };

  // Filtered
  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (currentStatus !== 'all' && p.status !== currentStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.projectName.toLowerCase().includes(q);
        const matchesCust = p.customerName.toLowerCase().includes(q);
        const matchesManager = p.projectManager?.toLowerCase().includes(q);
        const matchesDeliv = p.keyDeliverables?.toLowerCase().includes(q);
        return matchesName || matchesCust || matchesManager || matchesDeliv;
      }
      return true;
    });
  }, [projects, currentStatus, searchQuery]);

  // Aggregates
  const totalBudget = useMemo(() => projects.reduce((sum, p) => sum + (p.budgetDZD || 0), 0), [projects]);
  const totalMonthlySupport = useMemo(() => projects.reduce((sum, p) => sum + (p.monthlySupportDZD || 0), 0), [projects]);
  const inProgressCount = useMemo(() => projects.filter(p => p.status === 'in_progress').length, [projects]);
  const completedCount = useMemo(() => projects.filter(p => p.status === 'completed').length, [projects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700">
              <FolderGit2 className="h-3.5 w-3.5" />
              Delivery & Implementations
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20" title="All operations persist in Firebase Firestore cloud database">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firebase Firestore
            </span>
            <span className="text-xs text-slate-400 font-medium">Customer Project Tracking</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Project Portfolio</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track implementation milestones, project budgets, progress, SLAs, and technical deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => projectStorage.exportCSV()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export Projects</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#389695] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Project</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Projects</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{projects.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{inProgressCount} currently active</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Active Deployments</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-purple-700">{inProgressCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Implementation sprints</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Delivered / Completed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{completedCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Live production systems</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Monthly Support SLA</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-teal-700">
            {totalMonthlySupport.toLocaleString()} <span className="text-xs font-normal text-slate-400">DZD/mo</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Total project budget: {totalBudget.toLocaleString()} DZD</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search project name, client company, consultant, deliverables..."
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

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium flex-wrap">
            <button
              onClick={() => setStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentStatus === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setStatus('in_progress')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentStatus === 'in_progress' ? 'bg-purple-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setStatus('planning')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentStatus === 'planning' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Planning
            </button>
            <button
              onClick={() => setStatus('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentStatus === 'completed' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center px-4">
            <FolderGit2 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-900">No projects found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || currentStatus !== 'all'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'Get started by creating your first implementation or support project.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => openAddModal()}
                className="rounded-xl bg-[#44ACAB] px-4 py-2 text-xs font-bold text-white hover:bg-[#389695]"
              >
                + Create Project
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-light-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Project & Customer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Project Budget</th>
                  <th className="py-3.5 px-4">Support SLA (MRR)</th>
                  <th className="py-3.5 px-4">Timeline</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filtered.map(proj => {
                  const statusInfo = STATUS_CONFIG[proj.status] || STATUS_CONFIG.planning;

                  return (
                    <tr key={proj.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Project & Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{proj.projectName}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span>{proj.customerName}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className={`h-full ${
                                proj.progress >= 100 ? 'bg-emerald-500' : proj.progress >= 50 ? 'bg-purple-500' : 'bg-blue-500'
                              }`} 
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{proj.progress}%</span>
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">
                          {(proj.budgetDZD || 0).toLocaleString()} <span className="text-[11px] font-normal text-slate-500">DZD</span>
                        </p>
                      </td>

                      {/* Monthly Support */}
                      <td className="py-3.5 px-4">
                        {proj.monthlySupportDZD ? (
                          <span className="font-semibold text-purple-700">
                            {proj.monthlySupportDZD.toLocaleString()} DZD/mo
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Timeline */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{proj.startDate} → {proj.targetEndDate || 'Ongoing'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingProject(proj)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="View Project Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(proj)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="Edit Project"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setProjectToDelete(proj)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete Project"
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

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <FolderGit2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingProject ? 'Edit Project' : 'New Project'}
                  </h3>
                  <p className="text-xs text-slate-500">Implementation scope, timeline, and support SLA</p>
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

            <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-light-scrollbar space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ERPNext Multi-Depot Implementation & POS Rollout"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Customer Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Customer Account</label>
                  <select
                    value={customerId}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  >
                    <option value="">-- Manual or Select Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Company Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Status</label>
                  <select
                    value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value as ProjectStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  >
                    <option value="planning">Planning & Scoping</option>
                    <option value="in_progress">In Progress / Implementation</option>
                    <option value="on_hold">On Hold / Blocked</option>
                    <option value="completed">Completed & Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Progress */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Progress: {progress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full accent-[#44ACAB] mt-2"
                  />
                </div>

                {/* Total Budget */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Project Budget (DZD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    required
                    value={budgetDZD}
                    onChange={(e) => setBudgetDZD(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Monthly Support SLA */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Support SLA (DZD/month)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="0"
                    value={monthlySupportDZD}
                    onChange={(e) => setMonthlySupportDZD(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Target End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={targetEndDate}
                    onChange={(e) => setTargetEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Project Manager */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Manager / Lead Consultant</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead ERP Technical Consultant"
                    value={projectManager}
                    onChange={(e) => setProjectManager(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Key Deliverables */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Key Deliverables & Milestones</label>
                  <textarea
                    rows={2}
                    placeholder="Requirements blueprint, custom modules, training sessions, go-live..."
                    value={keyDeliverables}
                    onChange={(e) => setKeyDeliverables(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden resize-none"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Technical specifics, cloud hosting configuration, team allocation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden resize-none"
                  />
                </div>
              </div>

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
                  {editingProject ? 'Save Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingProject.projectName}</h3>
                <p className="text-xs text-slate-500">{viewingProject.customerName}</p>
              </div>
              <button
                onClick={() => setViewingProject(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-light-scrollbar">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Budget</span>
                  <p className="font-bold text-base text-slate-900 mt-0.5">
                    {(viewingProject.budgetDZD || 0).toLocaleString()} DZD
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Support SLA</span>
                  <p className="font-bold text-base text-purple-700 mt-0.5">
                    {viewingProject.monthlySupportDZD ? `${viewingProject.monthlySupportDZD.toLocaleString()} DZD/mo` : 'None'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Progress</span>
                  <span className="font-bold text-slate-800">{viewingProject.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#44ACAB]" style={{ width: `${viewingProject.progress}%` }} />
                </div>
              </div>

              {viewingProject.keyDeliverables && (
                <div className="p-4 rounded-xl bg-slate-50 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Deliverables</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{viewingProject.keyDeliverables}</p>
                </div>
              )}

              {viewingProject.notes && (
                <div className="p-4 rounded-xl bg-slate-50 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Notes</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{viewingProject.notes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const p = viewingProject;
                  setViewingProject(null);
                  openEditModal(p);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#44ACAB] hover:underline"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Project</span>
              </button>

              <button
                onClick={() => setViewingProject(null)}
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Delete Project</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{projectToDelete.projectName}"</span>?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
