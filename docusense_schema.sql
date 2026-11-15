-- DocuSense: database schema draft (Supabase / PostgreSQL)
-- Users come from Supabase Auth (auth.users), so there is no users table here.

-- 1. One row per uploaded file (invoice or receipt)
create table public.documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  doc_type    text not null check (doc_type in ('invoice', 'receipt')),
  file_name   text not null,
  file_path   text not null,  -- where the original file is stored (e.g. Supabase Storage)
  status      text not null default 'pending_review'
              check (status in ('processing', 'pending_review', 'approved')),
  created_at  timestamptz not null default now(),
  approved_at timestamptz     -- set when the user reviews and approves (needed for CSV export)
);

-- 2. One row per extracted field (date, subtotal, tax, total, ...)
--    ai_value = what the AI extracted, value = what the user confirmed or corrected
--    value is null -> field is missing (flag it in the review form)
--    source_text / source_page -> used to highlight the text in the original PDF
create table public.document_fields (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  field_name  text not null,
  ai_value    text,
  value       text,
  source_text text,
  source_page int,
  unique (document_id, field_name)
);

-- 3. Invoice items (the plan lists "list of items" for invoices)
create table public.line_items (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  position    int not null default 0,
  description text,
  quantity    numeric,
  unit_price  numeric,
  total       numeric
);

create index on public.documents (user_id);
create index on public.document_fields (document_id);
create index on public.line_items (document_id);

-- Row Level Security: each user can only see and change their own data
alter table public.documents       enable row level security;
alter table public.document_fields enable row level security;
alter table public.line_items      enable row level security;

create policy "own documents" on public.documents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own fields" on public.document_fields
  for all
  using (exists (select 1 from public.documents d
                 where d.id = document_fields.document_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.documents d
                      where d.id = document_fields.document_id and d.user_id = auth.uid()));

create policy "own line items" on public.line_items
  for all
  using (exists (select 1 from public.documents d
                 where d.id = line_items.document_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.documents d
                      where d.id = line_items.document_id and d.user_id = auth.uid()));

-- OPTIONAL (enhancement "Custom Template"): only if templates are stored in Supabase.
-- If they stay in the browser's local storage, skip this part.
--
-- create table public.templates (
--   id         uuid primary key default gen_random_uuid(),
--   user_id    uuid not null references auth.users(id) on delete cascade,
--   name       text not null,
--   created_at timestamptz not null default now()
-- );
--
-- create table public.template_fields (
--   id          uuid primary key default gen_random_uuid(),
--   template_id uuid not null references public.templates(id) on delete cascade,
--   field_name  text not null,
--   field_type  text not null check (field_type in ('text', 'number', 'date')),
--   position    int not null default 0
-- );
--
-- alter table public.documents add column template_id uuid references public.templates(id);
-- (and add 'custom' to the doc_type check)
