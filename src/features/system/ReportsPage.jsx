import { FileBarChart2, FileSpreadsheet, ShieldCheck } from "lucide-react";

const reportCards = [
  {
    title: "Executive Reports",
    body: "Use this route as the permanent home for athletics-wide executive exports and oversight summaries.",
    icon: FileBarChart2,
  },
  {
    title: "Operational Exports",
    body: "Inventory, eligibility, reservations, and event rollups can be surfaced here once backend reporting is connected.",
    icon: FileSpreadsheet,
  },
];

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border-subtle/50 bg-gradient-to-br from-brand-blue via-brand-blue-hover to-slate-900 p-8 text-white shadow-float">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">
            Reporting workspace
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Reports is route-ready.</h1>
          <p className="mt-3 text-[14px] leading-7 text-white/75">
            This temporary page keeps the routing structure production-ready now, while leaving room for a fuller reports module later.
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="rounded-[24px] border border-border-subtle/50 bg-surface-card p-6 shadow-soft"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-[18px] font-bold tracking-tight text-slate-950">{card.title}</h2>
              <p className="mt-2 text-[13px] leading-6 text-slate-500">{card.body}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/80 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-soft">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-slate-900">Next integration point</h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-500">
              When the real reports feature is built, this route can absorb shared filters, export actions, and role-based report access without changing the public URL contract.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
