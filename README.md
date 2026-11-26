# DOCUSENSE

## Local setup

Install dependencies with `pnpm install` and add the following values to `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

Run `pnpm dev` and open `/invoices/review`. The invoice list uses the
publishable key and respects the project's access policies. Without a user
session, invoices may not be visible. The review form is a preview; upload,
extraction, document loading, and saving are not connected yet.

To check the database connection and expected columns, run
`node --env-file=.env.local --test tests/supabase.test.mjs`. An empty result
does not prove that authenticated users can access their data.

## Quote - Isaias Zuñiga

*"Think the best and hope the best, and have faith in the future"* - Jeffrey R. Holland

## Quote - Brantley Cragun

*"Keep loving, keep trying, keep trusting, keep believing, keep growing heaven is cheering you on today, tomorrow & forever"* - Jeffrey R. Holland
