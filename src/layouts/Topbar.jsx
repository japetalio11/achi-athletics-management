import { Search, Bell, HelpCircle } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-16 bg-surface-card border-b border-border-subtle/50 flex items-center justify-between px-8 flex-shrink-0 relative z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
          <input
            type="text"
            placeholder="Search athletes, coaches, facilities, or gear..."
            className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-brand-blue/20 focus:shadow-soft rounded-full py-2.5 pl-11 pr-4 text-[13px] text-slate-700 transition-all outline-none placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5 pl-6 ml-auto">
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue-light rounded-full transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-gold rounded-full border border-white"></span>
          </button>
          <button className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue-light rounded-full transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-border-subtle"></div>

        {/* User Profile */}
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
          <div className="hidden sm:block text-right">
            <p className="text-[13px] font-semibold text-slate-800 leading-none mb-0.5">
              Director Admin
            </p>
            <p className="text-[11px] text-slate-500 leading-none">
              Athletics Office
            </p>
          </div>
          <img
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
            alt="User profile"
            className="w-8 h-8 rounded-full border border-border-subtle object-cover"
          />
        </button>
      </div>
    </header>
  );
}
