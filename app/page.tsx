import StatusBadge from "@/components/StatusBadge";

const documents = [
  { id: 1, fileName: "invoice-march.pdf", type: "Invoice", status: "approved" },
  { id: 2, fileName: "receipt-coffee.pdf", type: "Receipt", status: "pending_review" },
  { id: 3, fileName: "invoice-april.pdf", type: "Invoice", status: "processing" },
] as const;

export default function Dashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 text-white/60">
          <tr>
            <th className="py-2">File name</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b border-white/5">
              <td className="py-3">{doc.fileName}</td>
              <td>{doc.type}</td>
              <td><StatusBadge status={doc.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}