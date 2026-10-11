import { useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Plus,
  Search,
  Clock,
  Calendar,
  CheckCircle2,
  X,
  AlertTriangle,
  Edit3,
  Trash2,
  Building2,
  MapPin
} from 'lucide-react';
import { Reminder, ReminderStatus, ReminderPriority, Lead, AppUser } from '../../types';
import { reminderStorage } from '../../services/reminderStorage';
import { leadStorage } from '../../services/leadStorage';

interface ReminderViewProps {
  reminders: Reminder[];
  leads?: Lead[];
  currentUser?: AppUser | null;
  onRefresh: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const PRIORITY_CONFIG: Record<ReminderPriority, { label: string; color: string; bg: string; border: string; dot: string }> = {
  high: { label: 'High', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500' },
  medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-500' }
};

const STATUS_CONFIG: Record<ReminderStatus, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' }
};

export function ReminderView({ reminders, leads = [], currentUser, onRefresh, showToast }: ReminderViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modals
  const [viewingReminder, setViewingReminder] = useState<Reminder | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    leadId: string;
    status: ReminderStatus;
    priority: ReminderPriority;
    dueDate: string;
  }>({
    title: '',
    description: '',
    leadId: '',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date().toISOString().slice(0, 16)
  });

  // Filtered Reminders
  const filteredReminders = useMemo(() => {
    return reminders.filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.leadName && r.leadName.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [reminders, searchTerm, statusFilter, priorityFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const now = new Date();
    return {
      total: reminders.length,
      pending: reminders.filter(r => r.status === 'pending').length,
      overdue: reminders.filter(r => {
        if (r.status !== 'pending') return false;
        const dueDate = new Date(r.dueDate);
        return dueDate < now;
      }).length,
      completed: reminders.filter(r => r.status === 'completed').length
    };
  }, [reminders]);

  const handleOpenAdd = () => {
    setEditingReminder(null);
    setFormData({
      title: '',
      description: '',
      leadId: '',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date().toISOString().slice(0, 16)
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      leadId: reminder.leadId || '',
      status: reminder.status,
      priority: reminder.priority,
      dueDate: reminder.dueDate.slice(0, 16)
    });
    setIsFormOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter a reminder title', 'error');
      return;
    }

    const hasLeadLink = formData.leadId && formData.leadId.trim() !== '';
    const reminderData: any = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      dueDate: new Date(formData.dueDate).toISOString()
    };

    if (hasLeadLink) {
      reminderData.leadId = formData.leadId;
      reminderData.leadName = leads.find(l => l.id === formData.leadId)?.company;
    }

    if (editingReminder) {
      reminderStorage.updateReminder(editingReminder.id, reminderData);
      showToast('Reminder updated successfully');
    } else {
      reminderStorage.saveReminder({
        ...reminderData,
        createdBy: currentUser?.name || 'Admin'
      });
      showToast('Reminder created successfully');
    }

    setIsFormOpen(false);
    setEditingReminder(null);
    onRefresh();
  };

  const handleDelete = () => {
    if (!deletingReminder) return;
    reminderStorage.deleteReminder(deletingReminder.id);
    showToast('Reminder deleted');
    setDeletingReminder(null);
    onRefresh();
  };

  const handleMarkComplete = (reminder: Reminder) => {
    reminderStorage.markAsCompleted(reminder.id);
    showToast('Reminder marked as completed');
    onRefresh();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (reminder: Reminder) => {
    if (reminder.status !== 'pending') return false;
    const now = new Date();
    const dueDate = new Date(reminder.dueDate);
    return dueDate < now;
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Reminders</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{metrics.total}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">All reminders</p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200 border-l-4 border-amber-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-amber-600">{metrics.pending}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Awaiting action</p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200 border-l-4 border-rose-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Overdue</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-rose-600">{metrics.overdue}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Past due date</p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200 border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Completed</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-600">{metrics.completed}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Finished tasks</p>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reminders..."
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
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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
            Add Reminder
          </button>
        </div>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-xs ring-1 ring-slate-200">
          <Bell className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No reminders found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try clearing your filters or search'
              : 'Create your first reminder to track meetings and follow-ups'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredReminders.map((reminder) => {
              const priorityCfg = PRIORITY_CONFIG[reminder.priority];
              const statusCfg = STATUS_CONFIG[reminder.status];
              const overdue = isOverdue(reminder);

              return (
                <div
                  key={reminder.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">{reminder.title}</h4>
                        {overdue && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertTriangle className="h-3 w-3" />
                            Overdue
                          </span>
                        )}
                      </div>

                      {reminder.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{reminder.description}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(reminder.dueDate)}</span>
                        </div>

                        {reminder.leadId && reminder.leadName && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{reminder.leadName}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${priorityCfg.bg} ${priorityCfg.color} ${priorityCfg.border}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${priorityCfg.dot}`}></span>
                            {priorityCfg.label}
                          </span>
                          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {reminder.status === 'pending' && (
                        <button
                          onClick={() => handleMarkComplete(reminder)}
                          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Mark as completed"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(reminder)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingReminder(reminder)}
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
                    {editingReminder ? 'Edit Reminder' : 'New Reminder'}
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
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                      placeholder="e.g., Follow-up meeting with Optilens"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none resize-none"
                      placeholder="Add details about this reminder..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Link to Lead (Optional)
                    </label>
                    <select
                      value={formData.leadId}
                      onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#44ACAB] outline-none"
                    >
                      <option value="">No linked lead</option>
                      {leads.map((lead) => (
                        <option key={lead.id} value={lead.id}>
                          {lead.company} - {lead.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Due Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#44ACAB] focus:ring-1 focus:ring-[#44ACAB] outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as ReminderPriority })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#44ACAB] outline-none"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ReminderStatus })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-[#44ACAB] outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
                      {editingReminder ? 'Update' : 'Create'} Reminder
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
        {deletingReminder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingReminder(null)}
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
                  <h3 className="text-lg font-bold text-slate-900">Delete Reminder</h3>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  Are you sure you want to delete the reminder "{deletingReminder.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingReminder(null)}
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
