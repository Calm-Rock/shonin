create extension if not exists "uuid-ossp";

create table approvals (
  id uuid default uuid_generate_v4() primary key,
  account_id text not null,
  action text not null,
  context text,
  approver_email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approve_token text unique not null,
  reject_token text unique not null,
  webhook_url text,
  expires_at timestamp with time zone not null,
  decided_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table api_keys (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  name text,
  created_at timestamp with time zone default now()
);

create index on approvals(account_id);
create index on approvals(approve_token);
create index on approvals(reject_token);

create table decisions (
  id uuid default uuid_generate_v4() primary key,
  account_id text not null,
  question text not null,
  options jsonb not null,        -- [{key, label, token}]
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
