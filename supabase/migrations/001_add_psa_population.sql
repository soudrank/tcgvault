-- Add cert_number to cards table
ALTER TABLE cards ADD COLUMN cert_number text;

-- Create PSA population snapshots table
CREATE TABLE psa_population (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  total_pop integer NOT NULL,
  grade_breakdown jsonb,
  fetched_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE psa_population ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read psa_population for own cards"
  ON psa_population FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cards WHERE cards.id = psa_population.card_id AND cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert psa_population for own cards"
  ON psa_population FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards WHERE cards.id = psa_population.card_id AND cards.user_id = auth.uid()
    )
  );

CREATE INDEX idx_psa_pop_card ON psa_population(card_id, fetched_at);
