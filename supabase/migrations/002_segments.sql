-- Segments and tags system
-- Supports both manual segments and auto-segments with rules

CREATE TYPE segment_type AS ENUM ('manual', 'auto');

CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type segment_type NOT NULL DEFAULT 'manual',
  rules JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_segments_name ON segments (LOWER(name));
CREATE INDEX idx_segments_type ON segments (type);

CREATE TRIGGER segments_updated_at
  BEFORE UPDATE ON segments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Junction table: contacts <-> segments (many-to-many)
CREATE TABLE contact_segments (
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (contact_id, segment_id)
);

CREATE INDEX idx_contact_segments_segment ON contact_segments (segment_id);
CREATE INDEX idx_contact_segments_contact ON contact_segments (contact_id);

-- RLS
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage segments"
  ON segments FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage contact_segments"
  ON contact_segments FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
