-- psa_cert_cache: per-cert immutable data (cert info does not change post-grading)
CREATE TABLE psa_cert_cache (
  cert_number text PRIMARY KEY,
  spec_id integer,
  card_name text,
  grade text,
  my_grade_pop integer NOT NULL DEFAULT 0,
  fetched_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_psa_cert_cache_spec ON psa_cert_cache(spec_id);

-- psa_pop_cache: per-SpecID population cache (7-day TTL enforced in app layer)
CREATE TABLE psa_pop_cache (
  spec_id integer PRIMARY KEY,
  grade_breakdown jsonb NOT NULL,
  total_pop integer NOT NULL,
  fetched_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_psa_pop_cache_fetched ON psa_pop_cache(fetched_at);

-- RLS: deny all client access; only service_role (admin client) can read/write
ALTER TABLE psa_cert_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE psa_pop_cache ENABLE ROW LEVEL SECURITY;
