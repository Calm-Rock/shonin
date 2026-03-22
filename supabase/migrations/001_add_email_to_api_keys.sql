alter table api_keys add column if not exists email text;
create index if not exists api_keys_email_idx on api_keys(email);
