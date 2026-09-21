export type LeadStatus = 'new' | 'contacted' | 'in_discussion' | 'proposal_sent' | 'converted' | 'lost';
export type LeadPriority = 'high' | 'medium' | 'low';
export type LeadSource = 'website_booking' | 'direct_entry' | 'referral' | 'phone';
export type EmergencyLevel = 'immediate' | 'high' | 'medium' | 'low';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle?: string;              // Post or function (e.g., CEO, IT Director, CFO)
  location?: string;              // City / Wilaya / Region (e.g., Alger, Oran)
  industry?: string;              // Industry / Sector (e.g., Manufacturing, Distribution)
  emergencyLevel?: EmergencyLevel;// Urgency / Project timeline
  serviceRequested: string;
  message?: string;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  estimatedValueDZD?: number;
}

// ── CUSTOMER DEFINITIONS ─────────────────────────────────────────────
export type CustomerStatus = 'active' | 'onboarding' | 'paused' | 'churned';
export type CustomerTier = 'enterprise' | 'growth' | 'standard';

export interface Customer {
  id: string;
  company: string;
  name: string;                  // Primary contact person
  email: string;
  phone: string;
  jobTitle?: string;
  location?: string;
  industry?: string;
  status: CustomerStatus;
  tier: CustomerTier;
  activeService: string;         // e.g. "ERPNext Enterprise Implementation", "ISO 9001 Continuous Compliance"
  contractValueDZD?: number;     // Annual or project contract value
  mrrDZD?: number;               // Recurring maintenance/support SLA
  startDate: string;             // Date contract started
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── CLAIM (RÉCLAMATION / TICKET) DEFINITIONS ──────────────────────────
export type ClaimStatus = 'open' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
export type ClaimSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ClaimCategory = 
  | 'erp_bug' 
  | 'service_delay' 
  | 'iso_non_conformity' 
  | 'billing' 
  | 'support_request' 
  | 'training_gap';

export interface Claim {
  id: string;
  claimNumber: string;           // Formatted ID, e.g. "CLM-2026-001"
  customerId?: string;
  customerName: string;          // Company or account name
  contactPerson: string;
  email: string;
  phone?: string;
  title: string;
  category: ClaimCategory;
  severity: ClaimSeverity;
  status: ClaimStatus;
  description: string;
  correctiveAction?: string;     // ISO 9001 Corrective and Preventive Action (CAPA)
  assignedTo?: string;           // Consultant or engineer assigned
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

