import { InvoiceList } from "./invoice-list";

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const labelClass = "block text-sm font-medium text-slate-700";

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

        <InvoiceList />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="document-heading" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 id="document-heading" className="text-base font-semibold">Document preview</h2>
            <p className="mt-1 text-sm text-slate-500">Your invoice will appear here after it is uploaded.</p>
            <div className="mt-5 flex min-h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 text-center sm:min-h-96">
              <div>
                <div aria-hidden="true" className="mx-auto flex h-12 w-10 items-center justify-center rounded border-2 border-slate-300 text-xl text-slate-400">▤</div>
                <p className="mt-4 text-sm font-medium text-slate-600">No document available</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="details-heading" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 id="details-heading" className="text-base font-semibold">Invoice details</h2>
            <p className="mt-1 text-sm text-slate-500">Fields can be edited once the invoice is ready.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>Invoice date<input className={inputClass} type="date" name="invoice-date" /></label>
              <label className={labelClass}>Subtotal<input className={inputClass} type="number" step="0.01" name="subtotal" placeholder="0.00" /></label>
              <label className={labelClass}>Tax<input className={inputClass} type="number" step="0.01" name="tax" placeholder="0.00" /></label>
              <label className={labelClass}>Total<input className={inputClass} type="number" step="0.01" name="total" placeholder="0.00" /></label>
            </div>
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold">Items</h3>
              <p className="mt-2 rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Extracted invoice items will appear here.
              </p>
            </div>
            <div className="mt-8 flex justify-end border-t border-slate-200 pt-5">
              <button type="button" disabled className="cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500">
                Save &amp; approve
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
