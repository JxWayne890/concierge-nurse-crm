export type ContactStatus = 'confirmed' | 'unconfirmed' | 'unsubscribed' | 'bounced';
export type ContactSource = 'manualUpload' | 'webhook' | 'csvImport' | 'formSubmission';
export type LifecycleStage = 'Explorer' | 'DIYer' | 'Builder' | 'Established Owner';
export type InterestType =
  | 'Clarity Consult'
  | 'Accelerator Cohort'
  | 'Toolkits & Resources'
  | '1:1 Private Coaching'
  | 'Business Consulting'
  | 'VIP Bridge Session'
  | 'General Question'
  | 'Other';

export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: ContactStatus;
  source: ContactSource;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  segments: string[];
  lastIp?: string;
  lastOpen?: string;
  notes?: Note[];
  interest?: InterestType;
  lifecycleStage?: LifecycleStage;
  programHistory?: string[];
  leadScore?: number;
}

export interface Note {
  id: string;
  contactId: string;
  body: string;
  createdBy: string;
  createdAt: string;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  type: 'manual' | 'auto';
  rules?: SegmentRule[];
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentRule {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'before' | 'after';
  value: string;
}

export type CampaignType = 'email' | 'sms';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  body: string;
  recipientSegments: string[];
  recipientCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  stats: CampaignStats;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  deliveryRate: number;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  contactId: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  openedAt?: string;
  clickedAt?: string;
}

export interface ActivityLogEntry {
  id: string;
  contactId?: string;
  type: 'signup' | 'form_submission' | 'email_open' | 'email_click' | 'import' | 'campaign_sent' | 'note_added' | 'status_change';
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  endpoint: string;
  payload: Record<string, unknown>;
  status: number;
  createdAt: string;
}

// CSV Import types
export interface CSVImportRow {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  status?: string;
  createdAt?: string;
  segments?: string;
  'metafields.lastIp'?: string;
  'metafields.lastOpen'?: string;
  [key: string]: string | undefined;
}

export interface ColumnMapping {
  csvColumn: string;
  crmField: string | null;
}

export interface ImportValidationResult {
  valid: CSVImportRow[];
  errors: { row: number; field: string; message: string }[];
  warnings: { row: number; field: string; message: string }[];
  duplicates: { row: number; email: string }[];
}

export interface ImportResult {
  totalProcessed: number;
  imported: number;
  skippedDuplicates: number;
  errors: number;
}

// Webhook payloads
export interface ContactFormPayload {
  firstName: string;
  lastName: string;
  email: string;
  interest: InterestType;
  message: string;
}

export interface WaitlistPayload {
  fullName: string;
  email: string;
}

export interface CommunitySignupPayload {
  email: string;
  firstName?: string;
}
