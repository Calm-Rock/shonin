create table if not exists login_emails (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  created_at timestamp with time zone default now()
);

create index if not exists login_emails_created_at_idx on login_emails(created_at);
create index if not exists login_emails_email_idx on login_emails(email);

alter table login_emails enable row level security;
