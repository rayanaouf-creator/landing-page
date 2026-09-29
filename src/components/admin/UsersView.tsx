import { useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Trash2, 
  Edit3, 
  Mail, 
  Phone, 
  Building2, 
  UserCheck, 
  UserX, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  LifeBuoy, 
  FolderGit2, 
  Eye, 
  EyeOff,
  KeyRound,
  Copy,
  Check,
  Lock,
  RefreshCw,
  FileSpreadsheet, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Info,
  Clock,
  Briefcase,
  SlidersHorizontal,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { AppUser, UserRole, UserStatus, CrmResource, ALL_CRM_RESOURCES } from '../../types';
import { userStorage } from '../../services/userStorage';

interface UsersViewProps {
  users: AppUser[];
  onRefresh: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Helper for default resources per role
export const getDefaultResourcesForRole = (role: UserRole): CrmResource[] => {
  switch (role) {
    case 'admin':
      return ['lead', 'opportunity', 'customer', 'project', 'claim', 'work', 'users'];
    case 'sales_manager':
      return ['lead', 'opportunity', 'customer'];
    case 'sales_rep':
      return ['lead', 'opportunity'];
    case 'support_agent':
      return ['customer', 'claim'];
    case 'project_manager':
      return ['customer', 'project', 'work'];
    case 'viewer':
    default:
      return ['lead', 'opportunity', 'customer', 'project', 'claim', 'work'];
  }
};

// Role configuration definitions with labels, colors, and permissions summary
export const ROLE_CONFIG: Record<UserRole, {
  label: string;
  badgeClass: string;
  borderClass: string;
  bgLight: string;
  icon: typeof ShieldCheck;
  description: string;
  permissions: string[];
}> = {
  admin: {
    label: 'Admin',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    borderClass: 'border-purple-500',
    bgLight: 'bg-purple-50',
    icon: ShieldCheck,
    description: 'Full master access to all CRM data, team roles, system settings, and exports.',
    permissions: ['Create & Edit all records', 'Manage Users & Assign Roles', 'Delete entries & Export data', 'Configure Work Portfolio']
  },
  sales_manager: {
    label: 'Sales Manager',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    borderClass: 'border-blue-500',
    bgLight: 'bg-blue-50',
    icon: TrendingUp,
    description: 'Supervises commercial pipelines, deals, sales targets, and client conversions.',
    permissions: ['Manage Opportunities & Stages', 'View Lead Activity Analytics', 'Assign Leads to Reps', 'Export Commercial Reports']
  },
  sales_rep: {
    label: 'Sales Rep',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    borderClass: 'border-teal-500',
    bgLight: 'bg-teal-50',
    icon: UserPlus,
    description: 'Handles daily lead outreach, logs calls and meetings, and advances discussions.',
    permissions: ['Log Contact Activity', 'Qualify & Update Inquiries', 'Create Opportunities', 'View Assigned Accounts']
  },
  support_agent: {
    label: 'Support Agent',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    borderClass: 'border-amber-500',
    bgLight: 'bg-amber-50',
    icon: LifeBuoy,
    description: 'Investigates customer tickets, logs quality incidents, and manages ISO 9001 CAPA.',
    permissions: ['Manage Support Claims', 'Execute ISO 9001 CAPA', 'Customer Quality Feedback', 'Resolve Incidents']
  },
  project_manager: {
    label: 'Project Manager',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    borderClass: 'border-cyan-500',
    bgLight: 'bg-cyan-50',
    icon: FolderGit2,
    description: 'Oversees ERPNext rollouts, custom software sprints, scopes, and milestones.',
    permissions: ['Update Project Status', 'Track Implementation Scope', 'Manage Customer Deliverables', 'Project Milestones']
  },
  viewer: {
    label: 'Viewer',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    borderClass: 'border-slate-400',
    bgLight: 'bg-slate-50',
    icon: Eye,
    description: 'Read-only access across CRM pipelines, reports, and portfolio projects.',
    permissions: ['Read-only View', 'No Edit or Delete Rights', 'No User Management Access']
  }
};

// Credentials helpers
export const generateRandomPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

export const generateSuggestedUsername = (name: string, email: string) => {
  if (name && name.trim()) {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9._-]/g, '');
  }
  if (email && email.trim() && email.includes('@')) {
    return email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
  }
  return 'user.' + Math.random().toString(36).substring(2, 6);
};

