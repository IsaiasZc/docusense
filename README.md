# DOCUSENSE

## Local setup

Install dependencies with `pnpm install` and add the following values to `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

Run `docusense_schema_nologin.sql` once in the Supabase SQL editor (no login, adds a sample invoice).
Run `pnpm dev` and open `/invoices/review`: pick an invoice, correct the fields and press
"Save & approve". The preview reads the file from the public Storage bucket `documents`.
Upload and saving the extraction (`/api/extract` to Supabase) are not connected yet.

To check the database connection and expected columns, run
`node --env-file=.env.local --test tests/supabase.test.mjs`. An empty result
does not prove that authenticated users can access their data.

## Quote - Isaias Zuñiga

*"Think the best and hope the best, and have faith in the future"* - Jeffrey R. Holland

## Quote - Brantley Cragun

*"Keep loving, keep trying, keep trusting, keep believing, keep growing heaven is cheering you on today, tomorrow & forever"* - Jeffrey R. Holland
