create table if not exists team_codes (
 id uuid primary key default gen_random_uuid(), code text unique not null,
 owner_user_id uuid not null references users(id) on delete cascade,
 max_seats integer not null default 10, seats_used integer not null default 0,
 created_at timestamptz not null default now()
);
create index if not exists team_codes_owner_idx on team_codes(owner_user_id);
