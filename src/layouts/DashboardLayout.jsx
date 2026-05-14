import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useNavigation } from "../contexts/NavigationContext";
import { ChevronRight, Home } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

export function DashboardLayout({ children }) {
  const {
    currentView,
    selectedAthlete,
    selectedCoach,
    selectedEvent,
    selectedInventoryItem,
    selectedFacility,
    selectedFacilityReservation,
  } = useNavigation();
  const { pathname } = useLocation();
  const routeContent = children ?? <Outlet />;
  const breadcrumbs = buildBreadcrumbs({
    pathname,
    currentView,
    selectedAthlete,
    selectedCoach,
    selectedEvent,
    selectedInventoryItem,
    selectedFacility,
    selectedFacilityReservation,
  });

  return (
    <div className="relative flex h-screen overflow-hidden font-sans">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(15,58,110,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,58,110,0.04)_1px,transparent_1px)] [background-size:58px_58px]" />
      <div className="pointer-events-none absolute right-[-140px] top-[30%] h-[360px] w-[360px] rounded-full border border-brand-gold/20 bg-brand-gold/10 blur-3xl" />

      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 pb-6 pt-10 md:px-8 md:pb-8 md:pt-12 relative">
          <div className="max-w-[1300px] mx-auto w-full">
            <div className="mb-6 flex items-center text-[12px] text-slate-500 font-medium tracking-wide">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <div key={`${crumb.label}-${crumb.to ?? "current"}`} className="flex items-center">
                    {index > 0 ? (
                      <ChevronRight className="w-3.5 h-3.5 mx-2 opacity-40" />
                    ) : null}

                    {isLast || !crumb.to ? (
                      <span
                        className={`flex items-center gap-1.5 ${
                          isLast ? "text-slate-900 font-semibold" : ""
                        }`}
                      >
                        {crumb.icon}
                        <span>{crumb.label}</span>
                      </span>
                    ) : (
                      <Link
                        to={crumb.to}
                        className="hover:text-brand-blue flex items-center gap-1.5 transition-colors"
                      >
                        {crumb.icon}
                        <span>{crumb.label}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {routeContent}
          </div>
        </main>
      </div>
    </div>
  );
}

function buildBreadcrumbs({
  pathname,
  currentView,
  selectedAthlete,
  selectedCoach,
  selectedEvent,
  selectedInventoryItem,
  selectedFacility,
  selectedFacilityReservation,
}) {
  const root = {
    label: "Dashboard",
    to: "/dashboard",
    icon: <Home className="w-3.5 h-3.5" />,
  };

  if (pathname === "/dashboard") return [root];

  if (currentView === "athletes") {
    return [
      root,
      { label: "Athletes", to: "/athletes" },
      pathname.startsWith("/athletes/") && selectedAthlete?.id
        ? { label: selectedAthlete.name ?? selectedAthlete.id }
        : null,
    ].filter(Boolean);
  }

  if (currentView === "coaches") {
    return [
      root,
      { label: "Coaches", to: "/coaches" },
      pathname.startsWith("/coaches/") && selectedCoach?.id
        ? { label: selectedCoach.name ?? selectedCoach.id }
        : null,
    ].filter(Boolean);
  }

  if (currentView === "events") {
    return [
      root,
      { label: "Events", to: "/events" },
      pathname.startsWith("/events/") && selectedEvent?.id
        ? { label: selectedEvent.name ?? selectedEvent.id }
        : null,
    ].filter(Boolean);
  }

  if (currentView === "inventory") {
    return [
      root,
      { label: "Inventory", to: "/inventory" },
      pathname.startsWith("/inventory/") && selectedInventoryItem?.id
        ? { label: selectedInventoryItem.name ?? selectedInventoryItem.id }
        : null,
    ].filter(Boolean);
  }

  if (currentView === "facilities") {
    if (pathname.startsWith("/facilities/reservations/")) {
      return [
        root,
        { label: "Facilities", to: "/facilities" },
        { label: "Reservations", to: "/facilities" },
        selectedFacilityReservation?.id
          ? {
              label:
                selectedFacilityReservation.name ?? selectedFacilityReservation.id,
            }
          : null,
      ].filter(Boolean);
    }

    return [
      root,
      { label: "Facilities", to: "/facilities" },
      pathname.startsWith("/facilities/") && selectedFacility?.id
        ? { label: selectedFacility.name ?? selectedFacility.id }
        : null,
    ].filter(Boolean);
  }

  if (currentView === "reports") {
    return [root, { label: "Reports" }];
  }

  if (currentView === "settings") {
    return [root, { label: "Settings" }];
  }

  return [root];
}
