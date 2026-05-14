import { ArrowRight, CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,74,166,0.12),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-white/70 bg-white/80 px-5 py-3 shadow-soft backdrop-blur">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.24em] text-brand-blue">
              ADNU Athletics
            </p>
            <p className="text-[12px] text-slate-500">Management Hub</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-white px-4 py-2 text-[12px] font-bold tracking-wide text-slate-700 transition-colors hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
            >
              Request access
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center py-12 lg:py-16">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <section className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white/85 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-blue shadow-soft">
                <ShieldCheck className="h-3.5 w-3.5" />
                University athletics operations
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                Run your athletics programs from a cleaner, calmer control center.
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-8 text-slate-600">
                ADNU Athletics Management Hub brings roster workflows, facilities, inventory, and event operations into one professional command surface for staff and program leaders.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-[13px] font-bold tracking-wide text-white shadow-float transition-colors hover:bg-brand-blue-hover"
                >
                  Go to sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-white px-6 py-3 text-[13px] font-bold tracking-wide text-slate-700 shadow-soft transition-colors hover:bg-slate-50"
                >
                  Create staff access
                </Link>
              </div>
            </section>

            <section className="relative">
              <div className="absolute inset-0 -rotate-6 rounded-[32px] bg-gradient-to-br from-brand-blue/10 to-brand-gold/15 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-float backdrop-blur sm:p-8">
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Athletes" value="842" />
                  <StatCard label="Reservations" value="31" />
                  <StatCard label="Staff" value="24" />
                </div>

                <div className="mt-6 space-y-4">
                  {highlightCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <article
                        key={card.title}
                        className="rounded-[24px] border border-border-subtle/60 bg-slate-50/80 p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue shadow-soft">
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <h2 className="text-[15px] font-bold text-slate-900">{card.title}</h2>
                            <p className="mt-2 text-[13px] leading-6 text-slate-500">{card.body}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-border-subtle/60 bg-slate-50/80 p-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
    </div>
  );
}
