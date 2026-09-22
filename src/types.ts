export type LeadStatus = 'new' | 'contacted' | 'in_discussion' | 'proposal_sent' | 'converted' | 'lost';
export type LeadPriority = 'high' | 'medium' | 'low';
export type LeadSource = 'website_booking' | 'direct_entry' | 'referral' | 'phone' | 'NetExpo-1' | 'EcselExpo-5' | 'netexpo_1' | 'ecselexpo_5';
export type EmergencyLevel = 'immediate' | 'high' | 'medium' | 'low';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  additionalPhones?: string[];    // Additional / secondary contact numbers (mobile, WhatsApp, fixe)
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
export type CustomerStatus = 'active' | 'prospect' | 'inactive';

export interface Customer {
  id: string;
  company: string;
  name: string;                  // Primary contact person
  email: string;
  phone: string;
  additionalPhones?: string[];
  jobTitle?: string;
  location?: string;
  industry?: string;
  status: CustomerStatus;
  website?: string;
  taxId?: string;                // NIF / NIS / RC
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── OPPORTUNITY DEFINITIONS ──────────────────────────────────────────
export type OpportunityStage = 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Opportunity {
  id: string;
  title: string;                 // Deal name / scope
  customerId?: string;           // Linked Customer ID if selected
  customerName: string;          // Company name
  contactPerson: string;
  email: string;
  phone?: string;
  stage: OpportunityStage;
  expectedValueDZD: number;      // Value in DZD
  probability: number;           // 0 to 100 %
  expectedCloseDate: string;
  serviceInterest: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── PROJECT DEFINITIONS ──────────────────────────────────────────────
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  projectName: string;
  customerId?: string;
  customerName: string;
  status: ProjectStatus;
  budgetDZD: number;
  monthlySupportDZD?: number;    // Monthly support SLA
  startDate: string;
  targetEndDate?: string;
  progress: number;              // 0 to 100%
  projectManager?: string;
  keyDeliverables?: string;
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

