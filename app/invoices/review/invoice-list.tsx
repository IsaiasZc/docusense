"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Invoice = { id: string; file_name: string; status: string };

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [message, setMessage] = useState("Loading invoices...");

  useEffect(() => {
    let active = true;
    async function loadInvoices() {
      const { data, error } = await supabase
        .from("documents")
        .select("id,file_name,status")
        .eq("doc_type", "invoice")
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setMessage("Could not load invoices. Check the connection and access permissions.");
        return;
      }
      setInvoices(data ?? []);
      setMessage(data?.length ? "" : "No invoices are available. Access may require signing in.");
    }
    void loadInvoices();
    return () => { active = false; };
  }, []);

  return (
    <section aria-labelledby="invoice-list-heading" className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 id="invoice-list-heading" className="text-base font-semibold">Available invoices</h2>
      {message && <p role="status" className="mt-2 text-sm text-slate-600">{message}</p>}
      {invoices.length > 0 && (
        <>
          <p className="mt-2 text-sm text-slate-500">Invoice review is not connected yet.</p>
          <ul className="mt-3 divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span>{invoice.file_name}</span>
                <span className="text-slate-500">{invoice.status.replaceAll("_", " ")}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
