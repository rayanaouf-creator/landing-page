import { useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Download, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  X, 
  Star, 
  AlertCircle, 
  Tag, 
  ExternalLink,
  CalendarDays,
  Presentation,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { CompanyEvent, EventType, EventStatus } from '../../types';
import { eventStorage } from '../../services/eventStorage';

interface EventsViewProps {
  events: CompanyEvent[];
  onRefresh: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const EVENT_TYPES: { id: EventType; label: string; icon: typeof Calendar }[] = [
  { id: 'meeting', label: 'Strategy Meeting', icon: Briefcase },
  { id: 'launch', label: 'Product Launch', icon: Presentation },
  { id: 'audit', label: 'ISO / Quality Audit', icon: ShieldCheck },
  { id: 'training', label: 'Technical Training', icon: CalendarDays },
  { id: 'conference', label: 'Trade Expo / Conference', icon: Users },
  { id: 'webinar', label: 'Client Webinar', icon: ExternalLink }
];

export function EventsView({ events, onRefresh, showToast }: EventsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [viewingEvent, setViewingEvent] = useState<CompanyEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CompanyEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<CompanyEvent | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: EventType;
    status: EventStatus;
    startDate: string;
    endDate: string;
    time: string;
    location: string;
    organizer: string;
    attendeesCount: number;
    tags: string;
    isImportant: boolean;
  }>({
    title: '',
    description: '',
    type: 'meeting',
    status: 'upcoming',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    time: '10:00 - 12:00',
    location: 'JetNext Main Office, Algiers',
    organizer: 'JetNext Team',
    attendeesCount: 10,
    tags: 'Internal, Strategy',
    isImportant: false
  });

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(q)));

      const matchesType = typeFilter === 'all' || e.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, searchTerm, typeFilter, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: events.length,
      upcoming: events.filter(e => e.status === 'upcoming').length,
      important: events.filter(e => e.isImportant).length,
      launchesAndAudits: events.filter(e => e.type === 'launch' || e.type === 'audit').length
    };
  }, [events]);

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      type: 'meeting',
      status: 'upcoming',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      time: '10:00 - 12:00',
      location: 'JetNext Main Office, Algiers',
      organizer: 'JetNext Team',
      attendeesCount: 15,
      tags: 'Corporate, Schedule',
      isImportant: false
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (event: CompanyEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate || '',
      time: event.time || '',
      location: event.location,
      organizer: event.organizer,
      attendeesCount: event.attendeesCount || 0,
      tags: (event.tags || []).join(', '),
      isImportant: Boolean(event.isImportant)
    });
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) {
      showToast('Title and Start Date are required.', 'error');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate ? formData.endDate : undefined,
      time: formData.time.trim() || undefined,
      location: formData.location.trim() || 'JetNext Office',
      organizer: formData.organizer.trim() || 'JetNext Admin',
      attendeesCount: Number(formData.attendeesCount) || 0,
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
      isImportant: formData.isImportant
    };

    try {
      if (editingEvent) {
        await eventStorage.updateEvent(editingEvent.id, payload);
        showToast(`Event "${payload.title}" updated successfully!`, 'success');
      } else {
        await eventStorage.createEvent(payload);
        showToast(`Event "${payload.title}" scheduled!`, 'success');
      }
      setIsFormOpen(false);
      setEditingEvent(null);
      onRefresh();
    } catch {
      showToast('Failed to save event.', 'error');
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    try {
      await eventStorage.deleteEvent(deletingEvent.id);
      showToast(`Event "${deletingEvent.title}" removed.`, 'info');
      setDeletingEvent(null);
      onRefresh();
    } catch {
      showToast('Failed to delete event.', 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('Restore default corporate events & calendar schedules?')) {
      await eventStorage.resetToDefaults();
      showToast('Default events restored.', 'success');
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700 ring-1 ring-violet-200">
              <Calendar className="h-3.5 w-3.5" />
              Corporate Calendar & Events
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firestore Synced
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Summits, Audits & Client Sprints
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Team Schedule & Company Events
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Track key product launch summits, ISO certification audits, technical training workshops, and client presentations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => eventStorage.exportCSV()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="admin-create-event-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1b6b6a] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#155453] transition-all transform hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Event</span>
          </button>
        </div>
      </div>

      {/* ── METRICS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Events</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{metrics.total}</p>
          <p className="mt-0.5 text-xs text-slate-400">Scheduled on calendar</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-emerald-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Upcoming</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{metrics.upcoming}</p>
          <p className="mt-0.5 text-xs text-slate-400">Scheduled ahead</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-amber-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">High Priority</p>
          <p className="mt-1 text-2xl font-black text-amber-600">{metrics.important}</p>
          <p className="mt-0.5 text-xs text-slate-400">Important milestones</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 border-l-4 border-violet-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Launches & Audits</p>
          <p className="mt-1 text-2xl font-black text-violet-600">{metrics.launchesAndAudits}</p>
          <p className="mt-0.5 text-xs text-slate-400">ISO and product summits</p>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, summits, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#44ACAB] focus:outline-hidden"
          >
            <option value="all">All Event Types ({events.length})</option>
            {EVENT_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#44ACAB] focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── EVENTS LIST / GRID ── */}
      <div className="space-y-3.5">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-xs ring-1 ring-slate-200">
            <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-700">No events found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing your filters or add a new scheduled event.</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const typeConfig = EVENT_TYPES.find(t => t.id === event.type);
            const Icon = typeConfig?.icon || Calendar;

            return (
              <div
                key={event.id}
                className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-200 hover:shadow-md hover:ring-[#44ACAB]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left Date Badge & Details */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Date Block */}
                  <div className="flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shrink-0 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#44ACAB]">
                      {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-black leading-none mt-0.5">
                      {new Date(event.startDate).getDate() || event.startDate.split('-')[2]}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">
                      {new Date(event.startDate).getFullYear()}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-[#1b6b6a] border border-teal-200">
                        <Icon className="h-3 w-3" />
                        {typeConfig?.label || event.type}
                      </span>

                      {event.isImportant && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          Featured Milestone
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        event.status === 'upcoming'
                          ? 'bg-emerald-100 text-emerald-800'
                          : event.status === 'ongoing'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : event.status === 'completed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {event.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 
                      className="font-bold text-slate-900 text-base leading-snug hover:text-[#1b6b6a] cursor-pointer transition-colors"
                      onClick={() => setViewingEvent(event)}
                    >
                      {event.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Metadata chips */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {event.time && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        <span className="truncate max-w-xs">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <Users className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Lead: <strong>{event.organizer}</strong> {event.attendeesCount ? `(${event.attendeesCount} pax)` : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => setViewingEvent(event)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleOpenEdit(event)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Edit Event"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingEvent(event)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-slate-50/70 p-4 rounded-xl flex items-center justify-between text-xs text-slate-500">
        <span>Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events</span>
        <button
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Restore Default Events</span>
        </button>
      </div>

      {/* ── EVENT DETAILS MODAL ── */}
      <AnimatePresence>
        {viewingEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col relative"
            >
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between text-white shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">
                      Event Details
                    </span>
                    <h3 className="font-bold text-base leading-tight">
                      {viewingEvent.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setViewingEvent(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-dark-scrollbar text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Date & Timing</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {viewingEvent.startDate} {viewingEvent.endDate ? `to ${viewingEvent.endDate}` : ''}
                    </span>
                    {viewingEvent.time && <span className="text-slate-500">{viewingEvent.time}</span>}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Location</span>
                    <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span>{viewingEvent.location}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Organizer & Lead</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{viewingEvent.organizer}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Expected Attendance</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{viewingEvent.attendeesCount || 0} participants</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description & Agenda</h4>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-700 leading-relaxed whitespace-pre-line">
                    {viewingEvent.description}
                  </div>
                </div>

                {viewingEvent.tags && viewingEvent.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tags:</span>
                    {viewingEvent.tags.map((tag, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <button
                  onClick={() => {
                    const toEdit = viewingEvent;
                    setViewingEvent(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1b6b6a] hover:underline"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Event</span>
                </button>
                <button
                  onClick={() => setViewingEvent(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD / EDIT EVENT MODAL ── */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col relative"
            >
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between text-white shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#44ACAB]/20 text-[#44ACAB]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">
                      {editingEvent ? 'Edit Event Schedule' : 'Schedule New Event'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Plan summits, client demonstrations, ISO audits, and training milestones
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

              <form onSubmit={handleSaveEvent} className="flex-1 overflow-y-auto min-h-0 flex flex-col custom-dark-scrollbar">
                <div className="p-6 space-y-4 flex-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ERPNext v16 Enterprise Solutions Launch"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Event Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      >
                        {EVENT_TYPES.map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Timing
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 09:30 - 16:30"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Location / Venue *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. El Aurassi Hotel, Algiers"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Organizer / Lead
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Amina Benali"
                        value={formData.organizer}
                        onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Event Scope & Agenda *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Objectives, presentation topics, client attendees, and deliverables..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Estimated Attendees
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.attendeesCount}
                        onChange={(e) => setFormData({ ...formData, attendeesCount: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="SAFEX, ERPNext, Demo"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={formData.isImportant}
                        onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-[#1b6b6a] focus:ring-[#44ACAB] accent-[#1b6b6a]"
                      />
                      <span>Mark as Featured Milestone / High Priority Event</span>
                    </label>
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
                    {editingEvent ? 'Save Changes' : 'Schedule Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deletingEvent && (
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
              <h3 className="text-base font-bold text-slate-900">Cancel / Delete Event?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>"{deletingEvent.title}"</strong> from the corporate calendar?
              </p>

              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingEvent(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Keep Event
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
                >
                  Delete Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
