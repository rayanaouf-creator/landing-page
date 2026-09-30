import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageCircle, 
  Mail, 
  PhoneCall, 
  Users, 
  Video, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Calendar,
  Building2,
  User,
  History,
  Send,
  Sparkles
} from 'lucide-react';
import { ContactChannel, ClientInteraction } from '../../types';

export const CONTACT_CHANNELS: {
  id: ContactChannel;
  label: string;
  shortLabel: string;
  icon: typeof MessageCircle;
  color: string;
  bg: string;
  border: string;
  ring: string;
}[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    shortLabel: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    ring: 'ring-emerald-400'
  },
  {
    id: 'mail',
    label: 'Email / Mail',
    shortLabel: 'Mail',
    icon: Mail,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    ring: 'ring-purple-400'
  },
  {
    id: 'phone',
    label: 'Phone Call',
    shortLabel: 'Phone Call',
    icon: PhoneCall,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    ring: 'ring-blue-400'
  },
  {
    id: 'face_to_face',
    label: 'Face to Face',
    shortLabel: 'In-Person',
    icon: Users,
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    ring: 'ring-amber-400'
  },
  {
    id: 'video_call',
    label: 'Video Call / Meeting',
    shortLabel: 'Video Meet',
    icon: Video,
    color: 'text-cyan-800',
    bg: 'bg-cyan-50',
    border: 'border-cyan-300',
    ring: 'ring-cyan-400'
  },
  {
    id: 'other',
    label: 'Other / SMS',
    shortLabel: 'Other',
    icon: MessageCircle,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    ring: 'ring-slate-400'
  }
];

export const OUTCOME_PRESETS = [
  'In Discussion / Interested',
  'Quotation / Proposal Sent',
  'Follow-up Call Scheduled',
  'Meeting Booked (Demo / Visit)',
  'Client Reviewing Pricing',
  'Order / Deal Converted',
  'Unreachable / No Answer / Left Voicemail',
  'General Inquiry / Information Sent'
];

interface ClientContactLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  clientCompany?: string;
  clientPhone?: string;
  clientEmail?: string;
  contactHistory?: ClientInteraction[];
  currentUserName?: string;
  onSaveInteraction: (interaction: ClientInteraction) => void;
  onDeleteInteraction?: (interactionId: string) => void;
}

