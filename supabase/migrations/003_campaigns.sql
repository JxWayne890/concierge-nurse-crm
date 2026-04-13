-- Campaigns (email & SMS)
-- Stores campaign metadata, content, and aggregate stats

CREATE TYPE campaign_type AS ENUM ('email', 'sms');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent');
CREATE TYPE recipient_status AS ENUM ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed');

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type campaign_type NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  subject TEXT,
  from_name TEXT,
  from_email TEXT,
  body TEXT NOT NULL DEFAULT '',
  recipient_segments TEXT[] DEFAULT '{}',
  recipient_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  stats JSONB NOT NULL DEFAULT '{
    "sent": 0, "delivered": 0, "opened": 0, "clicked": 0,
    "bounced": 0, "unsubscribed": 0, "openRate": 0, "clickRate": 0, "deliveryRate": 0
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_type ON campaigns (type);
CREATE INDEX idx_campaigns_status ON campaigns (status);
CREATE INDEX idx_campaigns_created_at ON campaigns (created_at DESC);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns (scheduled_at) WHERE scheduled_at IS NOT NULL;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Campaign recipients: per-contact delivery tracking
CREATE TABLE campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status recipient_status NOT NULL DEFAULT 'pending',
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients (campaign_id);
CREATE INDEX idx_campaign_recipients_contact ON campaign_recipients (contact_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients (status);
CREATE UNIQUE INDEX idx_campaign_recipients_unique ON campaign_recipients (campaign_id, contact_id);

-- RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage campaigns"
  ON campaigns FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage campaign_recipients"
  ON campaign_recipients FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
