import { useState, useEffect, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Lock, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Mail, 
  Phone, 
  Building2, 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  EyeOff,
  KeyRound,
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  LogOut, 
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  FileSpreadsheet,
  Menu,
  LayoutDashboard,
  Globe,
  MapPin,
  Briefcase,
  Factory,
  AlertCircle,
  Flame,
  Zap,
  Tag
} from 'lucide-react';
import { Lead, LeadStatus, LeadPriority, LeadSource, EmergencyLevel } from '../types';
import { leadStorage } from '../services/leadStorage';

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; border: string }> = {
  new: { label: 'New Lead', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  contacted: { label: 'Contacted', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  in_discussion: { label: 'In Discussion', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  proposal_sent: { label: 'Proposal Sent', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  converted: { label: 'Won / Converted', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  lost: { label: 'Lost / Closed', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' }
};

const PRIORITY_CONFIG: Record<LeadPriority, { label: string; color: string; dot: string }> = {
  high: { label: 'High', color: 'text-rose-700 bg-rose-50 border-rose-200', dot: 'bg-rose-500' },
  medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-400' }
};

export const EMERGENCY_CONFIG: Record<EmergencyLevel, { label: string; shortLabel: string; color: string; bg: string; border: string; dot: string }> = {
  immediate: { label: 'Urgent / Immediate (< 2 wks)', shortLabel: 'Immediate', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-600' },
  high: { label: 'Prioritary (< 1 mo)', shortLabel: 'High Urgency', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  medium: { label: 'Planned (1-3 mos)', shortLabel: '1-3 Months', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
  low: { label: 'Exploratory', shortLabel: 'Exploratory', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-400' }
};

export const INDUSTRY_PRESETS = [
  'Fabrication & Production Industrielle',
  'Distribution, Grossiste & Négoce',
  'Pharmaceutique, Chimie & Santé',
  'Agroalimentaire & Boissons',
  'BTPH, Construction & Immobilier',
  'Commerce de détail, Retail & Supermarché',
  'Transport & Logistique',
  'Services professionnels & IT',
  'Autre secteur'
];

export const LOCATION_PRESETS = [
  'Alger',
  'Oran',
  'Constantine',
  'Sétif',
  'Blida',
  'Annaba',
  'Béjaïa',
  'Tlemcen',
  'Batna',
  'Biskra',
  'Ouargla / Hassi Messaoud',
  'Mostaganem',
  'Tizi Ouzou',
  'Autre Wilaya / International'
];

export const JOB_TITLE_PRESETS = [
  "Directeur Général / CEO / Owner",
  "Directeur des Systèmes d'Information / DSI",
  "Directeur Financier / DAF / CFO",
  "Directeur des Opérations / COO",
  "Responsable Supply Chain & Logistique",
  "Chef de Projet ERP / SI",
  "Autre / Other"
];

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      localStorage.getItem('jetnext_admin_auth') === 'true' ||
      sessionStorage.getItem('jetnext_admin_auth') === 'true'
    );
  });
  const [loginEmail, setLoginEmail] = useState(() => {
    return localStorage.getItem('jetnext_remembered_email') || 'rayanaouf@jethings.com';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return (
      localStorage.getItem('jetnext_admin_email') ||
      sessionStorage.getItem('jetnext_admin_email') ||
      'rayanaouf@jethings.com'
    );
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [emergencyFilter, setEmergencyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'company' | 'value_desc'>('date_desc');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form input state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formJobTitle, setFormJobTitle] = useState('Directeur Général / CEO / Owner');
  const [formLocation, setFormLocation] = useState('Alger');
  const [formIndustry, setFormIndustry] = useState('Fabrication & Production Industrielle');
  const [formEmergencyLevel, setFormEmergencyLevel] = useState<EmergencyLevel>('high');
  const [formService, setFormService] = useState('ERPNext Implementation');
  const [formStatus, setFormStatus] = useState<LeadStatus>('new');
  const [formPriority, setFormPriority] = useState<LeadPriority>('high');
  const [formSource, setFormSource] = useState<LeadSource>('direct_entry');
  const [formNotes, setFormNotes] = useState('');
  const [formValue, setFormValue] = useState<number | ''>('');

  useEffect(() => {
    if (isAuthenticated) {
      loadLeads();
    }
  }, [isAuthenticated]);

  const loadLeads = () => {
    const list = leadStorage.getLeads();
    setLeads(list);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const emailInput = loginEmail.trim().toLowerCase();
    const passInput = loginPassword.trim();

    // Check custom saved admin credentials
    const savedCredsRaw = localStorage.getItem('jetnext_custom_admin_creds');
    let customCreds: { email?: string; password?: string } | null = null;
    if (savedCredsRaw) {
      try {
        customCreds = JSON.parse(savedCredsRaw);
      } catch {
        // ignore
      }
    }

    const validPasswords = ['jetnext2026', 'admin', 'jethings'];
    if (customCreds?.password) {
      validPasswords.push(customCreds.password);
    }

    const isPasswordValid = validPasswords.includes(passInput);
    const isEmailValid = 
      emailInput === 'rayanaouf@jethings.com' ||
      emailInput === 'admin@jethings.com' ||
      emailInput === 'admin@jetnext.dz' ||
      emailInput.endsWith('@jethings.com') ||
      emailInput.endsWith('@jetnext.dz') ||
      (customCreds?.email && emailInput === customCreds.email.toLowerCase());

    if (isEmailValid && isPasswordValid) {
      if (rememberMe) {
        localStorage.setItem('jetnext_admin_auth', 'true');
        localStorage.setItem('jetnext_admin_email', emailInput);
        localStorage.setItem('jetnext_remembered_email', emailInput);
      } else {
        sessionStorage.setItem('jetnext_admin_auth', 'true');
        sessionStorage.setItem('jetnext_admin_email', emailInput);
        localStorage.removeItem('jetnext_admin_auth');
      }
      setCurrentUserEmail(emailInput);
      setIsAuthenticated(true);
      setAuthError('');
      showToast(`Welcome back, ${emailInput}`);
    } else {
      setAuthError('Incorrect email or password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jetnext_admin_auth');
    localStorage.removeItem('jetnext_admin_email');
    sessionStorage.removeItem('jetnext_admin_auth');
    sessionStorage.removeItem('jetnext_admin_email');
    setIsAuthenticated(false);
    setLoginPassword('');
    showToast('Logged out of admin session.');
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 4) {
      alert('Password must contain at least 4 characters.');
      return;
    }
    localStorage.setItem(
      'jetnext_custom_admin_creds',
      JSON.stringify({
        email: currentUserEmail,
        password: newPasswordInput
      })
    );
    setIsChangePasswordOpen(false);
    setNewPasswordInput('');
    showToast('Admin password updated successfully.');
  };

  const handleOpenAddModal = () => {
    setEditingLead(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormJobTitle('Directeur Général / CEO / Owner');
    setFormLocation('Alger');
    setFormIndustry('Fabrication & Production Industrielle');
    setFormEmergencyLevel('high');
    setFormService('ERPNext Implementation');
    setFormStatus('new');
    setFormPriority('high');
    setFormSource('direct_entry');
    setFormNotes('');
    setFormValue('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormName(lead.name);
    setFormEmail(lead.email);
    setFormPhone(lead.phone);
    setFormCompany(lead.company);
    setFormJobTitle(lead.jobTitle || 'Directeur Général / CEO / Owner');
    setFormLocation(lead.location || 'Alger');
    setFormIndustry(lead.industry || 'Fabrication & Production Industrielle');
    setFormEmergencyLevel(lead.emergencyLevel || 'high');
    setFormService(lead.serviceRequested);
    setFormStatus(lead.status);
    setFormPriority(lead.priority);
    setFormSource(lead.source);
    setFormNotes(lead.notes || lead.message || '');
    setFormValue(lead.estimatedValueDZD || '');
    setIsFormModalOpen(true);
  };

  const handleSaveLead = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCompany.trim()) {
      alert('Please fill in at least the Lead Name and Company Name.');
      return;
    }

    if (editingLead) {
      leadStorage.updateLead(editingLead.id, {
        name: formName,
        email: formEmail,
        phone: formPhone,
        company: formCompany,
        jobTitle: formJobTitle,
        location: formLocation,
        industry: formIndustry,
        emergencyLevel: formEmergencyLevel,
        serviceRequested: formService,
        status: formStatus,
        priority: formPriority,
        source: formSource,
        notes: formNotes,
        estimatedValueDZD: formValue === '' ? undefined : Number(formValue)
      });
      showToast(`Lead "${formCompany}" updated successfully.`);
    } else {
      leadStorage.saveLead({
        name: formName,
        email: formEmail,
        phone: formPhone,
        company: formCompany,
        jobTitle: formJobTitle,
        location: formLocation,
        industry: formIndustry,
        emergencyLevel: formEmergencyLevel,
        serviceRequested: formService,
        status: formStatus,
        priority: formPriority,
        source: formSource,
        notes: formNotes,
        estimatedValueDZD: formValue === '' ? undefined : Number(formValue)
      });
      showToast(`New lead for "${formCompany}" saved.`);
    }

    loadLeads();
    setIsFormModalOpen(false);
  };

  const handleDeleteLead = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete lead "${name}"? This action cannot be undone.`)) {
      leadStorage.deleteLead(id);
      loadLeads();
      showToast('Lead removed from database.');
      if (viewingLead?.id === id) {
        setViewingLead(null);
      }
    }
  };

  const handleQuickStatusChange = (id: string, newStatus: LeadStatus) => {
    leadStorage.updateLead(id, { status: newStatus });
    loadLeads();
    if (viewingLead?.id === id) {
      setViewingLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`Status updated to ${STATUS_CONFIG[newStatus].label}.`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (leadStorage.importJSON(content)) {
        loadLeads();
        showToast('Leads database restored successfully!');
      } else {
        alert('Invalid JSON file structure. Expected an array of Lead objects.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter(l => l.status === 'new').length;
    const active = leads.filter(l => l.status === 'in_discussion' || l.status === 'proposal_sent').length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const totalPipelineDZD = leads.reduce((acc, curr) => acc + (curr.estimatedValueDZD || 0), 0);

    return { total, newCount, active, converted, totalPipelineDZD };
  }, [leads]);

  // Filtering and Sorting
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
        const matchesEmergency = emergencyFilter === 'all' || (lead.emergencyLevel || 'medium') === emergencyFilter;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || 
          lead.name.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          (lead.jobTitle && lead.jobTitle.toLowerCase().includes(q)) ||
          (lead.location && lead.location.toLowerCase().includes(q)) ||
          (lead.industry && lead.industry.toLowerCase().includes(q)) ||
          (lead.emergencyLevel && lead.emergencyLevel.toLowerCase().includes(q)) ||
          lead.email.toLowerCase().includes(q) ||
          lead.phone.toLowerCase().includes(q) ||
          (lead.notes && lead.notes.toLowerCase().includes(q)) ||
          (lead.serviceRequested && lead.serviceRequested.toLowerCase().includes(q));

        return matchesStatus && matchesPriority && matchesEmergency && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'company') {
          return a.company.localeCompare(b.company);
        }
        if (sortBy === 'value_desc') {
          return (b.estimatedValueDZD || 0) - (a.estimatedValueDZD || 0);
        }
        return 0;
      });
  }, [leads, statusFilter, priorityFilter, emergencyFilter, searchQuery, sortBy]);

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 px-4 py-8 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 shadow-2xl ring-1 ring-slate-800"
        >
          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#44ACAB]/15 text-[#1b6b6a] mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Admin Section</h1>
            <p className="text-sm text-slate-500 mt-1">
              JetNext Client & Lead Management Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@jethings.com"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/30 outline-none transition-all"
                  autoFocus
                />
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-11 text-sm focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/30 outline-none transition-all"
                />
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {authError && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{authError}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                <input
                  id="admin-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1b6b6a] focus:ring-[#44ACAB] accent-[#1b6b6a]"
                />
                <span>Remember me on this device (stay signed in)</span>
              </label>
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              className="w-full rounded-xl bg-[#1b6b6a] py-3 text-sm font-bold text-white shadow-md hover:bg-[#155453] transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Sign In to Lead Dashboard</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-[#44ACAB] transition-colors">
              &larr; Return to main website
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col md:flex-row font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-[#44ACAB]" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Top Header (Small Screens Only) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#44ACAB] text-white font-black text-sm">
            JN
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">JetNext</span>
            <span className="ml-1 text-[10px] font-semibold text-[#44ACAB] bg-[#44ACAB]/15 px-1.5 py-0.5 rounded">
              CRM
            </span>
          </div>
        </div>
        <button
          id="admin-mobile-menu-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs"
        />
      )}

      {/* Modern Left Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-72 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top & Navigation Section */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#44ACAB] to-[#1b6b6a] text-white font-black text-base shadow-sm">
                JN
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white tracking-tight text-lg">JetNext</span>
                  <span className="rounded bg-[#44ACAB]/20 text-[#44ACAB] text-[10px] font-bold px-1.5 py-0.5">
                    CRM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Client & Lead Manager</p>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Action: New Lead Button */}
          <div>
            <button
              id="admin-sidebar-new-lead-btn"
              onClick={() => {
                handleOpenAddModal();
                setIsSidebarOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#44ACAB] py-3 px-4 text-xs font-bold text-white hover:bg-[#389695] transition-all shadow-md group"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>Add New Lead</span>
            </button>
          </div>

          {/* Pipeline Stage Views */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Pipeline Views
            </p>
            <button
              id="admin-filter-all-btn"
              onClick={() => {
                setStatusFilter('all');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'all' 
                  ? 'bg-[#1b6b6a] text-white font-bold shadow-xs' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4" />
                <span>All Inquiries</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {leads.length}
              </span>
            </button>

            <button
              id="admin-filter-new-btn"
              onClick={() => {
                setStatusFilter('new');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                statusFilter === 'new' 
                  ? 'bg-emerald-950/80 text-emerald-300 ring-1 ring-emerald-500/40 font-bold' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>New Inquiries</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400">
                {leads.filter(l => l.status === 'new').length}
              </span>
            </button>

            <button
              id="admin-filter-indiscussion-btn"
              onClick={() => {
                setStatusFilter('in_discussion');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                statusFilter === 'in_discussion' 
                  ? 'bg-teal-950/80 text-teal-300 ring-1 ring-teal-500/40 font-bold' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span>In Discussion</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-teal-400">
                {leads.filter(l => l.status === 'in_discussion').length}
              </span>
            </button>

            <button
              id="admin-filter-proposals-btn"
              onClick={() => {
                setStatusFilter('proposal_sent');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                statusFilter === 'proposal_sent' 
                  ? 'bg-purple-950/80 text-purple-300 ring-1 ring-purple-500/40 font-bold' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>Proposal Sent</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-purple-400">
                {leads.filter(l => l.status === 'proposal_sent').length}
              </span>
            </button>

            <button
              id="admin-filter-converted-btn"
              onClick={() => {
                setStatusFilter('converted');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                statusFilter === 'converted' 
                  ? 'bg-emerald-900/60 text-emerald-200 ring-1 ring-emerald-400/40 font-bold' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                <span>Won / Converted</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300">
                {leads.filter(l => l.status === 'converted').length}
              </span>
            </button>

            <button
              id="admin-filter-lost-btn"
              onClick={() => {
                setStatusFilter('lost');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                statusFilter === 'lost' 
                  ? 'bg-slate-800 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span>Lost / Closed</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {leads.filter(l => l.status === 'lost').length}
              </span>
            </button>
          </div>

          {/* Data Tools */}
          <div className="pt-2 border-t border-slate-800 space-y-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Data & Backups
            </p>
            <button
              id="admin-sidebar-export-csv"
              onClick={() => leadStorage.exportCSV()}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span>Export CSV (Excel)</span>
            </button>

            <button
              id="admin-sidebar-backup-json"
              onClick={() => leadStorage.exportJSON()}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
            >
              <Download className="h-4 w-4 text-blue-400" />
              <span>Backup Database (JSON)</span>
            </button>

            <label
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4 text-purple-400" />
              <span>Restore Backup</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Sidebar Footer: Profile & Session Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          {/* User badge */}
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#44ACAB]/20 text-[#44ACAB] font-bold text-xs ring-1 ring-[#44ACAB]/30">
              {currentUserEmail.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate" title={currentUserEmail}>
                {currentUserEmail}
              </p>
              <p className="text-[10px] text-slate-400">Lead Administrator</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              id="admin-sidebar-password-btn"
              onClick={() => setIsChangePasswordOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              title="Change Admin Password"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              <span>Password</span>
            </button>

            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              title="View Public Website"
            >
              <Globe className="h-3.5 w-3.5 text-[#44ACAB]" />
              <span>Site</span>
            </Link>
          </div>

          <button
            id="admin-sidebar-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-colors border border-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Workspace Top Header (Clean replacement of old topbar) */}
        <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-[#e6f4f4] px-2.5 py-0.5 text-xs font-bold text-[#1b6b6a]">
                Lead Pipeline
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {statusFilter === 'all' ? 'All Inquiries' : `Filter: ${statusFilter}`}
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Customer Pipeline & Inquiries
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="admin-main-new-lead-btn"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#328887] transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Lead</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Leads</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">{metrics.total}</p>
            <p className="mt-1 text-xs text-slate-400">All registered inquiries</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-200 border-l-4 border-emerald-500">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">New Inquiries</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600">{metrics.newCount}</p>
            <p className="mt-1 text-xs text-slate-400">Needs initial follow-up</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-200 border-l-4 border-teal-500">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">In Pipeline</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-teal-600">{metrics.active}</p>
            <p className="mt-1 text-xs text-slate-400">Discussions & Proposals</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-200 border-l-4 border-indigo-500">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Converted Clients</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-indigo-600">{metrics.converted}</p>
            <p className="mt-1 text-xs text-slate-400">Won enterprise contracts</p>
          </div>

          <div className="col-span-2 lg:col-span-1 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xs text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-[#a5e0e0]">Pipeline Volume</p>
            <p className="mt-2 text-xl sm:text-2xl font-black text-white">
              {metrics.totalPipelineDZD.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-300">DZD</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">Estimated deal potentials</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 rounded-2xl bg-white p-4 sm:p-5 shadow-xs ring-1 ring-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                id="admin-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by company, contact name, email, phone, or service..."
                className="w-full rounded-xl bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-10 text-xs sm:text-sm focus:bg-white focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                id="admin-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-[#44ACAB]"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="company">Company Name (A-Z)</option>
                <option value="value_desc">Highest Value</option>
              </select>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 mr-1">Status:</span>
            {[
              { id: 'all', label: 'All', count: leads.length },
              { id: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
              { id: 'contacted', label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
              { id: 'in_discussion', label: 'In Discussion', count: leads.filter(l => l.status === 'in_discussion').length },
              { id: 'proposal_sent', label: 'Proposal Sent', count: leads.filter(l => l.status === 'proposal_sent').length },
              { id: 'converted', label: 'Converted', count: leads.filter(l => l.status === 'converted').length },
              { id: 'lost', label: 'Closed', count: leads.filter(l => l.status === 'lost').length }
            ].map((st) => (
              <button
                key={st.id}
                id={`admin-filter-status-${st.id}`}
                onClick={() => setStatusFilter(st.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  statusFilter === st.id
                    ? 'bg-[#1b6b6a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label} ({st.count})
              </button>
            ))}

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Urgency:</span>
                <select
                  id="admin-filter-emergency"
                  value={emergencyFilter}
                  onChange={(e) => setEmergencyFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#44ACAB]"
                >
                  <option value="all">All Urgencies</option>
                  <option value="immediate">Immediate (&lt; 2 wks)</option>
                  <option value="high">Urgent (&lt; 1 mo)</option>
                  <option value="medium">Planned (1-3 mos)</option>
                  <option value="low">Exploratory</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-xs font-bold text-slate-500">Priority:</span>
                {['all', 'high', 'medium', 'low'].map((pr) => (
                  <button
                    key={pr}
                    onClick={() => setPriorityFilter(pr)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize transition-all ${
                      priorityFilter === pr
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table / Cards Container */}
        <div className="mt-8 rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 overflow-hidden">
          {leads.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                <Building2 className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No leads recorded yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Leads submitted through the website booking form will automatically appear here. You can also create new records manually.
              </p>
              <button
                id="admin-empty-add-lead-btn"
                onClick={handleOpenAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#328887] shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Your First Lead
              </button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No leads match your criteria</h3>
              <p className="text-sm text-slate-500 mt-1">
                Try clearing your search or status filters, or create a new lead manually.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-4 py-2 text-xs font-bold text-white hover:bg-[#328887]"
              >
                <Plus className="h-4 w-4" />
                Add a Lead
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 pl-6 pr-3">Enterprise & Location</th>
                    <th className="px-3 py-3.5">Contact & Function</th>
                    <th className="px-3 py-3.5">Urgency</th>
                    <th className="px-3 py-3.5">Requested Solution</th>
                    <th className="px-3 py-3.5">Status</th>
                    <th className="px-3 py-3.5">Priority</th>
                    <th className="px-3 py-3.5">Est. Value</th>
                    <th className="px-3 py-3.5">Created</th>
                    <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredLeads.map((lead) => {
                    const statusCfg = STATUS_CONFIG[lead.status];
                    const priorityCfg = PRIORITY_CONFIG[lead.priority];
                    const emergencyCfg = EMERGENCY_CONFIG[lead.emergencyLevel || 'medium'];

                    return (
                      <tr 
                        key={lead.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Company & Location & Industry */}
                        <td className="py-4 pl-6 pr-3">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{lead.company}</span>
                            {lead.source === 'website_booking' && (
                              <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200">
                                Web
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {lead.location && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                                <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                                <span>{lead.location}</span>
                              </span>
                            )}
                            {lead.industry && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[150px]" title={lead.industry}>
                                <Factory className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate">{lead.industry}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Contact info and Post / Function */}
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{lead.name}</span>
                            {lead.jobTitle && (
                              <span className="inline-block rounded bg-[#e6f4f4] px-1.5 py-0.5 text-[10px] font-semibold text-[#1b6b6a]">
                                {lead.jobTitle}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col space-y-1 mt-1">
                            {lead.email ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                <a 
                                  href={`mailto:${lead.email}`}
                                  className="hover:text-[#44ACAB] transition-colors flex items-center gap-1 truncate max-w-[160px]"
                                  title="Send Email"
                                >
                                  <Mail className="h-3.5 w-3.5 text-[#44ACAB] shrink-0" />
                                  <span className="truncate">{lead.email}</span>
                                </a>
                                <button
                                  onClick={() => handleCopy(lead.email, `mail-${lead.id}`)}
                                  className="text-slate-400 hover:text-slate-600 ml-0.5"
                                  title="Copy Email"
                                >
                                  {copiedId === `mail-${lead.id}` ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">No email</span>
                            )}

                            {lead.phone ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                <a 
                                  href={`tel:${lead.phone}`}
                                  className="hover:text-[#44ACAB] transition-colors flex items-center gap-1"
                                  title="Call Phone"
                                >
                                  <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span>{lead.phone}</span>
                                </a>
                                <button
                                  onClick={() => handleCopy(lead.phone, `tel-${lead.id}`)}
                                  className="text-slate-400 hover:text-slate-600 ml-0.5"
                                  title="Copy Phone"
                                >
                                  {copiedId === `tel-${lead.id}` ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </td>

                        {/* Urgency / Emergency Level */}
                        <td className="px-3 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${emergencyCfg.bg} ${emergencyCfg.color} ${emergencyCfg.border}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${emergencyCfg.dot} ${lead.emergencyLevel === 'immediate' ? 'animate-pulse' : ''}`}></span>
                            {emergencyCfg.shortLabel}
                          </span>
                        </td>

                        {/* Service requested */}
                        <td className="px-3 py-4">
                          <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200">
                            {lead.serviceRequested}
                          </span>
                        </td>

                        {/* Status (with instant dropdown selector) */}
                        <td className="px-3 py-4">
                          <select
                            value={lead.status}
                            onChange={(e) => handleQuickStatusChange(lead.id, e.target.value as LeadStatus)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold border cursor-pointer ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} outline-none`}
                          >
                            <option value="new">New Lead</option>
                            <option value="contacted">Contacted</option>
                            <option value="in_discussion">In Discussion</option>
                            <option value="proposal_sent">Proposal Sent</option>
                            <option value="converted">Won / Converted</option>
                            <option value="lost">Lost / Closed</option>
                          </select>
                        </td>

                        {/* Priority */}
                        <td className="px-3 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${priorityCfg.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${priorityCfg.dot}`}></span>
                            {priorityCfg.label}
                          </span>
                        </td>

                        {/* Estimated Value */}
                        <td className="px-3 py-4">
                          {lead.estimatedValueDZD ? (
                            <span className="font-semibold text-slate-900 text-xs">
                              {lead.estimatedValueDZD.toLocaleString('fr-FR')} DZD
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Pending</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="px-3 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`admin-view-lead-${lead.id}`}
                              onClick={() => setViewingLead(lead)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                              title="View full lead record"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              id={`admin-edit-lead-${lead.id}`}
                              onClick={() => handleOpenEditModal(lead)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#44ACAB] transition-colors"
                              title="Edit lead"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              id={`admin-delete-lead-${lead.id}`}
                              onClick={() => handleDeleteLead(lead.id, lead.company)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete lead"
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
      </main>

      {/* CREATE / EDIT LEAD MODAL */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-slate-200 my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingLead ? `Edit Lead: ${editingLead.company}` : 'Register New Enterprise Lead'}
                </h2>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLead} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Company / Enterprise *
                    </label>
                    <input
                      id="lead-form-company"
                      type="text"
                      required
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      placeholder="e.g. SARL Maghreb Logistics"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Person *
                    </label>
                    <input
                      id="lead-form-name"
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Karim Benali"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Poste / Fonction (Job Title)
                    </label>
                    <input
                      id="lead-form-jobtitle"
                      type="text"
                      list="job-titles-list"
                      value={formJobTitle}
                      onChange={(e) => setFormJobTitle(e.target.value)}
                      placeholder="e.g. Directeur Général / DSI / DAF"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-none"
                    />
                    <datalist id="job-titles-list">
                      {JOB_TITLE_PRESETS.map((item) => (
                        <option key={item} value={item} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Location / Wilaya
                    </label>
                    <input
                      id="lead-form-location"
                      type="text"
                      list="locations-list"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. Alger, Oran, Sétif..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-none"
                    />
                    <datalist id="locations-list">
                      {LOCATION_PRESETS.map((loc) => (
                        <option key={loc} value={loc} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Industry / Sector
                    </label>
                    <select
                      id="lead-form-industry"
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-[#44ACAB] outline-none"
                    >
                      {INDUSTRY_PRESETS.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Urgency / Emergency Level
                    </label>
                    <select
                      id="lead-form-emergency"
                      value={formEmergencyLevel}
                      onChange={(e) => setFormEmergencyLevel(e.target.value as EmergencyLevel)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-[#44ACAB] outline-none font-semibold text-slate-800"
                    >
                      <option value="immediate">Urgent / Immédiat (&lt; 2 semaines)</option>
                      <option value="high">Prioritaire (&lt; 1 mois)</option>
                      <option value="medium">Planifié (1 à 3 mois)</option>
                      <option value="low">Exploratoire / Veille</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      id="lead-form-email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      id="lead-form-phone"
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. 0550123456"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Service Requested
                    </label>
                    <select
                      id="lead-form-service"
                      value={formService}
                      onChange={(e) => setFormService(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-[#44ACAB] outline-none"
                    >
                      <option value="ERPNext Implementation">ERPNext Implementation</option>
                      <option value="Custom Module Engineering">Custom Module Engineering</option>
                      <option value="ISO 9001 Integration">ISO 9001 Integration</option>
                      <option value="B2B Portal & Inventory">B2B Portal & Inventory</option>
                      <option value="Data Migration & Auditing">Data Migration & Auditing</option>
                      <option value="Staff Formation & Training">Staff Formation & Training</option>
                      <option value="Dedicated Support SLA">Dedicated Support SLA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Estimated Deal Value (DZD)
                    </label>
                    <input
                      id="lead-form-value"
                      type="number"
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1500000"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#44ACAB] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      id="lead-form-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="in_discussion">In Discussion</option>
                      <option value="proposal_sent">Proposal Sent</option>
                      <option value="converted">Won / Converted</option>
                      <option value="lost">Lost / Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Priority
                    </label>
                    <select
                      id="lead-form-priority"
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as LeadPriority)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Acquisition Source
                    </label>
                    <select
                      id="lead-form-source"
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value as LeadSource)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="direct_entry">Direct / Internal</option>
                      <option value="website_booking">Website Form</option>
                      <option value="referral">Client Referral</option>
                      <option value="phone">Phone Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Internal Notes & Project Requirements
                  </label>
                  <textarea
                    id="lead-form-notes"
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Provide specific client workflow details, timeline constraints, modules needed, or next steps..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#44ACAB] outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    id="lead-form-save-btn"
                    type="submit"
                    className="rounded-xl bg-[#44ACAB] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#328887] shadow-sm transition-all"
                  >
                    {editingLead ? 'Update Lead' : 'Save Lead'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEAD VIEW DETAILS DRAWER / MODAL */}
      <AnimatePresence>
        {viewingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-slate-200"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-bold border ${STATUS_CONFIG[viewingLead.status].bg} ${STATUS_CONFIG[viewingLead.status].color} ${STATUS_CONFIG[viewingLead.status].border}`}>
                      {STATUS_CONFIG[viewingLead.status].label}
                    </span>
                    {viewingLead.emergencyLevel && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${EMERGENCY_CONFIG[viewingLead.emergencyLevel].bg} ${EMERGENCY_CONFIG[viewingLead.emergencyLevel].color} ${EMERGENCY_CONFIG[viewingLead.emergencyLevel].border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${EMERGENCY_CONFIG[viewingLead.emergencyLevel].dot}`}></span>
                        {EMERGENCY_CONFIG[viewingLead.emergencyLevel].label}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{viewingLead.company}</h2>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {viewingLead.name}
                    </span>
                    {viewingLead.jobTitle && (
                      <span className="rounded bg-[#e6f4f4] px-2 py-0.5 text-xs font-semibold text-[#1b6b6a]">
                        {viewingLead.jobTitle}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setViewingLead(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Service</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{viewingLead.serviceRequested}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Urgency Level</p>
                    <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-[#44ACAB]" />
                      <span>{EMERGENCY_CONFIG[viewingLead.emergencyLevel || 'medium'].shortLabel}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Location / Wilaya</p>
                    <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      <span>{viewingLead.location || 'Alger'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Industry / Sector</p>
                    <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <Factory className="h-3.5 w-3.5 text-slate-500" />
                      <span className="truncate">{viewingLead.industry || 'Fabrication & Industrie'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Priority</p>
                    <p className="font-semibold text-slate-800 mt-0.5 capitalize">{viewingLead.priority}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Pipeline Value</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {viewingLead.estimatedValueDZD ? `${viewingLead.estimatedValueDZD.toLocaleString('fr-FR')} DZD` : 'To be estimated'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Acquisition Source</p>
                    <p className="font-semibold text-slate-800 mt-0.5 capitalize">
                      {viewingLead.source.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Inquiry Date</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {new Date(viewingLead.createdAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Contact</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingLead.email && (
                      <a
                        href={`mailto:${viewingLead.email}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-[#44ACAB] hover:text-[#44ACAB]"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#44ACAB]" />
                        <span>{viewingLead.email}</span>
                      </a>
                    )}
                    {viewingLead.phone && (
                      <a
                        href={`tel:${viewingLead.phone}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-[#44ACAB] hover:text-[#44ACAB]"
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{viewingLead.phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {(viewingLead.notes || viewingLead.message) && (
                  <div className="pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Notes & Scope</p>
                    <div className="rounded-2xl bg-slate-50 p-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {viewingLead.notes || viewingLead.message}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => {
                    handleOpenEditModal(viewingLead);
                    setViewingLead(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#44ACAB] hover:text-[#328887]"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Full Details</span>
                </button>

                <button
                  onClick={() => setViewingLead(null)}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Change Password Modal */}
        {isChangePasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-amber-600" />
                  <h2 className="text-base font-bold text-slate-900">Change Admin Password</h2>
                </div>
                <button 
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-3">
                    Active admin account: <span className="font-semibold text-slate-800">{currentUserEmail}</span>
                  </p>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="text"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password (min. 4 characters)"
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/30 outline-none"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This will be saved to your browser so you can log in with this new password.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#1b6b6a] px-4 py-2 text-xs font-bold text-white hover:bg-[#155453] shadow-sm"
                  >
                    Save New Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
