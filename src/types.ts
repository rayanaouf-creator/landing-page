export type LeadStatus = 'new' | 'contacted' | 'in_discussion' | 'proposal_sent' | 'converted' | 'lost';
export type LeadPriority = 'high' | 'medium' | 'low';
export type LeadSource = 'website_booking' | 'direct_entry' | 'referral' | 'phone';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
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
