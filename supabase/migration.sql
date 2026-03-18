-- Places table
create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('temple','samadhi','ashram','water')),
  deity text,
  description text,
  location geography(point, 4326) not null,
  district text,
  state text,
  timings text,
  entry_info text,
  best_time text,
  status text not null default 'approved' check (status in ('approved','pending','rejected')),
  verified_at timestamptz,
  created_at timestamptz default now()
);

-- Enable PostGIS distance queries
create index places_location_idx on places using gist(location);

-- Submissions table (community-submitted places awaiting review)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  device_token text not null,
  name text not null,
  category text not null,
  deity text,
  description text,
  lat double precision not null,
  lng double precision not null,
  district text,
  state text,
  timings text,
  entry_info text,
  best_time text,
  photo_urls text[],
  status text not null default 'under_review' check (status in ('under_review','approved','rejected')),
  rejection_reason text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- Suggested edits table
create table suggested_edits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references places(id),
  device_token text not null,
  changes jsonb not null,
  status text not null default 'under_review',
  created_at timestamptz default now()
);

-- Row-level security: public read for approved places
alter table places enable row level security;
create policy "Public read approved" on places for select using (status = 'approved');

-- Submissions: insert only (no public read of others' submissions)
alter table submissions enable row level security;
create policy "Insert submissions" on submissions for insert with check (true);
create policy "Read own submissions" on submissions for select using (device_token = current_setting('app.device_token', true));
