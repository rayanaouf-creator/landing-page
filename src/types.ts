export type LeadStatus = 'new' | 'contacted' | 'in_discussion' | 'proposal_sent' | 'converted' | 'lost';
export type LeadPriority = 'high' | 'medium' | 'low';
export type LeadSource = 'website_booking' | 'direct_entry' | 'referral' | 'phone' | 'NetExpo-1' | 'EcselExpo-5' | 'netexpo_1' | 'ecselexpo_5';
export type EmergencyLevel = 'immediate' | 'high' | 'medium' | 'low';

export type ContactChannel = 'whatsapp' | 'mail' | 'phone' | 'face_to_face' | 'video_call' | 'other';

export interface ClientInteraction {
  id: string;
  channel: ContactChannel;
  contactedAt: string;          // ISO timestamp
  summary?: string;             // Notes / discussion summary
  outcome?: string;             // e.g. "Interested", "Follow-up Scheduled", "Sent Quotation", "No Answer"
  loggedBy?: string;            // Staff member who logged this contact
  nextFollowUpDate?: string;    // Optional next follow-up date
}

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
  contactedAt?: string;           // ISO timestamp of most recent contact
  contactMethod?: string;         // Most recent contact channel ('whatsapp' | 'mail' | 'phone' | 'face_to_face' | 'video_call' | 'other')
  contactHistory?: ClientInteraction[]; // Complete historical log of all client interactions
  estimatedValueDZD?: number;
  opportunityId?: string;         // Linked Opportunity ID once converted/created
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
  contactedAt?: string;           // ISO timestamp of most recent contact
  contactMethod?: string;         // Most recent contact channel
  contactHistory?: ClientInteraction[]; // Complete historical log of all client interactions
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
  leadId?: string;               // Linked Lead ID if originated from lead
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

// ── OUR WORK / PORTFOLIO PROJECT DEFINITIONS ─────────────────────────
export interface WorkProject {
  id: string;
  name: string;                  // e.g. "Optilens", "CH Optic", "Lutech"
  industry: string;              // e.g. "Optical Distribution (14 Wilayas)"
  category?: string;              // e.g. "ERPNext & Supply Chain", "SaaS Software"
  description: string;           // Short overview of the client and their operations
  solution: string;              // Detailed solution delivered by JetNext
  delivered: string;             // Short intro header (e.g. "What we delivered:")
  highlights: string[];          // List of bullet points / features delivered
  metricValue?: string;          // e.g. "+45%", "-70%", "100%"
  metricLabel?: string;          // e.g. "Faster Fulfillment", "Order Turnaround"
  clientWebsite?: string;        // Optional client website link
  logoLetter?: string;           // Initial letter or monogram
  published: boolean;            // Controls visibility in public Our Work section
  order: number;                 // Sort order (lower numbers display first)
  createdAt: string;
  updatedAt: string;
}

// ── USER MANAGEMENT & ROLE DEFINITIONS ──────────────────────────────
export type UserRole = 
  | 'admin'
  | 'sales_manager'
  | 'sales_rep'
  | 'support_agent'
  | 'project_manager'
  | 'viewer';

export type UserStatus = 'active' | 'inactive' | 'suspended';

// ── SIDEBAR CRM RESOURCES / PERMISSION MODULES ──────────────────────
export type CrmResource = 
  | 'lead' 
  | 'opportunity' 
  | 'customer' 
  | 'project' 
  | 'claim' 
  | 'work' 
  | 'users'
  | 'policy'
  | 'events';

export interface CrmResourceMeta {
  id: CrmResource;
  label: string;
  shortLabel: string;
  description: string;
  category: 'Commercial' | 'Operations' | 'Quality & Support' | 'Marketing' | 'Administration';
  color: string;
  bgLight: string;
  borderClass: string;
}

