"use client";

import { useState } from "react";
import { ParsedObject } from "./api/extract/route";

export default function HomePage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [records, setRecords] = useState<ParsedObject[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!selectedFile) {
            setError("There was an error"); 
            return; 
        }
        setIsLoading(true);
        setError(null);

        try{
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch("/api/extract", {method: "POST", body: formData});
            const result = await res.json();

            if (!res.ok || ! result.success) {
                setError(result.error ?? "There was a failure in extracting the info.")
            } else {
                setRecords((prev) => [...prev, result.data])
            }
        } catch {
            setError("There was an error with extracting the info")
        } finally {
            setIsLoading(false);
        }
    }

    return(
        <main>
            {isLoading && <p>Extracting Document</p>}
            {error && <p role="alert">{error}</p>}
            {records.length > 0 && (
                <section>
                    <h2>Extracted Docs</h2>
                    <ul>
                        {records.map((record, index) => (
                            <li key={index}>
                                <pre>{JSON.stringify(record, null, 2)}</pre>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <h1>Document Extractor</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}></input>
                <button type="submit">Submit File</button>
            </form>
        </main>
    )
}