export function UsersView({ users, onRefresh, showToast }: UsersViewProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [assigningRoleUser, setAssigningRoleUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
  const [showRoleGuide, setShowRoleGuide] = useState(false);

  // Dedicated Credentials Modal State
  const [editingCredentialsUser, setEditingCredentialsUser] = useState<AppUser | null>(null);
  const [credentialsForm, setCredentialsForm] = useState({ username: '', password: '' });
  const [showCredentialsPassword, setShowCredentialsPassword] = useState(false);
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null);

  // Dedicated Resource Assignment Modal State
  const [assigningResourcesUser, setAssigningResourcesUser] = useState<AppUser | null>(null);
  const [selectedResources, setSelectedResources] = useState<CrmResource[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'sales_rep' as UserRole,
    status: 'active' as UserStatus,
    assignedResources: ['lead', 'opportunity'] as CrmResource[],
    department: '',
    title: '',
    phone: '',
    notes: ''
  });
  const [showPasswordInForm, setShowPasswordInForm] = useState(false);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const sales = users.filter((u) => u.role === 'sales_manager' || u.role === 'sales_rep').length;
    const supportAndOps = users.filter((u) => u.role === 'support_agent' || u.role === 'project_manager').length;
    return { total, active, admins, sales, supportAndOps };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        user.name.toLowerCase().includes(q) ||
        (user.username && user.username.toLowerCase().includes(q)) ||
        user.email.toLowerCase().includes(q) ||
        (user.department && user.department.toLowerCase().includes(q)) ||
        (user.title && user.title.toLowerCase().includes(q));

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCredential(label + text);
    showToast(`${label} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedCredential(null), 2500);
  };

  // Handlers
  const handleOpenAddModal = () => {
    const generatedPass = generateRandomPassword();
    setFormData({
      name: '',
      username: '',
      password: generatedPass,
      email: '',
      role: 'sales_rep',
      status: 'active',
      assignedResources: ['lead', 'opportunity'],
      department: 'Commercial & Sales',
      title: 'Sales Representative',
      phone: '',
      notes: ''
    });
    setShowPasswordInForm(false);
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username || generateSuggestedUsername(user.name, user.email),
      password: user.password || '',
      email: user.email,
      role: user.role,
      status: user.status,
      assignedResources: user.assignedResources && user.assignedResources.length > 0
        ? [...user.assignedResources]
        : getDefaultResourcesForRole(user.role),
      department: user.department || '',
      title: user.title || '',
      phone: user.phone || '',
      notes: user.notes || ''
    });
    setShowPasswordInForm(false);
    setIsAddModalOpen(true);
  };

  const handleOpenResourcesModal = (user: AppUser) => {
    setAssigningResourcesUser(user);
    const existing = user.assignedResources && user.assignedResources.length > 0
      ? user.assignedResources
      : getDefaultResourcesForRole(user.role);
    setSelectedResources([...existing]);
  };

  const handleSaveResources = async () => {
    if (!assigningResourcesUser) return;
    try {
      await userStorage.updateUserResources(assigningResourcesUser.id, selectedResources);
      showToast(`Assigned ${selectedResources.length} sidebar resources to ${assigningResourcesUser.name}!`, 'success');
      setAssigningResourcesUser(null);
      onRefresh();
    } catch {
      showToast('Failed to update sidebar resources.', 'error');
    }
  };

  const handleOpenCredentialsModal = (user: AppUser) => {
    setEditingCredentialsUser(user);
    setCredentialsForm({
      username: user.username || generateSuggestedUsername(user.name, user.email),
      password: user.password || ''
    });
    setShowCredentialsPassword(false);
  };

  const handleSaveCredentials = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCredentialsUser) return;
    const cleanUsername = credentialsForm.username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (!cleanUsername) {
      showToast('Username cannot be empty.', 'error');
      return;
    }

    try {
      await userStorage.updateUserCredentials(
        editingCredentialsUser.id,
        cleanUsername,
        credentialsForm.password
      );
      showToast(`Credentials updated for @${cleanUsername}!`, 'success');
      setEditingCredentialsUser(null);
      onRefresh();
    } catch {
      showToast('Failed to update credentials.', 'error');
    }
  };

  const handleSubmitUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Name and Email are required.', 'error');
      return;
    }

    const cleanUsername = formData.username.trim()
      ? formData.username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
      : generateSuggestedUsername(formData.name, formData.email);

    try {
      if (editingUser) {
        await userStorage.updateUser(editingUser.id, {
          name: formData.name.trim(),
          username: cleanUsername,
          password: formData.password.trim(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
          assignedResources: formData.assignedResources,
          department: formData.department.trim(),
          title: formData.title.trim(),
          phone: formData.phone.trim(),
          notes: formData.notes.trim()
        });
        showToast(`User ${formData.name} (@${cleanUsername}) updated successfully!`, 'success');
      } else {
        await userStorage.createUser({
          name: formData.name.trim(),
          username: cleanUsername,
          password: formData.password.trim() || generateRandomPassword(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
          assignedResources: formData.assignedResources,
          department: formData.department.trim(),
          title: formData.title.trim(),
          phone: formData.phone.trim(),
          notes: formData.notes.trim()
        });
        showToast(`User ${formData.name} (@${cleanUsername}) created with role "${ROLE_CONFIG[formData.role].label}"!`, 'success');
      }
      setIsAddModalOpen(false);
      setEditingUser(null);
      onRefresh();
    } catch {
      showToast('An error occurred while saving the user.', 'error');
    }
  };

  const handleQuickRoleChange = async (userId: string, newRole: UserRole, userName: string) => {
    try {
      await userStorage.updateUserRole(userId, newRole);
      showToast(`Assigned role "${ROLE_CONFIG[newRole].label}" to ${userName}.`, 'success');
      setAssigningRoleUser(null);
      onRefresh();
    } catch {
      showToast('Failed to update user role.', 'error');
    }
  };

  const handleToggleStatus = async (user: AppUser) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await userStorage.updateUserStatus(user.id, nextStatus);
      showToast(`User status set to ${nextStatus}.`, 'info');
      onRefresh();
    } catch {
      showToast('Failed to change user status.', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await userStorage.deleteUser(deletingUser.id);
      showToast(`User "${deletingUser.name}" has been removed.`, 'info');
      setDeletingUser(null);
      onRefresh();
    } catch {
      showToast('Failed to delete user.', 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset users directory back to original default accounts?')) {
      await userStorage.resetToDefaults();
      showToast('Default users restored successfully.', 'success');
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#e6f4f4] px-2.5 py-0.5 text-xs font-bold text-[#1b6b6a]">
              <Users className="h-3.5 w-3.5" />
              User & Role Management
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firebase Firestore RBAC
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Team Members & Roles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create user accounts, assign role permissions, and control team access across JetNext CRM.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowRoleGuide(!showRoleGuide)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
              showRoleGuide
                ? 'border-[#44ACAB] bg-[#e6f4f4] text-[#1b6b6a]'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Info className="h-4 w-4 text-[#44ACAB]" />
            <span>Role Guide</span>
          </button>

          <button
            onClick={() => userStorage.exportCSV()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            id="admin-create-user-btn"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#389695] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add New User</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Users</p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">{metrics.total}</p>
          <p className="mt-0.5 text-xs text-slate-400">In directory</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Active</p>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1 text-2xl font-black text-emerald-600">{metrics.active}</p>
          <p className="mt-0.5 text-xs text-slate-400">Can log in & work</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Admins</p>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-1 text-2xl font-black text-purple-600">{metrics.admins}</p>
          <p className="mt-0.5 text-xs text-slate-400">Master access</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Sales Team</p>
            <TrendingUp className="h-4 w-4 text-teal-500" />
          </div>
          <p className="mt-1 text-2xl font-black text-teal-600">{metrics.sales}</p>
          <p className="mt-0.5 text-xs text-slate-400">Managers & Reps</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-cyan-500 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">Support & Ops</p>
            <LifeBuoy className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="mt-1 text-2xl font-black text-cyan-600">{metrics.supportAndOps}</p>
          <p className="mt-0.5 text-xs text-slate-400">Agents & PMs</p>
        </div>
      </div>

      {/* ── ROLE GUIDE BANNER (COLLAPSIBLE) ── */}
      <AnimatePresence>
        {showRoleGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl bg-slate-900 text-white p-5 shadow-lg border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#44ACAB]" />
                  <h3 className="text-sm font-bold tracking-tight">Role Definitions & Access Permissions Matrix</h3>
                </div>
                <button
                  onClick={() => setShowRoleGuide(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(Object.keys(ROLE_CONFIG) as UserRole[]).map((roleKey) => {
                  const cfg = ROLE_CONFIG[roleKey];
                  const Icon = cfg.icon;
                  return (
                    <div key={roleKey} className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-lg bg-slate-700 text-[#44ACAB]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-white">{cfg.label}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                        {cfg.description}
                      </p>
                      <div className="space-y-1 pt-2 border-t border-slate-700/50">
                        {cfg.permissions.map((perm, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#44ACAB]" />
                            <span>{perm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, role, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#44ACAB]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="admin">Admin ({users.filter(u => u.role === 'admin').length})</option>
              <option value="sales_manager">Sales Manager ({users.filter(u => u.role === 'sales_manager').length})</option>
              <option value="sales_rep">Sales Rep ({users.filter(u => u.role === 'sales_rep').length})</option>
              <option value="support_agent">Support Agent ({users.filter(u => u.role === 'support_agent').length})</option>
              <option value="project_manager">Project Manager ({users.filter(u => u.role === 'project_manager').length})</option>
              <option value="viewer">Viewer ({users.filter(u => u.role === 'viewer').length})</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {(roleFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setRoleFilter('all');
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className="text-xs font-semibold text-[#1b6b6a] hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── USERS TABLE & DIRECTORY ── */}
      <div className="rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-3">User & Contact</th>
                <th className="px-3 py-3.5">Assigned Role (Click to Change)</th>
                <th className="px-3 py-3.5">Assigned Resources</th>
                <th className="px-3 py-3.5">Department & Title</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-3 py-3.5">Added Date</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Users className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try changing your search terms or filters.</p>
                    <button
                      onClick={handleOpenAddModal}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#44ACAB] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#389695]"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Add New User</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.viewer;
                  const RoleIcon = roleConfig.icon;
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr 
                      key={user.id} 
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xs ${
                            user.role === 'admin'
                              ? 'bg-gradient-to-tr from-purple-700 to-indigo-500'
                              : user.role === 'sales_manager'
                              ? 'bg-gradient-to-tr from-blue-700 to-cyan-500'
                              : user.role === 'sales_rep'
                              ? 'bg-gradient-to-tr from-[#1b6b6a] to-[#44ACAB]'
                              : user.role === 'support_agent'
                              ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
                              : user.role === 'project_manager'
                              ? 'bg-gradient-to-tr from-cyan-700 to-teal-500'
                              : 'bg-slate-500'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 group-hover:text-[#1b6b6a] transition-colors">
                                {user.name}
                              </span>
                              {user.role === 'admin' && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-purple-100 text-purple-700">
                                  SUPER
                                </span>
                              )}
                            </div>

                            {/* Username & Credential Pill */}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <button
                                type="button"
                                onClick={() => copyToClipboard(`@${user.username || user.email.split('@')[0]}`, 'Username')}
                                title="Click to copy username"
                                className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 text-[10px] font-mono font-medium transition-colors"
                              >
                                <span>@{user.username || user.email.split('@')[0]}</span>
                                <Copy className="h-2.5 w-2.5 text-slate-400" />
                              </button>
                              {user.password && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(user.password || '', 'Password')}
                                  title="Click to copy password"
                                  className="inline-flex items-center gap-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 text-[10px] font-mono transition-colors"
                                >
                                  <Lock className="h-2.5 w-2.5" />
                                  <span>••••••••</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-1">
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3 text-slate-400" />
                                <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
                              </span>
                              {user.phone && (
                                <span className="inline-flex items-center gap-1 text-slate-400">
                                  • <Phone className="h-3 w-3" />
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Quick Role Switcher */}
                      <td className="px-3 py-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setAssigningRoleUser(user)}
                            title="Click to assign or change role"
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border transition-all hover:shadow-xs group/btn ${roleConfig.badgeClass}`}
                          >
                            <RoleIcon className="h-3.5 w-3.5" />
                            <span>{roleConfig.label}</span>
                            <ChevronDown className="h-3 w-3 text-current opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      </td>

                      {/* Assigned Sidebar Resources */}
                      <td className="px-3 py-4">
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenResourcesModal(user)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition-colors group/res"
                            title="Click to assign sidebar resources"
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600 group-hover/res:rotate-90 transition-transform" />
                            <span>
                              {user.assignedResources ? user.assignedResources.length : 7} / {ALL_CRM_RESOURCES.length} Visible
                            </span>
                            <span className="text-[10px] text-teal-600 underline ml-0.5">Edit</span>
                          </button>
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {ALL_CRM_RESOURCES.map((r) => {
                              const isPermitted = user.assignedResources
                                ? user.assignedResources.includes(r.id)
                                : true;
                              if (!isPermitted) return null;
                              return (
                                <span
                                  key={r.id}
                                  className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {r.shortLabel}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Department & Title */}
                      <td className="px-3 py-4">
                        <p className="font-semibold text-slate-800">{user.title || 'Team Member'}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          {user.department || 'General'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title="Click to toggle active / inactive"
                          className="group/status inline-flex items-center gap-1.5"
                        >
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-colors ${
                            user.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover/status:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 group-hover/status:bg-slate-200'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              user.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`} />
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-4 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {new Date(user.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenResourcesModal(user)}
                            className="p-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Assign Sidebar Resources"
                          >
                            <SlidersHorizontal className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenCredentialsModal(user)}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Username & Password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setAssigningRoleUser(user)}
                            className="p-1.5 text-slate-500 hover:text-[#1b6b6a] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Assign Role"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User Details & Password"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="border-t border-slate-200 bg-slate-50/70 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users</span>
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Restore Default Team</span>
          </button>
        </div>
      </div>

      {/* ── ADD / EDIT USER MODAL ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between text-white shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#44ACAB]/20 text-[#44ACAB]">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">
                      {editingUser ? 'Edit User Details' : 'Create New User'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {editingUser ? `Updating account: ${editingUser.name}` : 'Add a new member to the JetNext CRM workspace'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                  title="Close (Esc)"
                >
                  <UserX className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitUser} className="flex-1 overflow-y-auto flex flex-col min-h-0 custom-dark-scrollbar">
                <div className="p-6 space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rayan Aouf"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#44ACAB]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rayan@jethings.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#44ACAB]"
                    />
                  </div>
                </div>

                {/* ── USERNAME & PASSWORD CREDENTIALS ── */}
                <div className="rounded-2xl border border-amber-200/90 bg-amber-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-amber-100 text-amber-800">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Login Credentials (Username & Password)
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                      Admin Editable
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Username */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Username *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const suggested = generateSuggestedUsername(formData.name, formData.email);
                            setFormData((prev) => ({ ...prev, username: suggested }));
                          }}
                          className="text-[10px] text-[#1b6b6a] hover:underline font-bold"
                        >
                          Auto-suggest
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">@</span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. rayan.aouf"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })}
                          className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-7 pr-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-[#44ACAB] focus:outline-hidden focus:ring-1 focus:ring-[#44ACAB]"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Unique login handle used across workspace.</p>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newPass = generateRandomPassword();
                            setFormData((prev) => ({ ...prev, password: newPass }));
                            setShowPasswordInForm(true);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-amber-800 hover:text-amber-950 font-bold"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Generate Strong</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPasswordInForm ? 'text' : 'password'}
                          required
                          placeholder="Set user password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-16 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-[#44ACAB] focus:outline-hidden focus:ring-1 focus:ring-[#44ACAB]"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowPasswordInForm(!showPasswordInForm)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title={showPasswordInForm ? 'Hide password' : 'Show password'}
                          >
                            {showPasswordInForm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          {formData.password && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(formData.password, 'Password')}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                              title="Copy password"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Can be revealed or reset anytime by admin.</p>
                    </div>
                  </div>
                </div>

                {/* ROLE SELECTION (CRITICAL FEATURE) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Assigned Role & Permissions *</span>
                    <span className="text-[11px] font-normal text-[#1b6b6a]">Select permission tier</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.keys(ROLE_CONFIG) as UserRole[]).map((rKey) => {
                      const cfg = ROLE_CONFIG[rKey];
                      const Icon = cfg.icon;
                      const isSelected = formData.role === rKey;
                      return (
                        <div
                          key={rKey}
                          onClick={() => setFormData({ ...formData, role: rKey })}
                          className={`cursor-pointer rounded-xl p-2.5 border transition-all text-left ${
                            isSelected
                              ? 'border-[#44ACAB] bg-[#e6f4f4] ring-2 ring-[#44ACAB]/40 shadow-xs'
                              : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-[#1b6b6a]' : 'text-slate-500'}`} />
                            <span className={`text-xs font-bold ${isSelected ? 'text-[#1b6b6a]' : 'text-slate-800'}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-2">
                            {cfg.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── ASSIGNED SIDEBAR RESOURCES (RESOURCE ACCESS PERMISSIONS) ── */}
                <div className="rounded-2xl border border-teal-200/90 bg-teal-50/40 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-teal-100 text-teal-800">
                        <SlidersHorizontal className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                          Assigned Sidebar Resources
                        </span>
                        <p className="text-[10px] text-teal-700">
                          Controls which menu items appear in this user's left sidebar
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                      {formData.assignedResources.length} of {ALL_CRM_RESOURCES.length} Visible
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                      Quick Presets:
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedResources: ['lead', 'opportunity', 'customer', 'project', 'claim', 'work', 'users'] })}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 transition-colors"
                    >
                      All Resources (7)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedResources: ['lead', 'opportunity', 'customer'] })}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Sales Pipeline (3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedResources: ['customer', 'claim'] })}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Support & Care (2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedResources: ['customer', 'project', 'work'] })}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Projects Ops (3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedResources: [] })}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Resource Checkboxes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {ALL_CRM_RESOURCES.map((res) => {
                      const isAssigned = formData.assignedResources.includes(res.id);
                      return (
                        <div
                          key={res.id}
                          onClick={() => {
                            const updated = isAssigned
                              ? formData.assignedResources.filter((r) => r !== res.id)
                              : [...formData.assignedResources, res.id];
                            setFormData({ ...formData, assignedResources: updated });
                          }}
                          className={`cursor-pointer rounded-xl p-2.5 border transition-all flex items-start gap-2.5 ${
                            isAssigned
                              ? 'border-[#44ACAB] bg-white ring-1 ring-[#44ACAB] shadow-xs'
                              : 'border-slate-200/80 bg-white/60 opacity-60 hover:opacity-100 hover:border-slate-300'
                          }`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                            isAssigned ? 'bg-[#1b6b6a] text-white' : 'border border-slate-300'
                          }`}>
                            {isAssigned && <Check className="h-3 w-3" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${isAssigned ? 'text-slate-900' : 'text-slate-500'}`}>
                                {res.label}
                              </span>
                              <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                {res.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {res.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                    >
                      <option value="Executive">Executive</option>
                      <option value="Commercial & Sales">Commercial & Sales</option>
                      <option value="Customer Success">Customer Success</option>
                      <option value="Technical Operations">Technical Operations</option>
                      <option value="Engineering & Development">Engineering & Development</option>
                      <option value="Finance & Admin">Finance & Admin</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior ERP Consultant"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#44ACAB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+213 550 00 00 00"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#44ACAB]"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                    >
                      <option value="active">Active (Can authenticate & operate)</option>
                      <option value="inactive">Inactive (Suspended account)</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Internal Notes & Scope
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Responsibilities, regional assignments (e.g. Algiers / Oran), or special notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#44ACAB]"
                  />
                </div>

                </div>

                {/* Fixed Bottom Actions Footer */}
                <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/95 backdrop-blur-xs flex items-center justify-end gap-2.5 shrink-0 sticky bottom-0 z-20">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#1b6b6a] hover:bg-[#155453] px-5 py-2 text-xs font-bold text-white shadow-md transition-all transform hover:scale-[1.01]"
                  >
                    {editingUser ? 'Save Changes' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── QUICK ROLE ASSIGNMENT MODAL ── */}
      <AnimatePresence>
        {assigningRoleUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden"
            >
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-[#44ACAB]" />
                  <div>
                    <h3 className="font-bold text-sm">Assign Role to User</h3>
                    <p className="text-xs text-slate-300">{assigningRoleUser.name} ({assigningRoleUser.email})</p>
                  </div>
                </div>
                <button
                  onClick={() => setAssigningRoleUser(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <UserX className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-xs text-slate-600">
                  Select a new role to instantly update permissions for <strong>{assigningRoleUser.name}</strong>:
                </p>

                <div className="space-y-2">
                  {(Object.keys(ROLE_CONFIG) as UserRole[]).map((rKey) => {
                    const cfg = ROLE_CONFIG[rKey];
                    const Icon = cfg.icon;
                    const isCurrent = assigningRoleUser.role === rKey;

                    return (
                      <button
                        key={rKey}
                        onClick={() => handleQuickRoleChange(assigningRoleUser.id, rKey, assigningRoleUser.name)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? 'border-[#44ACAB] bg-[#e6f4f4] ring-1 ring-[#44ACAB]'
                            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${cfg.bgLight}`}>
                            <Icon className="h-4 w-4 text-slate-700" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{cfg.label}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-[#1b6b6a] bg-white px-1.5 py-0.2 rounded border border-[#44ACAB]/40">
                                  Current Role
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {cfg.description}
                            </p>
                          </div>
                        </div>
                        {isCurrent && <CheckCircle2 className="h-4 w-4 text-[#1b6b6a]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setAssigningRoleUser(null)}
                    className="rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EDIT CREDENTIALS MODAL (QUICK ACTION) ── */}
      <AnimatePresence>
        {editingCredentialsUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/20 text-white">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Edit User Credentials</h3>
                    <p className="text-xs text-amber-100">{editingCredentialsUser.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCredentialsUser(null)}
                  className="rounded-lg p-1 text-amber-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <UserX className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCredentials} className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="h-9 w-9 rounded-full bg-[#1b6b6a] text-white flex items-center justify-center font-bold text-xs">
                    {editingCredentialsUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{editingCredentialsUser.name}</p>
                    <p className="text-[11px] text-slate-500">{editingCredentialsUser.email}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Username *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCredentialsForm({
                          ...credentialsForm,
                          username: generateSuggestedUsername(editingCredentialsUser.name, editingCredentialsUser.email)
                        });
                      }}
                      className="text-[10px] text-[#1b6b6a] font-semibold hover:underline"
                    >
                      Reset to default
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={credentialsForm.username}
                      onChange={(e) => setCredentialsForm({
                        ...credentialsForm,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '')
                      })}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-7 pr-3 text-xs font-mono text-slate-900 focus:border-[#44ACAB] focus:outline-hidden focus:ring-1 focus:ring-[#44ACAB]"
                      placeholder="e.g. username"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setCredentialsForm({
                        ...credentialsForm,
                        password: generateRandomPassword()
                      })}
                      className="inline-flex items-center gap-1 text-[10px] text-amber-700 hover:text-amber-900 font-semibold"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Generate New</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showCredentialsPassword ? 'text' : 'password'}
                      required
                      value={credentialsForm.password}
                      onChange={(e) => setCredentialsForm({
                        ...credentialsForm,
                        password: e.target.value
                      })}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-16 text-xs font-mono text-slate-900 focus:border-[#44ACAB] focus:outline-hidden focus:ring-1 focus:ring-[#44ACAB]"
                      placeholder="Enter new password"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowCredentialsPassword(!showCredentialsPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        title={showCredentialsPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCredentialsPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      {credentialsForm.password && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(credentialsForm.password, 'Password')}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          title="Copy password"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCredentialsUser(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-all"
                  >
                    Save Credentials
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DEDICATED ASSIGN RESOURCES MODAL ── */}
      <AnimatePresence>
        {assigningResourcesUser && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col"
            >
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between text-white shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Assign Sidebar Resources</h3>
                    <p className="text-xs text-slate-300">
                      {assigningResourcesUser.name} (@{assigningResourcesUser.username || assigningResourcesUser.email.split('@')[0]})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAssigningResourcesUser(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                  title="Close (Esc)"
                >
                  <UserX className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-dark-scrollbar">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    Select which CRM modules appear in <strong>{assigningResourcesUser.name}'s</strong> sidebar:
                  </p>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    {selectedResources.length} of {ALL_CRM_RESOURCES.length} Selected
                  </span>
                </div>

                {/* Preset shortcuts */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedResources(ALL_CRM_RESOURCES.map((r) => r.id))}
                    className="px-2 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedResources(['lead', 'opportunity', 'customer'])}
                    className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Sales (3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedResources(['customer', 'claim'])}
                    className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Support (2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedResources(['customer', 'project', 'work'])}
                    className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Projects (3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedResources(getDefaultResourcesForRole(assigningResourcesUser.role))}
                    className="px-2 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    Role Default ({ROLE_CONFIG[assigningResourcesUser.role].label})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedResources([])}
                    className="px-2 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Resource List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {ALL_CRM_RESOURCES.map((res) => {
                    const isSelected = selectedResources.includes(res.id);
                    return (
                      <div
                        key={res.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedResources(selectedResources.filter((r) => r !== res.id));
                          } else {
                            setSelectedResources([...selectedResources, res.id]);
                          }
                        }}
                        className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-[#44ACAB] bg-[#e6f4f4] ring-1 ring-[#44ACAB]'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#1b6b6a] text-white' : 'border border-slate-300'
                          }`}>
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${isSelected ? 'text-[#1b6b6a]' : 'text-slate-800'}`}>
                                {res.label}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                {res.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{res.description}</p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                          isSelected ? 'bg-[#1b6b6a] text-white' : 'text-slate-400'
                        }`}>
                          {isSelected ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/95 backdrop-blur-xs flex items-center justify-end gap-2.5 shrink-0 sticky bottom-0 z-20">
                  <button
                    type="button"
                    onClick={() => setAssigningResourcesUser(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveResources}
                    className="rounded-xl bg-[#1b6b6a] hover:bg-[#155453] px-5 py-2 text-xs font-bold text-white shadow-md transition-all"
                  >
                    Apply Resources ({selectedResources.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Remove Team Member?</h3>
              <p className="mt-1 text-xs text-slate-500">
                Are you sure you want to delete <strong>{deletingUser.name}</strong> ({deletingUser.email})? This action will revoke their access to the workspace.
              </p>
              <div className="mt-5 flex items-center justify-center gap-2.5">
                <button
                  onClick={() => setDeletingUser(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-md"
                >
                  Yes, Remove User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
