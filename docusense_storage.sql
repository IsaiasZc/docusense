-- DocuSense: Supabase Storage setup for 'documents' bucket

-- 1. Create bucket 'documents'
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- 2. Storage RLS Policies for 'documents' bucket
create policy "allow_all flreew_0"
on storage.objects for select
to public
using (bucket_id = 'documents');

create policy "allow_all flreew_1"
on storage.objects for insert
to public
with check (bucket_id = 'documents');

create policy "allow_all flreew_2"
on storage.objects for update
to public
using (bucket_id = 'documents');

create policy "allow_all flreew_3"
on storage.objects for delete
to public
using (bucket_id = 'documents');
