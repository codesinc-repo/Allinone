export function formatMoney(n: number, currency = "₹") {
  return `${currency}${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function parseImages(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseMeta<T = Record<string, unknown>>(
  json: string | null | undefined,
): T {
  if (!json) return {} as T;
  try {
    return JSON.parse(json) as T;
  } catch {
    return {} as T;
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "SUCCESS":
    case "ACTIVE":
    case "COMPLETED":
    case "PAID":
    case "ACTIONED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "PENDING":
    case "NEW":
    case "DRAFT":
    case "UNDER_REVIEW":
    case "OPEN":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "FAILED":
    case "CANCELLED":
    case "INACTIVE":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "CONTACTED":
    case "REVIEWED":
      return "bg-sky-100 text-sky-700 border-sky-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}
