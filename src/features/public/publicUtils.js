import {
  Activity,
  Brain,
  CircleDot,
  Dumbbell,
  Medal,
  Shield,
  Sparkles,
  Waves,
} from "lucide-react";

export const sportMetaMap = {
  Basketball: {
    badgeClass: "bg-orange-50 text-orange-700",
    chipClass: "bg-orange-100 text-orange-800",
  },
  Volleyball: {
    badgeClass: "bg-violet-50 text-violet-700",
    chipClass: "bg-violet-100 text-violet-800",
  },
  Football: {
    badgeClass: "bg-emerald-50 text-emerald-700",
    chipClass: "bg-emerald-100 text-emerald-800",
  },
  Athletics: {
    badgeClass: "bg-amber-50 text-amber-700",
    chipClass: "bg-amber-100 text-amber-800",
  },
  "Track and Field": {
    badgeClass: "bg-amber-50 text-amber-700",
    chipClass: "bg-amber-100 text-amber-800",
  },
  Swimming: {
    badgeClass: "bg-cyan-50 text-cyan-700",
    chipClass: "bg-cyan-100 text-cyan-800",
  },
  Badminton: {
    badgeClass: "bg-indigo-50 text-indigo-700",
    chipClass: "bg-indigo-100 text-indigo-800",
  },
  "Table Tennis": {
    badgeClass: "bg-sky-50 text-sky-700",
    chipClass: "bg-sky-100 text-sky-800",
  },
  Taekwondo: {
    badgeClass: "bg-rose-50 text-rose-700",
    chipClass: "bg-rose-100 text-rose-800",
  },
  Chess: {
    badgeClass: "bg-slate-100 text-slate-700",
    chipClass: "bg-slate-200 text-slate-800",
  },
  Other: {
    badgeClass: "bg-slate-100 text-slate-700",
    chipClass: "bg-slate-200 text-slate-800",
  },
};

const sportIcons = {
  Basketball: CircleDot,
  Volleyball: Medal,
  Football: Shield,
  Athletics: Activity,
  "Track and Field": Activity,
  Swimming: Waves,
  Badminton: Sparkles,
  "Table Tennis": CircleDot,
  Taekwondo: Dumbbell,
  Chess: Brain,
  Other: Medal,
};

export function getSportMeta(sport) {
  const meta = sportMetaMap[sport] ?? sportMetaMap.Other;
  return {
    ...meta,
    icon: sportIcons[sport] ?? sportIcons.Other,
  };
}

export function formatPublicDate(value) {
  if (!value) return "Pending";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toTwelveHour(value) {
  if (!value) return "Pending";
  const [hourString, minuteString = "00"] = value.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minuteString} ${suffix}`;
}

export function formatPublicDateTime(date, startTime, endTime) {
  return `${formatPublicDate(date)} | ${toTwelveHour(startTime)} - ${toTwelveHour(endTime)}`;
}

export function mergeStoredRecords(key, normalizeRecord) {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]").map(normalizeRecord);
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
}

export function saveStoredRecord(key, record, normalizeRecord = (value) => value) {
  const current = mergeStoredRecords(key, normalizeRecord);
  window.localStorage.setItem(key, JSON.stringify([record, ...current]));
}

export function makeReference(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function makeTimelineItems(entries = []) {
  return entries.map((entry) => {
    const [meta, ...rest] = String(entry).split(" - ");
    return { title: rest[0] ?? meta, meta: rest.length ? meta : "", body: rest.slice(1).join(" - ") };
  });
}

export function getRequestStatusMeta(status) {
  if (status === "Approved") return "bg-green-50 text-green-700";
  if (status === "Rejected") return "bg-red-50 text-red-700";
  if (status === "Completed") return "bg-brand-blue-light text-brand-blue";
  if (status === "Pending Review") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export function getDocumentStatusMeta(status) {
  if (status === "Approved" || status === "Submitted") return "bg-green-50 text-green-700";
  if (status === "Documents Needed" || status === "Missing") return "bg-amber-50 text-amber-700";
  if (status === "Rejected") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-600";
}
