alter table api_keys add column if not exists updated_at timestamp with time zone default now();
update api_keys set updated_at = created_at where updated_at is null;
