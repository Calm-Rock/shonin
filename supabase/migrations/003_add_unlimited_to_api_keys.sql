alter table api_keys add column if not exists unlimited boolean default false;
update api_keys set unlimited = true where key = 'test-api-key-123';
