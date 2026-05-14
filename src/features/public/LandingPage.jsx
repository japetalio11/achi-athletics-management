import { ArrowRight, CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicNavbar } from "./PublicLayout";

const highlightCards = [
  {
    title: "Roster Oversight",
    body: "Track athletes, coaches, and eligibility checkpoints across every program.",
    icon: Users,
  },
  {
    title: "Facilities Control",
    body: "Review reservations, monitor availability, and keep venue operations moving.",
    icon: MapPin,
  },
  {
    title: "Event Coordination",
    body: "Plan calendars, assignments, and competition logistics in one operations hub.",
    icon: CalendarDays,
  },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,74,166,0.12),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(15,58,110,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,58,110,0.04)_1px,transparent_1px)] [background-size:58px_58px]" />
      <div className="pointer-events-none absolute right-[-140px] top-[30%] h-[360px] w-[360px] rounded-full border border-brand-gold/20 bg-brand-gold/10 blur-3xl" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <PublicNavbar variant="institutional" />

        <main className="flex flex-1 items-center py-12 lg:py-16">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <section className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-blue shadow-soft">
                <ShieldCheck className="h-3.5 w-3.5" />
                Ateneo de Naga University Athletics Department
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                Athletics Management System for student-athlete support and campus operations.
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-8 text-slate-600">
                ADNU Athletics Management Hub unifies roster workflows, facilities, inventory, and event coordination into one professional platform for university staff and program leaders.
              </p>
              <div className="mt-5 inline-flex items-center rounded-full border border-brand-gold/35 bg-brand-gold-light px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#7f6316]">
                Official campus athletics operations portal
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-[13px] font-bold tracking-wide text-white shadow-float ring-1 ring-brand-gold/30 transition-colors hover:bg-brand-blue-hover"
                >
                  Go to sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full border border-brand-blue/15 bg-white px-6 py-3 text-[13px] font-bold tracking-wide text-slate-700 shadow-soft transition-colors hover:bg-brand-blue-light/40"
                >
                  Create staff access
                </Link>
              </div>
            </section>

            <section className="relative">
              <div className="absolute inset-0 -rotate-6 rounded-[32px] bg-gradient-to-br from-brand-blue/10 to-brand-gold/15 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/92 p-0 shadow-float backdrop-blur sm:p-0">
                <img
                  src="/ateneo_school.jpg"
                  alt="Ateneo de Naga University building"
                  className="block h-[420px] w-full object-cover"
                />
              </div>
            </section>
          </div>
        </main>

        <footer className="pb-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Ateneo de Naga University • Athletics Management System
          </p>
        </footer>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-border-subtle/60 bg-slate-50/80 p-4 text-center">
      <div className="mx-auto h-1.5 w-10 rounded-full bg-gradient-to-r from-brand-blue to-brand-gold" />
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
    </div>
  );
}
