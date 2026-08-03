-- Blamo Closing migration 005: verified-buyer testimonials
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  purchase_id uuid references purchases(id) on delete set null,
  text text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  submitted_at timestamptz not null default now(),
  constraint testimonials_text_length check (char_length(text) between 20 and 600),
  constraint testimonials_status_check check (status in ('pending', 'approved', 'rejected'))
);
create index if not exists testimonials_pending_idx on testimonials (status) where status = 'pending';
create index if not exists testimonials_user_idx on testimonials (user_id);
