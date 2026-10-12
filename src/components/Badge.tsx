import { statusColor } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${statusColor(status)}`}>{status}</span>;
}
