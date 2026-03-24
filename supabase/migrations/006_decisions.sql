CREATE TABLE decisions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  account_id TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,        -- [{key, label, token}]
  respondent_email TEXT NOT NULL,
  context TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'decided')),
  chosen_key TEXT,
  webhook_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  decided_at TIMESTAMP WITH TIME ZONE,
  token_used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX ON decisions(account_id);
CREATE INDEX ON decisions(status);
