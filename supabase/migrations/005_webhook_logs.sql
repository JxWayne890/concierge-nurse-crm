-- Webhook logs
-- Records all incoming webhook requests for debugging and audit

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  payload JSONB NOT NULL DEFAULT '{}',
  headers JSONB DEFAULT '{}',
  status INTEGER NOT NULL,
  response JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_endpoint ON webhook_logs (endpoint);
CREATE INDEX idx_webhook_logs_status ON webhook_logs (status);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs (created_at DESC);

-- RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view webhook_logs"
  ON webhook_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can insert webhook_logs"
  ON webhook_logs FOR INSERT
  WITH CHECK (true);
