type Status = "processing" | "pending_review" | "approved";

const styles: Record<Status, string> = {
  processing: "bg-yellow-500/20 text-yellow-300",
  pending_review: "bg-blue-500/20 text-blue-300",
  approved: "bg-green-500/20 text-green-300",
};

const labels: Record<Status, string> = {
  processing: "Processing",
  pending_review: "Pending review",
  approved: "Approved",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}