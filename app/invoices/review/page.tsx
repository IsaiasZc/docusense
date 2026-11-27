import { InvoiceReview } from "./invoice-review";

export default function InvoiceReviewPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-5 sm:px-8">
          <span aria-hidden="true" className="mr-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            D
          </span>
          <span className="text-lg font-semibold tracking-tight">DocuSense</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <p className="text-sm text-slate-500">Invoices / Review</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Review invoice</h1>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Review and correct the extracted information before approving your invoice.
        </p>

        <InvoiceReview />
      </main>
    </div>
  );
}
