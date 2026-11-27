"use client";

import { useState } from "react";
import Link from "next/link";

export default function InvoiceUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return setMessage("Choose a file first.");

    setSaved(false);
    setMessage("Extracting data...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok || !result.success) return setMessage(result.error ?? "Something went wrong.");
      setSaved(true);
      setMessage("Invoice saved.");
    } catch {
      setMessage("Could not reach the server.");
    }
  }

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
        <p className="text-sm text-slate-500">Invoices / Upload</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Upload invoice</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Upload an image of your invoice (png, jpeg, webp or gif) to extract its data.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-50"
          />
          <div className="mt-5 flex items-center gap-4">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              Upload
            </button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
            {saved && (
              <Link href="/invoices/review" className="text-sm font-medium text-blue-600 hover:underline">
                Review invoice
              </Link>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