export function ClientContactLogModal({
  isOpen,
  onClose,
  clientName,
  clientCompany,
  clientPhone,
  clientEmail,
  contactHistory = [],
  currentUserName = 'Rayan Aouf',
  onSaveInteraction,
  onDeleteInteraction
}: ClientContactLogModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<ContactChannel>('whatsapp');
  const [summary, setSummary] = useState('');
  const [outcome, setOutcome] = useState('In Discussion / Interested');
  const [contactedAt, setContactedAt] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [loggedBy, setLoggedBy] = useState(currentUserName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newInteraction: ClientInteraction = {
      id: `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      channel: selectedChannel,
      contactedAt: new Date(contactedAt).toISOString(),
      summary: summary.trim(),
      outcome: outcome.trim() || undefined,
      loggedBy: loggedBy.trim() || currentUserName,
      nextFollowUpDate: nextFollowUpDate || undefined
    };

    onSaveInteraction(newInteraction);
    setSummary('');
    setIsSubmitting(false);
  };

  const getChannelConfig = (channel: ContactChannel) => {
    return CONTACT_CHANNELS.find(c => c.id === channel) || CONTACT_CHANNELS[0];
  };

  const sortedHistory = [...contactHistory].sort((a, b) => {
    return new Date(b.contactedAt).getTime() - new Date(a.contactedAt).getTime();
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col relative"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between text-white shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#44ACAB]/20 text-[#44ACAB] border border-[#44ACAB]/30">
                <History className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">
                    Client Contact Tracker & History
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-[#44ACAB] border border-[#44ACAB]/30">
                    {contactHistory.length} Interaction{contactHistory.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                  {clientCompany && (
                    <span className="font-semibold text-white flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      {clientCompany}
                    </span>
                  )}
                  {clientCompany && <span>•</span>}
                  <span className="flex items-center gap-1 text-slate-300">
                    <User className="h-3 w-3 text-slate-400" />
                    {clientName}
                  </span>
                  {clientPhone && (
                    <>
                      <span>•</span>
                      <span className="text-slate-300">{clientPhone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-dark-scrollbar">
            {/* ── NEW CONTACT ENTRY FORM ── */}
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#1b6b6a]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Log New Client Contact
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500">
                  Every entry is permanently preserved in contact history
                </span>
              </div>

              {/* 1. Channel Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Contact Channel *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONTACT_CHANNELS.map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = selectedChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setSelectedChannel(ch.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? `${ch.bg} ${ch.border} ring-2 ${ch.ring} shadow-xs font-bold`
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? ch.bg : 'bg-slate-100'} ${ch.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`text-xs ${isSelected ? ch.color : 'text-slate-700 font-semibold'}`}>
                          {ch.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Date, Time & Staff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Contact Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={contactedAt}
                    onChange={(e) => setContactedAt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Staff Member
                  </label>
                  <input
                    type="text"
                    value={loggedBy}
                    onChange={(e) => setLoggedBy(e.target.value)}
                    placeholder="e.g. Rayan Aouf"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 3. Outcome & Next Follow Up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Discussion Outcome / Status
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:outline-hidden"
                  >
                    {OUTCOME_PRESETS.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Next Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 4. Summary / Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                  <span>Contact Notes & Discussion Summary</span>
                  <span className="text-[11px] font-normal text-slate-400">Optional</span>
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. Discussed ERPNext supply chain implementation. Client requested quote for 15 users. Will follow up via WhatsApp on Thursday..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#44ACAB] focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b6b6a] hover:bg-[#155453] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Log Contact</span>
                </button>
              </div>
            </form>

            {/* ── ALL CONTACT INTERACTIONS TIMELINE ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[#1b6b6a]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Client Interaction History ({sortedHistory.length})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {sortedHistory.length > 0 ? 'Full chronological log (most recent first)' : 'No interactions recorded yet'}
                </span>
              </div>

              {sortedHistory.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[#1b6b6a] mb-2.5">
                    <History className="h-6 w-6" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-700">No contact history recorded yet</h5>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                    When you contact this client via WhatsApp, Mail, Phone, or Face-to-Face, log it above to build a permanent interaction record.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {sortedHistory.map((interaction, idx) => {
                    const cfg = getChannelConfig(interaction.channel);
                    const Icon = cfg.icon;
                    const dateObj = new Date(interaction.contactedAt);
                    const isRecent = idx === 0;

                    return (
                      <div key={interaction.id || idx} className="relative group">
                        {/* Timeline dot */}
                        <div className={`absolute -left-6 top-2 h-5 w-5 rounded-full flex items-center justify-center border-2 border-white ring-2 ${
                          isRecent ? 'bg-[#1b6b6a] ring-[#44ACAB]/40' : 'bg-slate-400 ring-slate-200'
                        } text-white`}>
                          <Icon className="h-2.5 w-2.5" />
                        </div>

                        {/* Card */}
                        <div className={`p-3.5 rounded-xl border bg-white shadow-2xs transition-all ${
                          isRecent ? 'border-teal-200/90 ring-1 ring-teal-100' : 'border-slate-200 hover:border-slate-300'
                        }`}>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                <Icon className="h-3 w-3" />
                                {cfg.label}
                              </span>

                              {interaction.outcome && (
                                <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {interaction.outcome}
                                </span>
                              )}

                              {isRecent && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded-full">
                                  Latest
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                {dateObj.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })} at {dateObj.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>

                              {onDeleteInteraction && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteInteraction(interaction.id)}
                                  className="text-slate-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove this contact log"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {interaction.summary ? (
                            <p className="text-xs text-slate-800 leading-relaxed font-sans bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line">
                              {interaction.summary}
                            </p>
                          ) : (
                            <p className="text-[11px] italic text-slate-400">
                              No additional discussion notes provided.
                            </p>
                          )}

                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-400">
                            <span>Logged by: <strong>{interaction.loggedBy || 'Admin Team'}</strong></span>
                            {interaction.nextFollowUpDate && (
                              <span className="text-amber-700 font-medium">
                                Follow-up: <strong>{interaction.nextFollowUpDate}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500">
              Total Contacts: <strong>{contactHistory.length}</strong>
            </span>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
