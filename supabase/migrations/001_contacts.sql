-- Contacts table
-- Core CRM entity storing all contact information

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE contact_status AS ENUM ('confirmed', 'unconfirmed', 'unsubscribed', 'bounced');
CREATE TYPE contact_source AS ENUM ('manualUpload', 'webhook', 'csvImport', 'formSubmission');
CREATE TYPE lifecycle_stage AS ENUM ('Explorer', 'DIYer', 'Builder', 'Established Owner');
CREATE TYPE interest_type AS ENUM (
  'Clarity Consult',
  'Accelerator Cohort',
  'Toolkits & Resources',
  '1:1 Private Coaching',
  'Business Consulting',
  'VIP Bridge Session',
  'General Question',
  'Other'
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  status contact_status NOT NULL DEFAULT 'unconfirmed',
  source contact_source NOT NULL DEFAULT 'formSubmission',
  phone TEXT,
  last_ip TEXT,
  last_open TIMESTAMPTZ,
  interest interest_type,
  lifecycle_stage lifecycle_stage DEFAULT 'Explorer',
  program_history TEXT[] DEFAULT '{}',
  lead_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_contacts_email ON contacts (LOWER(email));
CREATE INDEX idx_contacts_status ON contacts (status);
CREATE INDEX idx_contacts_source ON contacts (source);
CREATE INDEX idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX idx_contacts_lifecycle_stage ON contacts (lifecycle_stage);
CREATE INDEX idx_contacts_lead_score ON contacts (lead_score DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can do everything (single-user CRM)
CREATE POLICY "Authenticated users can manage contacts"
  ON contacts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Notes table (related to contacts)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_contact_id ON notes (contact_id);
CREATE INDEX idx_notes_created_at ON notes (created_at DESC);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage notes"
  ON notes
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
