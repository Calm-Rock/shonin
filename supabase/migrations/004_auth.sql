alter table api_keys add column if not exists user_id uuid references auth.users(id);
create index if not exists api_keys_user_id_idx on api_keys(user_id);
