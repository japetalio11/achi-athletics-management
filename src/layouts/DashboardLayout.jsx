import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useNavigation } from "../contexts/NavigationContext";
import { ChevronRight, Home } from "lucide-react";

export function DashboardLayout({ children }) {
  const { currentView, selectedAthlete, selectedCoach, navigateTo } = useNavigation();
  const selectedProfile =
    currentView === "athletes"
      ? selectedAthlete
      : currentView === "coaches"
        ? selectedCoach
        : null;

  return (
    <div className="flex h-screen bg-surface-bg overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 pb-6 pt-10 md:px-8 md:pb-8 md:pt-12 relative">
          <div className="max-w-[1300px] mx-auto w-full">
            {/* Breadcrumbs */}
            <div className="mb-6 flex items-center text-[12px] text-slate-500 font-medium tracking-wide">
              <button
                onClick={() => navigateTo("dashboard")}
                className={`hover:text-brand-blue flex items-center gap-1.5 transition-colors ${currentView === "dashboard" ? "text-slate-900 font-semibold" : ""}`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              {currentView !== "dashboard" && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 mx-2 opacity-40" />
                  <button
                    onClick={() => navigateTo(currentView)}
                    className={`hover:text-brand-blue capitalize transition-colors ${!selectedProfile ? "text-slate-900 font-semibold" : ""}`}
                  >
                    {currentView}
                  </button>
                </>
              )}

              {selectedProfile && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 mx-2 opacity-40" />
                  <span className="text-brand-blue font-semibold">
                    {selectedProfile.name}
                  </span>
                </>
              )}
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
