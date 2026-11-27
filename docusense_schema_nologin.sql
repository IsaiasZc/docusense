-- DocuSense: run this once in the Supabase SQL editor to work without login.
-- Course project only: anyone with the anon key can read and write.

alter table public.documents alter column user_id drop not null;
alter table public.documents       disable row level security;
alter table public.document_fields disable row level security;
alter table public.line_items      disable row level security;

-- Sample invoice to test the review screen (delete it later)
with d as (
  insert into public.documents (doc_type, file_name, file_path, status)
  values ('invoice', 'sample-invoice.png', 'sample-invoice.png', 'pending_review')
  returning id
)
insert into public.document_fields (document_id, field_name, ai_value)
select d.id, f.name, f.val from d, (values
  ('vendor_name', 'ACME Supplies LLC'),
  ('date', '2026-11-10'),
  ('subtotal', '60.00'),
  ('tax', '4.80'),
  ('total', '64.80')
) as f(name, val);
