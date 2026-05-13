import {
  Calendar,
  Download,
  Users,
  CalendarCheck,
  FileWarning,
  Plus,
  ChevronRight,
  Map,
} from "lucide-react";

export function Dashboard() {
  return (
    <div className="space-y-6 pb-24 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Executive Intelligence
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Real-time oversight for the ADNU Athletics ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-surface-card border border-border-subtle/50 text-slate-600 px-4 py-2.5 rounded-full font-medium hover:bg-slate-50 transition-colors shadow-soft text-[12px] tracking-wide">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            LAST 30 DAYS
          </button>
          <button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-full font-medium hover:bg-brand-blue-hover transition-colors shadow-soft text-[12px] tracking-wide">
            <Download className="w-3.5 h-3.5" />
            EXPORT REPORT
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Athletes */}
        <div className="bg-surface-card p-7 rounded-[24px] border border-border-subtle/40 shadow-soft flex flex-col justify-between hover:shadow-float transition-shadow duration-300">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[13px] font-semibold text-brand-gold flex items-center gap-1">
                ↗ +12%
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
              Total Athletes
            </p>
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tighter">
              842
            </h3>
          </div>
          <div className="mt-8 pt-4 border-t border-border-subtle flex justify-between items-center text-[13px]">
            <span className="text-slate-500">Active Rosters</span>
            <span className="font-semibold text-slate-900">712</span>
          </div>
        </div>

        {/* Active Reservations */}
        <div className="bg-surface-card p-7 rounded-[24px] border border-border-subtle/40 shadow-soft flex flex-col justify-between hover:shadow-float transition-shadow duration-300">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-[13px] font-semibold text-red-600 flex items-center gap-1">
                ↘ -4%
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
              Active Reservations
            </p>
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tighter">
              31
            </h3>
          </div>
          <div className="mt-8 pt-4 border-t border-border-subtle flex justify-between items-center text-[13px]">
            <span className="text-slate-500">Pending Approval</span>
            <span className="font-semibold text-brand-gold">8</span>
          </div>
        </div>

        {/* Overdue Equipment */}
        <div className="bg-surface-card p-7 rounded-[24px] border border-border-subtle/40 shadow-soft flex flex-col justify-between hover:shadow-float transition-shadow duration-300">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <FileWarning className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded-md tracking-wider uppercase">
                Critical
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
              Overdue Equipment
            </p>
            <h3 className="text-4xl font-extrabold text-red-600 tracking-tighter">
              14
            </h3>
          </div>
          <div className="mt-8 pt-4 border-t border-border-subtle flex justify-between items-center text-[13px]">
            <span className="text-slate-500">Replacement Value</span>
            <span className="font-semibold text-slate-900">₱42.5k</span>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-surface-card p-7 rounded-[24px] border border-border-subtle/40 shadow-soft">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[15px] font-bold text-slate-900">
              Performance vs. Academics
            </h2>
            <div className="flex gap-4 text-[13px] font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-blue"></span>{" "}
                Win Rate
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold"></span>{" "}
                GPA Avg
              </div>
            </div>
          </div>

          {/* Mock Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-2">
            {[
              { label: "Basketball", win: 60, gpa: 80 },
              { label: "Volleyball", win: 75, gpa: 85 },
              { label: "Football", win: 55, gpa: 70 },
              { label: "Swimming", win: 85, gpa: 90 },
              { label: "Track", win: 40, gpa: 75 },
              { label: "Badminton", win: 70, gpa: 80 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-full max-w-[3.5rem] flex flex-col gap-1.5 justify-end h-full">
                  <div
                    className="w-full bg-brand-gold/90 rounded-[3px] transition-all group-hover:opacity-80"
                    style={{ height: `${stat.gpa}%` }}
                  ></div>
                  <div
                    className="w-full bg-brand-blue rounded-[3px] transition-all group-hover:opacity-80"
                    style={{ height: `${stat.win}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 mt-2">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Facilities */}
        <div className="bg-surface-card p-7 rounded-[24px] border border-border-subtle/40 shadow-soft flex flex-col">
          <div className="mb-5">
            <h2 className="text-[15px] font-bold text-slate-900">
              Pending Facilities
            </h2>
            <p className="text-[13px] text-slate-500">
              Awaiting director sign-off
            </p>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-border-subtle hover:border-brand-blue/20 hover:bg-slate-50 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-[13px] text-slate-900">
                    Main Gym C
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Varsity Practice • 2:00 PM
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-border-subtle hover:border-brand-blue/20 hover:bg-slate-50 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                  <span className="font-black text-lg leading-none">≈</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[13px] text-slate-900">
                    Aquatics Center
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Intramural Prelims • 4:30 PM
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-border-subtle hover:border-brand-blue/20 hover:bg-slate-50 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-[13px] text-slate-900">
                    Upper Field
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Football Tryouts • 6:00 PM
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <button className="w-full mt-5 py-2.5 text-[13px] font-semibold text-brand-blue hover:bg-brand-blue-light rounded-lg transition-colors">
            VIEW ALL REQUESTS
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-surface-card rounded-[24px] border border-border-subtle/40 shadow-soft overflow-hidden">
        <div className="p-7 border-b border-border-subtle/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">
              Eligibility Alerts
            </h2>
            <p className="text-[13px] text-slate-500">
              Immediate action required for active rosters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-[10px] tracking-widest font-bold border border-border-subtle/50 rounded-full hover:bg-slate-50 text-slate-500">
              ACADEMIC
            </button>
            <button className="px-3 py-1.5 text-[10px] tracking-widest font-bold border border-border-subtle/50 rounded-full hover:bg-slate-50 text-slate-500">
              MEDICAL
            </button>
            <button className="px-3 py-1.5 text-[10px] tracking-widest font-bold border border-border-subtle/50 rounded-full hover:bg-slate-50 text-slate-500">
              FINANCIAL
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] tracking-widest font-bold text-slate-400 uppercase">
                <th className="p-5 pl-7 font-semibold">Athlete</th>
                <th className="p-5 font-semibold">Team</th>
                <th className="p-5 font-semibold">GPA / Status</th>
                <th className="p-5 font-semibold">Issue</th>
                <th className="p-5 pr-7 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-[13px]">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 pl-7">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300"></div>
                    <span className="font-semibold text-slate-900">
                      Marco Santino
                    </span>
                  </div>
                </td>
                <td className="p-5 text-slate-600">Basketball (M)</td>
                <td className="p-5 font-semibold text-red-600">
                  <div className="flex items-center gap-3">
                    1.85
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-red-600 h-full w-1/3"></div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-700 uppercase tracking-wider">
                    Academic Probation
                  </span>
                </td>
                <td className="p-5 pr-7 text-right">
                  <button className="font-semibold text-brand-blue hover:text-brand-blue-hover transition-colors">
                    Notify Coach
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 pl-7">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300"></div>
                    <span className="font-semibold text-slate-900">
                      Elena Reyes
                    </span>
                  </div>
                </td>
                <td className="p-5 text-slate-600">Volleyball (W)</td>
                <td className="p-5 font-semibold text-slate-900">
                  <div className="flex items-center gap-3">
                    3.40
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-brand-blue h-full w-4/5"></div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-brand-gold-light text-brand-gold-hover uppercase tracking-wider">
                    Medical Waiver Expired
                  </span>
                </td>
                <td className="p-5 pr-7 text-right">
                  <button className="font-semibold text-brand-blue hover:text-brand-blue-hover transition-colors">
                    Update File
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 pl-7">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300"></div>
                    <span className="font-semibold text-slate-900">
                      Kevin Chan
                    </span>
                  </div>
                </td>
                <td className="p-5 text-slate-600">Track & Field</td>
                <td className="p-5 font-semibold text-slate-900">
                  <div className="flex items-center gap-3">
                    2.15
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-slate-400 h-full w-1/2"></div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                    Pending Evaluation
                  </span>
                </td>
                <td className="p-5 pr-7 text-right">
                  <button className="font-semibold text-brand-blue hover:text-brand-blue-hover transition-colors">
                    Review Case
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-full flex items-center justify-center shadow-float transition-all hover:scale-105 active:scale-95 z-50">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
