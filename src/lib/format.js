function parseToDate(date) {
  if (date instanceof Date) return date;
  if (typeof date === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [y, m, d] = date.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(date);
}

export function formatDate(date) {
  if (!date) return "";
  const d = parseToDate(date);
  if (d instanceof Date && !Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return String(date);
}

export function dateValue(date) {
  if (!date) return 0;
  const d = parseToDate(date);
  return d instanceof Date && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
}

