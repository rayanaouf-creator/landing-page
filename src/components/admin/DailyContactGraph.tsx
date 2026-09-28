import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  PhoneCall, 
  Mail, 
  Building2, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  Flame,
  Filter,
  Eye,
  Info
} from 'lucide-react';
import { Lead } from '../../types';

interface DailyContactGraphProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
  onQuickContact?: (leadId: string, method: string) => void;
}

type Timeframe = '7d' | '14d' | '30d' | 'month';

interface DayData {
  dateStr: string;        // 'YYYY-MM-DD'
  displayDate: string;    // 'Mon 28'
  fullDate: string;       // 'Monday, September 28, 2026'
  count: number;
  leads: Lead[];
  isToday: boolean;
}

export function DailyContactGraph({ leads, onSelectLead, onQuickContact }: DailyContactGraphProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('14d');
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Helper to get formatted local YYYY-MM-DD
  const formatYMD = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => formatYMD(new Date()), []);

  // Determine effective contact date for each lead
  // If contactedAt exists, use it. Otherwise, if status is progressed beyond 'new', use updatedAt or createdAt
  const leadContactDateMap = useMemo(() => {
    const map = new Map<string, string>(); // leadId -> YYYY-MM-DD
    leads.forEach(l => {
      if (l.contactedAt) {
        try {
          const d = new Date(l.contactedAt);
          if (!isNaN(d.getTime())) {
            map.set(l.id, formatYMD(d));
            return;
          }
        } catch {}
      }

      // Fallback for leads marked as contacted, in_discussion, proposal_sent, converted, or lost
      if (l.status !== 'new') {
        const rawDate = l.updatedAt || l.createdAt;
        if (rawDate) {
          try {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              map.set(l.id, formatYMD(d));
            }
          } catch {}
        }
      }
    });
    return map;
  }, [leads]);

  // Generate days based on timeframe
  const daysData: DayData[] = useMemo(() => {
    const numDays = timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : timeframe === '30d' ? 30 : 31;
    const result: DayData[] = [];
    const now = new Date();

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = formatYMD(d);

      const dayLeads = leads.filter(l => leadContactDateMap.get(l.id) === dateStr);

      const isToday = dateStr === todayStr;
      const displayDate = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

      result.push({
        dateStr,
        displayDate,
        fullDate,
        count: dayLeads.length,
        leads: dayLeads,
        isToday
      });
    }

    return result;
  }, [timeframe, leads, leadContactDateMap, todayStr]);

  // Compute metrics
  const maxCount = useMemo(() => {
    const m = Math.max(...daysData.map(d => d.count), 1);
    return Math.max(m, 5); // At least 5 for pleasant scale
  }, [daysData]);

  const totalInPeriod = useMemo(() => {
    return daysData.reduce((acc, d) => acc + d.count, 0);
  }, [daysData]);

  const todayCount = useMemo(() => {
    const todayObj = daysData.find(d => d.isToday);
    return todayObj ? todayObj.count : 0;
  }, [daysData]);

  const dailyAverage = useMemo(() => {
    if (daysData.length === 0) return '0.0';
    return (totalInPeriod / daysData.length).toFixed(1);
  }, [totalInPeriod, daysData]);

  const peakDay = useMemo(() => {
    let peak = daysData[0];
    daysData.forEach(d => {
      if (d.count > (peak?.count || 0)) {
        peak = d;
      }
    });
    return peak && peak.count > 0 ? peak : null;
  }, [daysData]);

  const selectedDay = useMemo(() => {
    if (!selectedDayStr) {
      // Default to today if has contacts, otherwise to the latest active day, or today
      return daysData.find(d => d.isToday) || daysData[daysData.length - 1];
    }
    return daysData.find(d => d.dateStr === selectedDayStr) || null;
  }, [selectedDayStr, daysData]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 ring-1 ring-slate-200/90 shadow-sm space-y-6">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6f4f4] text-[#1b6b6a]">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Daily Lead Contact Activity
            </h2>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live CRM Tracking
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Monitor how many prospect leads you and your sales team contact every single day.
          </p>
        </div>

        {/* Timeframe Segmented Control (Zero-pill discipline: segmented buttons with functional click handlers) */}
        <div className="flex items-center p-1 bg-slate-100/80 rounded-xl text-xs font-bold text-slate-600 self-start sm:self-auto">
          {(['7d', '14d', '30d'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setSelectedDayStr(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf === '7d' ? '7 Days' : tf === '14d' ? '14 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Contacted Today */}
        <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Contacted Today</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{todayCount}</span>
            <span className="text-xs text-slate-500 font-medium">leads</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {todayCount > 0 ? 'Active outreach ongoing' : 'No calls logged today yet'}
          </p>
        </div>

        {/* Total in Selected Window */}
        <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Period Total</span>
            <TrendingUp className="h-3.5 w-3.5 text-[#44ACAB]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#1b6b6a]">{totalInPeriod}</span>
            <span className="text-xs text-slate-500 font-medium">leads</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Over past {daysData.length} days</p>
        </div>

        {/* Daily Average */}
        <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Daily Average</span>
            <Clock className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{dailyAverage}</span>
            <span className="text-xs text-slate-500 font-medium">/ day</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Consistent pace metric</p>
        </div>

        {/* Peak Performance Day */}
        <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Peak Outreach</span>
            <Flame className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {peakDay ? peakDay.count : 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">leads max</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 truncate">
            {peakDay ? peakDay.displayDate : 'None yet'}
          </p>
        </div>
      </div>

      {/* SVG & Interactive Bar Chart Container */}
      <div className="relative pt-6 pb-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-3">
          <span>Y-Axis: Leads Contacted per Day</span>
          <span className="text-[11px]">Click any bar to inspect daily lead list</span>
        </div>

        {/* Main Chart Graphic */}
        <div className="relative h-64 sm:h-72 w-full flex items-end gap-1.5 sm:gap-3 pt-6 pb-8 border-b border-slate-200">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 opacity-40">
            <div className="border-b border-dashed border-slate-200 w-full flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono -translate-y-2">{maxCount}</span>
            </div>
            <div className="border-b border-dashed border-slate-200 w-full flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono -translate-y-2">{Math.round(maxCount / 2)}</span>
            </div>
            <div className="border-b border-dashed border-slate-200 w-full flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono -translate-y-2">0</span>
            </div>
          </div>

          {/* Daily Bars */}
          {daysData.map((day) => {
            const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            const isSelected = selectedDay?.dateStr === day.dateStr;
            const hasContacts = day.count > 0;

            return (
              <div
                key={day.dateStr}
                onClick={() => setSelectedDayStr(day.dateStr)}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className="group relative flex-1 h-full flex flex-col justify-end items-center cursor-pointer"
              >
                {/* Count Badge on Top of Bar */}
                {hasContacts && (
                  <span
                    className={`text-[10px] sm:text-xs font-extrabold mb-1.5 transition-transform duration-200 ${
                      isSelected
                        ? 'text-[#1b6b6a] scale-110 font-black'
                        : 'text-slate-600 group-hover:scale-110'
                    }`}
                  >
                    {day.count}
                  </span>
                )}

                {/* Animated Vertical Bar */}
                <div className="w-full flex justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPercent, hasContacts ? 8 : 3)}%` }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className={`w-full max-w-[38px] rounded-t-xl transition-all duration-200 relative ${
                      isSelected
                        ? 'bg-gradient-to-t from-[#155a59] to-[#44ACAB] shadow-md ring-2 ring-[#44ACAB]/50 ring-offset-1'
                        : hasContacts
                          ? 'bg-gradient-to-t from-[#1b6b6a] to-[#44ACAB] opacity-80 group-hover:opacity-100 group-hover:scale-y-105'
                          : 'bg-slate-200/70 group-hover:bg-slate-300'
                    }`}
                  >
                    {/* Glowing dot on today */}
                    {day.isToday && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white"></span>
                    )}
                  </motion.div>
                </div>

                {/* Bottom Date Label */}
                <span
                  className={`absolute -bottom-6 text-[10px] sm:text-[11px] font-semibold truncate transition-colors text-center w-full ${
                    day.isToday
                      ? 'text-[#1b6b6a] font-black'
                      : isSelected
                        ? 'text-slate-900 font-bold'
                        : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                >
                  {day.displayDate}
                </span>

                {/* Hover Tooltip Card */}
                {hoveredDay?.dateStr === day.dateStr && (
                  <div className="absolute bottom-full mb-3 z-30 pointer-events-none hidden sm:block">
                    <div className="bg-slate-900 text-white rounded-xl py-2 px-3 shadow-xl ring-1 ring-slate-800 text-center whitespace-nowrap text-xs">
                      <p className="font-bold">{day.fullDate}</p>
                      <p className="text-[#44ACAB] font-semibold mt-0.5">
                        {day.count} {day.count === 1 ? 'Lead Contacted' : 'Leads Contacted'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Drill-down Drawer */}
      {selectedDay && (
        <div className="mt-8 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/70 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#44ACAB]" />
                <h3 className="text-sm font-black text-slate-900">
                  {selectedDay.fullDate} {selectedDay.isToday && '(Today)'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedDay.count === 0 
                  ? 'No contact activity recorded on this date.'
                  : `${selectedDay.count} prospective clients contacted on this day:`
                }
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg ring-1 ring-slate-200 shadow-xs">
                {selectedDay.count} Contacted
              </span>
            </div>
          </div>

          {selectedDay.leads.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              <PhoneCall className="h-8 w-8 text-slate-300 mx-auto mb-2 opacity-50" />
              <span>No calls or contacts recorded for this day. To record a contact, use the "Log Call / Contact" action on any lead in the table below.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDay.leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead && onSelectLead(lead)}
                  className="bg-white rounded-xl p-3.5 ring-1 ring-slate-200/80 hover:ring-[#44ACAB] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 group-hover:text-[#1b6b6a] transition-colors truncate">
                        {lead.company}
                      </span>
                      <span className="text-[10px] font-bold text-[#1b6b6a] bg-[#e6f4f4] px-2 py-0.5 rounded">
                        {lead.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                      <User className="h-3 w-3 text-slate-400" />
                      <span>{lead.name}</span>
                    </p>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 truncate">
                      <PhoneCall className="h-3 w-3 text-[#44ACAB]" />
                      <span>{lead.phone}</span>
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#44ACAB] font-bold">
                    <span>View Lead Details</span>
                    <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
