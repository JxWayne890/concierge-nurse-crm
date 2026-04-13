-- Activity log
-- Tracks all actions and events in the CRM

CREATE TYPE activity_type AS ENUM (
  'signup', 'form_submission', 'email_open', 'email_click',
  'import', 'campaign_sent', 'note_added', 'status_change'
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  type activity_type NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_log_contact ON activity_log (contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_activity_log_type ON activity_log (type);
CREATE INDEX idx_activity_log_created_at ON activity_log (created_at DESC);

-- RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage activity_log"
  ON activity_log FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
