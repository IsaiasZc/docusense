"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Invoice = { id: string; file_name: string; file_path: string; status: string };

// Field names shared with the rest of the team
const FIELDS = [
  { name: "vendor_name", label: "Vendor", type: "text" },
  { name: "date", label: "Invoice date", type: "date" },
  { name: "subtotal", label: "Subtotal", type: "number" },
  { name: "tax", label: "Tax", type: "number" },
  { name: "total", label: "Total", type: "number" },
];

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const labelClass = "block text-sm font-medium text-slate-700";

// The AI may return dates as dd/mm/yyyy, but <input type="date"> only accepts yyyy-mm-dd
function fixDate(value: string) {
  const m = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : value;
}

export function InvoiceReview() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [message, setMessage] = useState("Loading invoices...");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadInvoices() {
      const { data, error } = await supabase
        .from("documents")
        .select("id,file_name,file_path,status")
        .eq("doc_type", "invoice")
        .order("created_at", { ascending: false });
      if (error) return setMessage("Could not load invoices.");
      setInvoices(data ?? []);
      setMessage(data?.length ? "" : "No invoices are available.");
    }
    loadInvoices();
  }, []);

  async function selectInvoice(invoice: Invoice) {
    setSelected(invoice);
    setStatus("");
    const { data, error } = await supabase
      .from("document_fields")
      .select("field_name,ai_value,value")
      .eq("document_id", invoice.id);
    if (error) return setStatus("Could not load the extracted fields.");

    // Show the user's value if there is one, otherwise what the AI extracted
    const loaded: Record<string, string> = {};
    for (const f of data ?? []) {
      const text = f.value ?? f.ai_value ?? "";
      loaded[f.field_name] = f.field_name === "date" ? fixDate(text) : text;
    }
    setValues(loaded);
  }

  async function approve() {
    if (!selected) return;
    setStatus("Saving...");
    const rows = FIELDS.map((f) => ({
      document_id: selected.id,
      field_name: f.name,
      value: values[f.name] || null,
    }));
    const { error: fieldsError } = await supabase
      .from("document_fields")
      .upsert(rows, { onConflict: "document_id,field_name" });
    const { error: docError } = await supabase
      .from("documents")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", selected.id);
    if (fieldsError || docError) return setStatus("Could not save. Try again.");

    setStatus("Invoice approved.");
    setInvoices(invoices.map((i) => (i.id === selected.id ? { ...i, status: "approved" } : i)));
  }

  // Public URL of the file in the "documents" storage bucket
  const previewUrl = selected
    ? supabase.storage.from("documents").getPublicUrl(selected.file_path).data.publicUrl
    : "";

  return (
    <>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold">Available invoices</h2>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
        <ul className="mt-3 divide-y divide-slate-100">
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <button
                type="button"
                onClick={() => selectInvoice(invoice)}
                className={`flex w-full flex-wrap justify-between gap-2 px-2 py-3 text-left text-sm hover:bg-slate-50 ${selected?.id === invoice.id ? "bg-blue-50" : ""}`}
              >
                <span>{invoice.file_name}</span>
                <span className="text-slate-500">{invoice.status.replaceAll("_", " ")}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold">Document preview</h2>
          <div className="mt-5 flex min-h-72 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center sm:min-h-96">
            {selected ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt={selected.file_name} className="max-h-96 w-full object-contain" />
            ) : (
              <p className="px-5 text-sm font-medium text-slate-600">Select an invoice to see it here</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold">Invoice details</h2>
          <p className="mt-1 text-sm text-slate-500">
            {selected ? "Review and correct the fields, then approve." : "Select an invoice to edit its fields."}
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <label key={f.name} className={labelClass}>
                {f.label}
                <input
                  className={inputClass}
                  type={f.type}
                  step={f.type === "number" ? "0.01" : undefined}
                  disabled={!selected}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-200 pt-5">
            {status && <p className="text-sm text-slate-600">{status}</p>}
            <button
              type="button"
              onClick={approve}
              disabled={!selected}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              Save &amp; approve
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
