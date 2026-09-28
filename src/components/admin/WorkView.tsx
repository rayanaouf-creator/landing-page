import { useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  CheckCircle2, 
  TrendingUp, 
  Download, 
  RotateCcw, 
  X, 
  Sparkles, 
  Layers, 
  Check, 
  ArrowUpRight,
  Briefcase,
  Building2,
  ListPlus,
  HelpCircle,
  Hash
} from 'lucide-react';
import { WorkProject } from '../../types';
import { workStorage } from '../../services/workStorage';

interface WorkViewProps {
  projects: WorkProject[];
  onRefresh: () => void;
  showNotification: (msg: string) => void;
}

export function WorkView({ projects, onRefresh, showNotification }: WorkViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<WorkProject | null>(null);
  const [previewProject, setPreviewProject] = useState<WorkProject | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formCategory, setFormCategory] = useState('ERPNext & Logistics');
  const [formDescription, setFormDescription] = useState('');
  const [formSolution, setFormSolution] = useState('');
  const [formDelivered, setFormDelivered] = useState('What we delivered:');
  const [formHighlights, setFormHighlights] = useState<string[]>(['']);
  const [formMetricValue, setFormMetricValue] = useState('');
  const [formMetricLabel, setFormMetricLabel] = useState('');
  const [formClientWebsite, setFormClientWebsite] = useState('');
  const [formLogoLetter, setFormLogoLetter] = useState('');
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formPublished, setFormPublished] = useState(true);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'published' ? p.published :
        !p.published;

      const matchesCategory = 
        selectedCategory === 'all' ? true :
        p.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, searchQuery, statusFilter, selectedCategory]);

  const stats = useMemo(() => {
    const total = projects.length;
    const published = projects.filter(p => p.published).length;
    const draft = total - published;
    return { total, published, draft };
  }, [projects]);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormName('');
    setFormIndustry('');
    setFormCategory('ERPNext & Logistics');
    setFormDescription('');
    setFormSolution('');
    setFormDelivered('What we delivered:');
    setFormHighlights(['Custom ERPNext Implementation', 'Optimized operational workflows', 'Real-time multi-depot inventory tracking']);
    setFormMetricValue('+40%');
    setFormMetricLabel('Productivity Gain');
    setFormClientWebsite('');
    setFormLogoLetter('');
    setFormOrder(projects.length + 1);
    setFormPublished(true);
    setIsFormModalOpen(true);
  };

  const openEditModal = (p: WorkProject) => {
    setEditingProject(p);
    setFormName(p.name);
    setFormIndustry(p.industry);
    setFormCategory(p.category || 'ERPNext & Logistics');
    setFormDescription(p.description);
    setFormSolution(p.solution);
    setFormDelivered(p.delivered || 'What we delivered:');
    setFormHighlights(p.highlights && p.highlights.length > 0 ? [...p.highlights] : ['']);
    setFormMetricValue(p.metricValue || '');
    setFormMetricLabel(p.metricLabel || '');
    setFormClientWebsite(p.clientWebsite || '');
    setFormLogoLetter(p.logoLetter || p.name.charAt(0));
    setFormOrder(p.order ?? 1);
    setFormPublished(p.published);
    setIsFormModalOpen(true);
  };

  const handleHighlightChange = (index: number, val: string) => {
    const updated = [...formHighlights];
    updated[index] = val;
    setFormHighlights(updated);
  };

  const addHighlightField = () => {
    setFormHighlights([...formHighlights, '']);
  };

  const removeHighlightField = (index: number) => {
    if (formHighlights.length <= 1) {
      setFormHighlights(['']);
      return;
    }
    setFormHighlights(formHighlights.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formIndustry.trim()) {
      showNotification('Please enter at least a client name and industry.');
      return;
    }

    const cleanedHighlights = formHighlights
      .map(h => h.trim())
      .filter(h => h.length > 0);

    if (editingProject) {
      workStorage.updateProject(editingProject.id, {
        name: formName.trim(),
        industry: formIndustry.trim(),
        category: formCategory.trim(),
        description: formDescription.trim(),
        solution: formSolution.trim(),
        delivered: formDelivered.trim(),
        highlights: cleanedHighlights,
        metricValue: formMetricValue.trim(),
        metricLabel: formMetricLabel.trim(),
        clientWebsite: formClientWebsite.trim(),
        logoLetter: formLogoLetter.trim().toUpperCase() || formName.trim().charAt(0).toUpperCase(),
        order: Number(formOrder) || 1,
        published: formPublished
      });
      showNotification(`Updated case study "${formName}" successfully.`);
    } else {
      workStorage.saveProject({
        name: formName.trim(),
        industry: formIndustry.trim(),
        category: formCategory.trim(),
        description: formDescription.trim(),
        solution: formSolution.trim(),
        delivered: formDelivered.trim(),
        highlights: cleanedHighlights,
        metricValue: formMetricValue.trim(),
        metricLabel: formMetricLabel.trim(),
        clientWebsite: formClientWebsite.trim(),
        logoLetter: formLogoLetter.trim().toUpperCase() || formName.trim().charAt(0).toUpperCase(),
        order: Number(formOrder) || (projects.length + 1),
        published: formPublished
      });
      showNotification(`Added new case study "${formName}" to Our Work.`);
    }

    setIsFormModalOpen(false);
    onRefresh();
  };

  const handleTogglePublish = (p: WorkProject) => {
    const updated = workStorage.togglePublish(p.id);
    if (updated) {
      showNotification(
        updated.published 
          ? `"${p.name}" is now PUBLISHED on the website.` 
          : `"${p.name}" is now marked as DRAFT (hidden from website).`
      );
      onRefresh();
    }
  };

  const handleDelete = (id: string, name: string) => {
    workStorage.deleteProject(id);
    setDeleteConfirmId(null);
    showNotification(`Deleted case study "${name}".`);
    onRefresh();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset the Our Work section to the standard case studies (Optilens, CH Optic, Lutech)?')) {
      workStorage.resetToDefaults();
      showNotification('Reset Our Work showcase to defaults.');
      onRefresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Our Work Section Manager</h1>
            <span className="inline-flex items-center gap-1 rounded-md bg-[#e6f4f4] px-2 py-0.5 text-xs font-bold text-[#1b6b6a]">
              Live Website CMS
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Fulfill and manage the case studies, client success stories, and deliverables displayed on the public "Our Work" section.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/work"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-[#44ACAB] transition-colors"
          >
            <span>View Public Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#328887] hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Work Case Study</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Case Studies</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">Managed in Firestore</p>
        </div>

        <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Published on Site</span>
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{stats.published}</p>
          <p className="text-[11px] text-slate-400 mt-1">Visible to public visitors</p>
        </div>

        <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Draft / Hidden</p>
          <p className="text-2xl font-black text-slate-700 mt-2">{stats.draft}</p>
          <p className="text-[11px] text-slate-400 mt-1">Pending review or private</p>
        </div>

        <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Database Actions</p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => workStorage.exportCSV()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              title="Download CSV backup"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              title="Restore standard defaults"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, industry, or description..."
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Segmented Control */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'published' ? 'bg-white text-emerald-700 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Published ({stats.published})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'draft' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Drafts ({stats.draft})
            </button>
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Projects List / Cards */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center ring-1 ring-slate-200/80">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No work case studies found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search query or create a new case study to showcase on the website.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#328887] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Case Study</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group relative flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-7 ring-1 transition-all duration-200 ${
                project.published 
                  ? 'ring-slate-200/90 shadow-sm hover:shadow-md hover:ring-[#44ACAB]/40' 
                  : 'ring-amber-200/70 bg-amber-50/20'
              }`}
            >
              <div>
                {/* Top status bar */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="text-slate-400">#{project.order ?? 1}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[#1b6b6a]">{project.category || 'Case Study'}</span>
                  </div>

                  <button
                    onClick={() => handleTogglePublish(project)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      project.published
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                    title="Click to toggle public visibility"
                  >
                    {project.published ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span>Live on Site</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 text-amber-600" />
                        <span>Draft (Hidden)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Monogram and Name */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#e6f4f4] flex items-center justify-center text-[#1b6b6a] font-black text-xl shadow-inner shrink-0">
                    {project.logoLetter || project.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-[#1b6b6a] transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {project.industry}
                    </p>
                  </div>
                </div>

                {/* Metric pill */}
                {project.metricValue && (
                  <div className="mb-4 inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs font-bold">
                    <TrendingUp className="h-3.5 w-3.5 text-[#44ACAB]" />
                    <span className="text-[#1b6b6a] font-black">{project.metricValue}</span>
                    <span className="text-slate-500 font-medium">{project.metricLabel}</span>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Highlights count */}
                {project.highlights && project.highlights.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 mb-4 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Deliverables ({project.highlights.length})
                    </p>
                    <ul className="space-y-1">
                      {project.highlights.slice(0, 2).map((h, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5 line-clamp-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#44ACAB] shrink-0 mt-0.5" />
                          <span className="truncate">{h}</span>
                        </li>
                      ))}
                      {project.highlights.length > 2 && (
                        <li className="text-[11px] text-slate-400 italic pl-5">
                          + {project.highlights.length - 2} more deliverables in details
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewProject(project)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#44ACAB] transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="Edit Case Study"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(project.id)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete Case Study"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl ring-1 ring-slate-200"
            >
              <h3 className="text-lg font-bold text-slate-900">Delete Case Study?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                This will remove the project from both the admin dashboard and the live "Our Work" public showcase.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const target = projects.find(p => p.id === deleteConfirmId);
                    if (target) handleDelete(target.id, target.name);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Form Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingProject ? `Edit Case Study: ${editingProject.name}` : 'Add New Work Case Study'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This content updates the public "Our Work" section in real-time.
                  </p>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Client / Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Optilens, Lutech, Maghreb Supply"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Industry / Sector *
                    </label>
                    <input
                      type="text"
                      required
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      placeholder="e.g. Optical Distribution (14 Wilayas)"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Category Tag
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. ERPNext & Logistics, SaaS Software"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Monogram / Logo Letter
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formLogoLetter}
                      onChange={(e) => setFormLogoLetter(e.target.value)}
                      placeholder="e.g. O (defaults to first letter)"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Key Metric Value (e.g. +45%)
                    </label>
                    <input
                      type="text"
                      value={formMetricValue}
                      onChange={(e) => setFormMetricValue(e.target.value)}
                      placeholder="e.g. +45%, -70%, 100%"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Key Metric Label
                    </label>
                    <input
                      type="text"
                      value={formMetricLabel}
                      onChange={(e) => setFormMetricLabel(e.target.value)}
                      placeholder="e.g. Faster Regional Fulfillment"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                    />
                  </div>
                </div>

                {/* Short Overview Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Client Summary Overview *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short introduction about who the client is, their scale, and their business domain."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                  />
                </div>

                {/* Detailed Solution */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Detailed Solution Delivered *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formSolution}
                    onChange={(e) => setFormSolution(e.target.value)}
                    placeholder="Comprehensive explanation of what JetNext architected, implemented, and optimized for this client."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                  />
                </div>

                {/* Dynamic Highlights List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Key Deliverables & Bullets
                    </label>
                    <button
                      type="button"
                      onClick={addHighlightField}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#44ACAB] hover:text-[#328887]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Deliverable</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formHighlights.map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={hl}
                          onChange={(e) => handleHighlightChange(idx, e.target.value)}
                          placeholder={`Deliverable #${idx + 1}`}
                          className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeHighlightField(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order & Publish Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Display Priority Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={formOrder}
                      onChange={(e) => setFormOrder(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Lower numbers appear first in the public section.</p>
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="flex items-center gap-3 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={formPublished}
                        onChange={(e) => setFormPublished(e.target.checked)}
                        className="h-4 w-4 rounded text-[#44ACAB] focus:ring-[#44ACAB]"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Publish on Live Website</span>
                        <span className="text-[11px] text-slate-500">Uncheck to keep as private draft.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#44ACAB] hover:bg-[#328887] rounded-xl shadow-sm transition-all"
                  >
                    {editingProject ? 'Save Changes' : 'Create Case Study'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Public Preview Modal */}
      <AnimatePresence>
        {previewProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Live Public Preview
                </span>
                <button
                  onClick={() => setPreviewProject(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-[#e6f4f4] flex items-center justify-center text-[#1b6b6a] font-black text-2xl shadow-inner">
                    {previewProject.logoLetter || previewProject.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{previewProject.name}</h3>
                    <p className="text-xs font-bold text-[#44ACAB] uppercase tracking-wider">{previewProject.industry}</p>
                  </div>
                </div>

                {previewProject.metricValue && (
                  <div className="p-4 rounded-2xl bg-[#e6f4f4]/60 border border-[#44ACAB]/20 flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-[#1b6b6a]" />
                    <div>
                      <span className="text-xs font-extrabold text-[#1b6b6a] block">{previewProject.metricValue}</span>
                      <span className="text-xs text-slate-600">{previewProject.metricLabel}</span>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Context & Challenge</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{previewProject.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Solution Deployed</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{previewProject.solution}</p>
                </div>

                {previewProject.highlights && previewProject.highlights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Deliverables</h4>
                    <ul className="space-y-2">
                      {previewProject.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                          <CheckCircle2 className="h-4 w-4 text-[#44ACAB] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-xs font-bold ${previewProject.published ? 'text-emerald-700' : 'text-amber-700'}`}>
                  Status: {previewProject.published ? 'Published on live website' : 'Draft only (hidden)'}
                </span>
                <button
                  onClick={() => setPreviewProject(null)}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