export const ALL_CRM_RESOURCES: CrmResourceMeta[] = [
  {
    id: 'lead',
    label: 'Lead',
    shortLabel: 'Lead',
    description: 'Lead inquiries & exhibition contact forms',
    category: 'Commercial',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    borderClass: 'border-emerald-200'
  },
  {
    id: 'opportunity',
    label: 'Opportunity',
    shortLabel: 'Opportunity',
    description: 'Commercial opportunities & deals pipeline',
    category: 'Commercial',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderClass: 'border-blue-200'
  },
  {
    id: 'customer',
    label: 'Customer',
    shortLabel: 'Customer',
    description: 'Active client accounts & directory',
    category: 'Commercial',
    color: 'text-teal-700',
    bgLight: 'bg-teal-50',
    borderClass: 'border-teal-200'
  },
  {
    id: 'project',
    label: 'Project',
    shortLabel: 'Project',
    description: 'Client implementation projects & milestones',
    category: 'Operations',
    color: 'text-indigo-700',
    bgLight: 'bg-indigo-50',
    borderClass: 'border-indigo-200'
  },
  {
    id: 'claim',
    label: 'Claim',
    shortLabel: 'Claim',
    description: 'Customer claims, tickets & ISO 9001 CAPA',
    category: 'Quality & Support',
    color: 'text-amber-700',
    bgLight: 'bg-amber-50',
    borderClass: 'border-amber-200'
  },
  {
    id: 'work',
    label: 'Our Work',
    shortLabel: 'Our Work',
    description: 'Public case studies & portfolio showcase',
    category: 'Marketing',
    color: 'text-cyan-700',
    bgLight: 'bg-cyan-50',
    borderClass: 'border-cyan-200'
  },
  {
    id: 'users',
    label: 'Users',
    shortLabel: 'Users',
    description: 'Team users, credentials & sidebar permissions',
    category: 'Administration',
    color: 'text-purple-700',
    bgLight: 'bg-purple-50',
    borderClass: 'border-purple-200'
  },
  {
    id: 'policy',
    label: 'Policy',
    shortLabel: 'Policy',
    description: 'Company compliance policies, ISO guidelines & SLA standards',
    category: 'Administration',
    color: 'text-rose-700',
    bgLight: 'bg-rose-50',
    borderClass: 'border-rose-200'
  },
  {
    id: 'events',
    label: 'Events',
    shortLabel: 'Events',
    description: 'Corporate summits, client demos, audits & team calendar',
    category: 'Operations',
    color: 'text-violet-700',
    bgLight: 'bg-violet-50',
    borderClass: 'border-violet-200'
  }
];

export interface AppUser {
  id: string;
  name: string;
  username?: string;             // System login username (e.g. @rayan.aouf)
  password?: string;             // Account password
  email: string;
  role: UserRole;
  status: UserStatus;
  assignedResources?: CrmResource[]; // Sidebar resources this user is permitted to see and access
  department?: string;           // e.g. "Executive", "Sales & BD", "Support", "Engineering"
  title?: string;                // e.g. "Director of Operations", "Account Executive"
  phone?: string;
  notes?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── COMPANY POLICIES ────────────────────────────────────────────────
export type PolicyType = 
  | 'Event policy' 
  | 'Cleaning Policy' 
  | 'Recrutment Policy' 
  | 'Dayly policy' 
  | 'Weekly Policy' 
  | 'other';

export const POLICY_TYPES: { id: PolicyType; label: string; description: string; isSingleton: boolean }[] = [
  { id: 'Event policy', label: 'Event policy', description: 'Rules for corporate events, expos, webinars & summit coordination', isSingleton: true },
  { id: 'Cleaning Policy', label: 'Cleaning Policy', description: 'Hygiene, workstation sanitization & workplace cleanliness standards', isSingleton: true },
  { id: 'Recrutment Policy', label: 'Recrutment Policy', description: 'Talent acquisition, candidate vetting, interviews & onboarding protocol', isSingleton: true },
  { id: 'Dayly policy', label: 'Dayly policy', description: 'Daily attendance, morning standup reporting & end-of-day checklist', isSingleton: true },
  { id: 'Weekly Policy', label: 'Weekly Policy', description: 'Weekly sprint planning, retrospectives & milestone delivery reviews', isSingleton: true },
  { id: 'other', label: 'other', description: 'General operational procedures, ISO rules & custom organizational policies', isSingleton: false }
];

export type PolicyCategory = 
  | 'Quality & ISO 9001' 
  | 'Security & Privacy' 
  | 'Sales & Commercial' 
  | 'Operations & SLA' 
  | 'HR & Workplace';

export type PolicyStatus = 'active' | 'under_review' | 'archived';

export interface PolicyTask {
  id: string;
  title: string;
  description?: string;
  isMandatory?: boolean;
}

export interface CompanyPolicy {
  id: string;
  title: string;
  type: PolicyType;
  category?: PolicyCategory | string;
  version: string;
  status: PolicyStatus;
  effectiveDate: string;
  reviewDate?: string;
  author: string;
  summary: string;
  content: string;
  mandatoryFor: string[];
  tags: string[];
  tasks?: PolicyTask[];
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ── CORPORATE EVENTS ────────────────────────────────────────────────
export type EventType = 'meeting' | 'launch' | 'audit' | 'training' | 'conference' | 'webinar';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface EventPreparationTask {
  id: string;
  policyTaskId?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface CompanyEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startDate: string; // ISO date or string
  endDate?: string;
  time?: string;
  location: string;
  organizer: string;
  attendeesCount?: number;
  tags?: string[];
  isImportant?: boolean;
  tasks?: EventPreparationTask[];
  createdAt: string;
  updatedAt: string;
}

