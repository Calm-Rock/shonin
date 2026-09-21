-- Complete schema for a new Supabase project: run this once in the SQL editor.
-- The files in migrations/ are the incremental history, for upgrading databases created earlier.

create extension if not exists "uuid-ossp";

create table approvals (
  id uuid default uuid_generate_v4() primary key,
  account_id text not null,          -- api_keys.key of the requester
  action text not null,
  context text,
  approver_email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approve_token text unique not null,
  reject_token text unique not null,
  webhook_url text,
  expires_at timestamp with time zone not null,
  decided_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  command_type text,
  diff text,
  files jsonb,
  risk_level text,
  risk_bullets jsonb,
  token_used boolean default false not null
);

create index on approvals(account_id);

create table api_keys (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  name text,
  email text,
  unlimited boolean default false,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index api_keys_email_idx on api_keys(email);
create index api_keys_user_id_idx on api_keys(user_id);

create table decisions (
  id uuid default uuid_generate_v4() primary key,
  account_id text not null,
  question text not null,
  options jsonb not null,            -- [{key, label, token}]
  respondent_email text not null,
  context text,
  status text not null default 'pending' check (status in ('pending', 'decided')),
  chosen_key text,
  webhook_url text,
  expires_at timestamp with time zone not null,
  decided_at timestamp with time zone,
  token_used boolean default false not null,
  created_at timestamp with time zone default now()
);

create index on decisions(account_id);
create index on decisions(status);

create table login_emails (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  created_at timestamp with time zone default now()
);

create index login_emails_created_at_idx on login_emails(created_at);
create index login_emails_email_idx on login_emails(email);

-- The app reads and writes only with the service-role key, which bypasses RLS.
-- With RLS on and no policies, the public anon key cannot read or write any of these tables.
alter table approvals enable row level security;
alter table api_keys enable row level security;
alter table decisions enable row level security;
alter table login_emails enable row level security;
