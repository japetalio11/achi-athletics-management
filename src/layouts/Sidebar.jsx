import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  Archive,
  Map,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useNavigation } from "../contexts/NavigationContext";
import { useAuth } from "../contexts/AuthContext";

export function Sidebar() {
  const { currentView } = useNavigation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
    { id: "athletes", to: "/athletes", icon: Users, label: "Athletes" },
    { id: "coaches", to: "/coaches", icon: UserRound, label: "Coaches" },
    { id: "events", to: "/events", icon: CalendarDays, label: "Events" },
    { id: "inventory", to: "/inventory", icon: Archive, label: "Inventory" },
    { id: "facilities", to: "/facilities", icon: Map, label: "Facilities" },
    { id: "reports", to: "/reports", icon: HelpCircle, label: "Reports" },
    { id: "settings", to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-[260px] bg-surface-card border-r border-border-subtle text-slate-600 flex flex-col h-screen flex-shrink-0 relative z-20">
      {/* Brand */}
      <div className="p-8 pb-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/ADNU_Logo.png" alt="ADNU logo" className="h-10 w-10 rounded-full object-cover shadow-sm" />
          <div>
            <h1 className="text-brand-blue text-[18px] font-bold tracking-tight">ADNU Athletics</h1>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">Management Hub</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-brand-blue/5 text-brand-blue font-semibold"
                  : "hover:bg-slate-50 hover:text-slate-900 text-slate-500 font-medium"
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] ${isActive ? "text-brand-blue" : "text-slate-400"}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[13px]">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-blue shadow-sm shadow-brand-blue/50"></div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-1 mb-4 px-4 border-t border-border-subtle pt-6">
        <Link
          to="/not-found"
          className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg hover:bg-slate-50 hover:text-brand-blue font-medium transition-all duration-200"
        >
          <HelpCircle className="w-[18px] h-[18px]" strokeWidth={2} />
          <span className="text-[13px]">Help Center</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg hover:bg-red-50 hover:text-red-600 font-medium transition-all duration-200 text-slate-500"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={2} />
          <span className="text-[13px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
