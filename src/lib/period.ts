export type Period = "today" | "7d" | "30d" | "90d" | "year";

export const periodLabels: Record<Period, string> = {
  today: "Aujourd'hui",
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  "90d": "90 derniers jours",
  year: "Cette année",
};

export function resolvePeriod(value: string | undefined): Period {
  if (value && value in periodLabels) return value as Period;
  return "30d";
}

export function getPeriodRange(period: Period) {
  const now = new Date();
  const end = now;
  let start: Date;
  let prevStart: Date;
  let prevEnd: Date;
  let groupBy: "day" | "month" = "day";

  switch (period) {
    case "today": {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      prevEnd = start;
      prevStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
      break;
    }
    case "7d": {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevEnd = start;
      prevStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    }
    case "90d": {
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      prevEnd = start;
      prevStart = new Date(start.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    }
    case "year": {
      start = new Date(now.getFullYear(), 0, 1);
      prevEnd = start;
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      groupBy = "month";
      break;
    }
    case "30d":
    default: {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevEnd = start;
      prevStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    }
  }

  return { start, end, prevStart, prevEnd, groupBy };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return ((current - previous) / previous) * 100;
}
