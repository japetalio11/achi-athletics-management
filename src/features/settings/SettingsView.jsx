import {
  ShieldCheck,
  Database,
  Mail,
  MessageSquare,
  Megaphone,
  UserPlus,
  MoreVertical,
  PencilLine,
} from "lucide-react";

const users = [
  {
    id: "od",
    name: "Oerome De Villa",
    email: "jdevilla@adnu.edu.ph",
    role: "Admin",
    status: "Active",
    lastLogin: "2 minutes ago",
    tone: "blue",
  },
  {
    id: "sc",
    name: "Sarah Co",
    email: "sco@adnu.edu.ph",
    role: "Coach",
    status: "Active",
    lastLogin: "Yesterday, 4:30 PM",
    tone: "peach",
  },
  {
    id: "mr",
    name: "Mark Rivera",
    email: "mrivera@adnu.edu.ph",
    role: "Scout",
    status: "Inactive",
    lastLogin: "Aug 12, 2024",
    tone: "slate",
  },
  {
    id: "al",
    name: "Ana Lopez",
    email: "alopez@adnu.edu.ph",
    role: "Trainer",
    status: "Active",
    lastLogin: "3 hours ago",
    tone: "indigo",
  },
];

const toneStyles = {
  blue: "bg-blue-200 text-blue-900",
  peach: "bg-orange-200 text-orange-900",
  slate: "bg-slate-200 text-slate-700",
  indigo: "bg-indigo-200 text-indigo-900",
};

const statusStyles = {
  Active: "text-green-600",
  Inactive: "text-slate-400",
};

export function SettingsView() {
  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="bg-surface-card rounded-[20px] border border-border-subtle/50 shadow-soft p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-slate-900/90 mb-4 overflow-hidden flex items-center justify-center text-white font-bold text-lg">
              <span className="opacity-80">ADNU</span>
            </div>
            <h2 className="text-[16px] font-bold text-slate-900">
              Ateneo de Naga University
            </h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Primary Institution ID: ADNU-ATe-2024
            </p>
          </div>

          <div className="mt-6 border-t border-border-subtle pt-6 space-y-4 text-[13px]">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Department Domain
              </p>
              <p className="text-slate-800 font-semibold mt-1">
                athletics.adnu.edu.ph
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Location
              </p>
              <p className="text-slate-800 font-semibold mt-1">
                Naga City, Camarines Sur
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Administrative Contact
              </p>
              <p className="text-slate-800 font-semibold mt-1">
                admin@adnu.edu.ph
              </p>
            </div>
          </div>

          <button className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-blue text-white px-4 py-3 rounded-xl font-semibold hover:bg-brand-blue-hover transition-colors shadow-soft text-[13px]">
            <PencilLine className="w-4 h-4" />
            Edit Organization Profile
          </button>
        </div>

        <div className="bg-surface-card rounded-[20px] border border-border-subtle/50 shadow-soft overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle/50">
            <div>
              <h2 className="text-[18px] font-bold text-slate-900">
                User Management
              </h2>
              <p className="text-[13px] text-slate-500">
                Configure access levels and monitor staff activity
              </p>
            </div>
            <button className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-xl font-semibold text-[13px] shadow-soft hover:bg-brand-blue-hover transition-colors">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] tracking-widest font-bold text-slate-400 uppercase border-b border-border-subtle/50">
                  <th className="p-4 pl-6 font-semibold">User Profile</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Last Login</th>
                  <th className="p-4 pr-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-[13px]">
                {users.map((user) => (
                  <tr key={user.email} className="hover:bg-slate-50/60">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] ${
                            toneStyles[user.tone]
                          }`}
                        >
                          {user.id.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.name}
                          </p>
                          <p className="text-[12px] text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.status === "Active"
                              ? "bg-green-500"
                              : "bg-slate-300"
                          }`}
                        ></span>
                        <span
                          className={`font-medium ${statusStyles[user.status]}`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{user.lastLogin}</td>
                    <td className="p-4 pr-6 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-brand-blue transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-5 border-t border-border-subtle/50 flex items-center justify-between text-[12px] text-slate-500">
            <span>Showing 4 of 24 users</span>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg border border-border-subtle text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 rounded-lg border border-border-subtle text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface-card rounded-[20px] border border-border-subtle/50 shadow-soft p-6 space-y-5">
          <div>
            <h3 className="text-[16px] font-bold text-slate-900">
              Notification Preferences
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-900">
                  Email Alerts
                </p>
                <p className="text-[12px] text-slate-500">
                  Daily summary of athlete performance
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-brand-blue transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-900">
                  SMS Notifications
                </p>
                <p className="text-[12px] text-slate-500">
                  Critical facility & injury alerts
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-brand-blue transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-900">
                  System Broadcasts
                </p>
                <p className="text-[12px] text-slate-500">
                  Platform maintenance & updates
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-brand-blue transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>

        <div className="bg-surface-card rounded-[20px] border border-border-subtle/50 shadow-soft p-6 flex flex-col justify-between gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-900">
                Security & Privacy
              </h3>
              <p className="text-[13px] text-slate-500 mt-1">
                Manage password policies, two-factor authentication, and data
                encryption settings.
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 text-brand-blue font-semibold text-[13px] hover:text-brand-blue-hover transition-colors">
            Configure Security
            <span aria-hidden>→</span>
          </button>
        </div>

        <div className="bg-surface-card rounded-[20px] border border-border-subtle/50 shadow-soft p-6 flex flex-col justify-between gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-900">
                Data & Backups
              </h3>
              <p className="text-[13px] text-slate-500 mt-1">
                Set automated backup frequencies and export athlete records for
                external audits.
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 text-brand-blue font-semibold text-[13px] hover:text-brand-blue-hover transition-colors">
            Export Data
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
