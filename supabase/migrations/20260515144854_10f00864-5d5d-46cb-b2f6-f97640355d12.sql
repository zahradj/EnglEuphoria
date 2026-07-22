create table if not exists public.dictionary_cache (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  context_hash text not null,
  language text not null,
  definition text not null,
  translation text not null,
  image_url text,
  created_at timestamptz not null default now(),
  unique (word, context_hash, language)
);

alter table public.dictionary_cache enable row level security;

create policy "dictionary_cache_read_authenticated"
  on public.dictionary_cache
  for select
  to authenticated
  using (true);
