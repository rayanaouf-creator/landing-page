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
