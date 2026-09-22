import { useState, useMemo, FormEvent } from 'react';
import { 
  TrendingUp, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Building2,
  PieChart
} from 'lucide-react';
import { Opportunity, OpportunityStage, Customer } from '../../types';
import { opportunityStorage } from '../../services/opportunityStorage';
import { SERVICE_PRESETS } from '../../pages/Admin';

const STAGE_CONFIG: Record<OpportunityStage, { label: string; color: string; bg: string; border: string }> = {
  qualification: { label: 'Qualification', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  proposal: { label: 'Proposal Sent', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  negotiation: { label: 'Negotiation', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  closed_won: { label: 'Closed Won', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  closed_lost: { label: 'Closed Lost', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' }
};

interface OpportunityViewProps {
  opportunities: Opportunity[];
  customers: Customer[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  initialCustomer?: Customer | null;
  stageFilter?: string;
  onStageFilterChange?: (stage: string) => void;
}

export function OpportunityView({
  opportunities,
  customers,
  onRefresh,
  showToast,
  isAddModalOpen = false,
  onCloseAddModal,
  initialCustomer,
  stageFilter = 'all',
  onStageFilterChange
}: OpportunityViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localStageFilter, setLocalStageFilter] = useState(stageFilter);

  const currentStage = onStageFilterChange ? stageFilter : localStageFilter;
  const setStage = (val: string) => {
    if (onStageFilterChange) onStageFilterChange(val);
    else setLocalStageFilter(val);
  };

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(isAddModalOpen || Boolean(initialCustomer));
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [viewingOpp, setViewingOpp] = useState<Opportunity | null>(null);
  const [oppToDelete, setOppToDelete] = useState<Opportunity | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState(initialCustomer?.id || '');
  const [customerName, setCustomerName] = useState(initialCustomer?.company || '');
  const [contactPerson, setContactPerson] = useState(initialCustomer?.name || '');
  const [email, setEmail] = useState(initialCustomer?.email || '');
  const [phone, setPhone] = useState(initialCustomer?.phone || '');
  const [stageValue, setStageValue] = useState<OpportunityStage>('qualification');
  const [expectedValueDZD, setExpectedValueDZD] = useState<number | ''>(2500000);
  const [probability, setProbability] = useState<number>(50);
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [serviceInterest, setServiceInterest] = useState('ERPNext Manufacturing & Supply Chain');
  const [assignedTo, setAssignedTo] = useState('Senior Solutions Consultant');
  const [notes, setNotes] = useState('');

  const openAddModal = (cust?: Customer) => {
    setEditingOpp(null);
    setTitle(cust ? `${cust.company} - ERP Implementation` : '');
    setCustomerId(cust?.id || '');
    setCustomerName(cust?.company || '');
    setContactPerson(cust?.name || '');
    setEmail(cust?.email || '');
    setPhone(cust?.phone || '');
    setStageValue('qualification');
    setExpectedValueDZD(2500000);
    setProbability(50);
    setExpectedCloseDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setServiceInterest('ERPNext Manufacturing & Supply Chain');
    setAssignedTo('Senior Solutions Consultant');
    setNotes('');
    setIsFormOpen(true);
  };

  const openEditModal = (opp: Opportunity) => {
    setEditingOpp(opp);
    setTitle(opp.title);
    setCustomerId(opp.customerId || '');
    setCustomerName(opp.customerName);
    setContactPerson(opp.contactPerson);
    setEmail(opp.email);
    setPhone(opp.phone || '');
    setStageValue(opp.stage);
    setExpectedValueDZD(opp.expectedValueDZD);
    setProbability(opp.probability);
    setExpectedCloseDate(opp.expectedCloseDate);
    setServiceInterest(opp.serviceInterest);
    setAssignedTo(opp.assignedTo || 'Senior Solutions Consultant');
    setNotes(opp.notes || '');
    setIsFormOpen(true);
  };

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const found = customers.find(c => c.id === id);
    if (found) {
      setCustomerName(found.company);
      setContactPerson(found.name);
      setEmail(found.email);
      setPhone(found.phone);
      if (!title) {
        setTitle(`${found.company} - Deal`);
      }
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerName.trim() || !contactPerson.trim()) {
      showToast('Please fill deal title, customer name and contact person');
      return;
    }

    const payload = {
      title: title.trim(),
      customerId: customerId || undefined,
      customerName: customerName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      stage: stageValue,
      expectedValueDZD: expectedValueDZD === '' ? 0 : Number(expectedValueDZD),
      probability: Number(probability),
      expectedCloseDate,
      serviceInterest,
      assignedTo: assignedTo.trim(),
      notes: notes.trim()
    };

    if (editingOpp) {
      opportunityStorage.updateOpportunity(editingOpp.id, payload);
      showToast(`Updated deal "${title}"`);
    } else {
      opportunityStorage.saveOpportunity(payload);
      showToast(`Created new deal "${title}"`);
    }

    setIsFormOpen(false);
    if (onCloseAddModal) onCloseAddModal();
    onRefresh();
  };

  const handleDelete = () => {
    if (!oppToDelete) return;
    opportunityStorage.deleteOpportunity(oppToDelete.id);
    showToast(`Deleted deal "${oppToDelete.title}"`);
    setOppToDelete(null);
    onRefresh();
  };

  // Filtered
  const filtered = useMemo(() => {
    return opportunities.filter(o => {
      if (currentStage !== 'all' && o.stage !== currentStage) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = o.title.toLowerCase().includes(q);
        const matchesCustomer = o.customerName.toLowerCase().includes(q);
        const matchesContact = o.contactPerson.toLowerCase().includes(q);
        const matchesEmail = o.email.toLowerCase().includes(q);
        const matchesService = o.serviceInterest.toLowerCase().includes(q);
        return matchesTitle || matchesCustomer || matchesContact || matchesEmail || matchesService;
      }
      return true;
    });
  }, [opportunities, currentStage, searchQuery]);

  // Aggregates
  const totalPipeline = useMemo(() => {
    return opportunities
      .filter(o => o.stage !== 'closed_lost')
      .reduce((sum, o) => sum + (o.expectedValueDZD || 0), 0);
  }, [opportunities]);

  const weightedForecast = useMemo(() => {
    return opportunities
      .filter(o => o.stage !== 'closed_lost')
      .reduce((sum, o) => sum + ((o.expectedValueDZD || 0) * (o.probability || 0)) / 100, 0);
  }, [opportunities]);

  const wonCount = useMemo(() => opportunities.filter(o => o.stage === 'closed_won').length, [opportunities]);
  const activeDealsCount = useMemo(() => opportunities.filter(o => o.stage !== 'closed_won' && o.stage !== 'closed_lost').length, [opportunities]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700">
              <TrendingUp className="h-3.5 w-3.5" />
              Sales & Deal Pipeline
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20" title="All operations persist in Firebase Firestore cloud database">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firebase Firestore
            </span>
            <span className="text-xs text-slate-400 font-medium">Commercial Opportunities</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Opportunity Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track business proposals, contract valuations, win probabilities, and sales closing milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => opportunityStorage.exportCSV()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export Deals</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#389695] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Deals</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{opportunities.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{activeDealsCount} active in pipeline</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Total Pipeline</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-blue-700">
            {totalPipeline.toLocaleString()} <span className="text-xs font-normal text-slate-400">DZD</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Unweighted potential value</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Weighted Forecast</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-purple-700">
            {Math.round(weightedForecast).toLocaleString()} <span className="text-xs font-normal text-slate-400">DZD</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Probability-adjusted revenue</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Closed Won</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{wonCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Successfully signed contracts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search opportunity title, client name, contact, scope..."
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
              onClick={() => setStage('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentStage === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({opportunities.length})
            </button>
            <button
              onClick={() => setStage('qualification')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentStage === 'qualification' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Qualification
            </button>
            <button
              onClick={() => setStage('proposal')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentStage === 'proposal' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Proposal
            </button>
            <button
              onClick={() => setStage('negotiation')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentStage === 'negotiation' ? 'bg-purple-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Negotiation
            </button>
            <button
              onClick={() => setStage('closed_won')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentStage === 'closed_won' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Won ({wonCount})
            </button>
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center px-4">
            <TrendingUp className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-900">No opportunities found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || currentStage !== 'all'
                ? 'Try adjusting your search criteria or resetting the stage filter.'
                : 'Create your first commercial opportunity or convert a qualified lead to start forecasting.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => openAddModal()}
                className="rounded-xl bg-[#44ACAB] px-4 py-2 text-xs font-bold text-white hover:bg-[#389695]"
              >
                + Create Opportunity
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-light-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Deal & Scope</th>
                  <th className="py-3.5 px-4">Customer Account</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Expected Value</th>
                  <th className="py-3.5 px-4">Win Probability</th>
                  <th className="py-3.5 px-4">Target Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filtered.map(opp => {
                  const stageInfo = STAGE_CONFIG[opp.stage] || STAGE_CONFIG.qualification;

                  return (
                    <tr key={opp.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Deal & Scope */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{opp.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opp.serviceInterest}</p>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>{opp.customerName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opp.contactPerson}</p>
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${stageInfo.bg} ${stageInfo.color} ${stageInfo.border}`}>
                          {stageInfo.label}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">
                          {(opp.expectedValueDZD || 0).toLocaleString()} <span className="text-[11px] font-normal text-slate-500">DZD</span>
                        </p>
                      </td>

                      {/* Probability */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className={`h-full ${
                                opp.probability >= 70 ? 'bg-emerald-500' : opp.probability >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                              }`} 
                              style={{ width: `${opp.probability}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{opp.probability}%</span>
                        </div>
                      </td>

                      {/* Target Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{opp.expectedCloseDate || 'Not set'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingOpp(opp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="View Deal Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(opp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="Edit Deal"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setOppToDelete(opp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete Deal"
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
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingOpp ? 'Edit Opportunity' : 'New Sales Opportunity'}
                  </h3>
                  <p className="text-xs text-slate-500">Commercial deal scope, valuation, and sales stage</p>
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
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ERPNext Enterprise Deployment & Frappe Customization"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Link to Customer or type Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link Customer Account</label>
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

                {/* Contact Person */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Youcef Mansouri"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contact@company.dz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Expected Value */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Contract Value (DZD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    required
                    value={expectedValueDZD}
                    onChange={(e) => setExpectedValueDZD(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Win Probability */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Win Probability (%): {probability}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={probability}
                    onChange={(e) => setProbability(Number(e.target.value))}
                    className="w-full accent-[#44ACAB] mt-2"
                  />
                </div>

                {/* Stage */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pipeline Stage</label>
                  <select
                    value={stageValue}
                    onChange={(e) => setStageValue(e.target.value as OpportunityStage)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  >
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>

                {/* Expected Close Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={expectedCloseDate}
                    onChange={(e) => setExpectedCloseDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  />
                </div>

                {/* Service Interest */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Interest / Solution</label>
                  <select
                    value={serviceInterest}
                    onChange={(e) => setServiceInterest(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#44ACAB] focus:ring-2 focus:ring-[#44ACAB]/20 outline-hidden"
                  >
                    {SERVICE_PRESETS.map((svc) => (
                      <option key={svc} value={svc}>{svc}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deal Notes & Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="Customer budget constraints, software modules, competitor analysis, special conditions..."
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
                  {editingOpp ? 'Save Opportunity' : 'Create Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingOpp.title}</h3>
                <p className="text-xs text-slate-500">{viewingOpp.customerName}</p>
              </div>
              <button
                onClick={() => setViewingOpp(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-light-scrollbar">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Deal Value</span>
                  <p className="font-bold text-base text-slate-900 mt-0.5">
                    {(viewingOpp.expectedValueDZD || 0).toLocaleString()} DZD
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Stage & Probability</span>
                  <p className="font-bold text-slate-900 capitalize mt-0.5">
                    {viewingOpp.stage.replace('_', ' ')} ({viewingOpp.probability}%)
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Contact Person</h4>
                <p className="font-bold text-slate-800 text-sm">{viewingOpp.contactPerson}</p>
                {viewingOpp.email && <p className="text-slate-600">{viewingOpp.email}</p>}
                {viewingOpp.phone && <p className="text-slate-600">{viewingOpp.phone}</p>}
              </div>

              {viewingOpp.notes && (
                <div className="p-4 rounded-xl bg-slate-50 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Notes</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{viewingOpp.notes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const o = viewingOpp;
                  setViewingOpp(null);
                  openEditModal(o);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#44ACAB] hover:underline"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Deal</span>
              </button>

              <button
                onClick={() => setViewingOpp(null)}
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {oppToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Delete Opportunity</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{oppToDelete.title}"</span>? 
              This will remove the deal from your sales pipeline.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setOppToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Delete Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
