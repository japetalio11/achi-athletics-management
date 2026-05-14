/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavigationContext = createContext(null);

const viewRoutes = {
  landing: "/",
  dashboard: "/dashboard",
  athletes: "/athletes",
  coaches: "/coaches",
  events: "/events",
  inventory: "/inventory",
  facilities: "/facilities",
  reports: "/reports",
  settings: "/settings",
  login: "/login",
  register: "/register",
  "forgot-password": "/forgot-password",
  "reset-password": "/reset-password",
  "verification-success": "/verification-success",
  unauthorized: "/unauthorized",
  "not-found": "/not-found",
};

const authViews = new Set([
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verification-success",
]);

function decodeRouteSegment(value) {
  return value ? decodeURIComponent(value) : "";
}

function getCurrentView(pathname) {
  if (pathname === "/") return "landing";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname.startsWith("/athletes")) return "athletes";
  if (pathname.startsWith("/coaches")) return "coaches";
  if (pathname.startsWith("/events")) return "events";
  if (pathname.startsWith("/inventory")) return "inventory";
  if (pathname.startsWith("/facilities")) return "facilities";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname === "/login") return "login";
  if (pathname === "/register") return "register";
  if (pathname === "/forgot-password") return "forgot-password";
  if (pathname === "/reset-password") return "reset-password";
  if (pathname === "/verification-success") return "verification-success";
  if (pathname === "/unauthorized") return "unauthorized";
  if (pathname === "/not-found") return "not-found";
  return null;
}

function buildRouteSelection(pathname, prefix, fallbackName) {
  const match = pathname.match(new RegExp(`^${prefix}/([^/]+)$`));
  if (!match) return null;

  return {
    id: decodeRouteSegment(match[1]),
    name: fallbackName,
    initialTab: "overview",
  };
}

export function NavigationProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const currentView = getCurrentView(pathname);

  const [athleteMeta, setAthleteMeta] = useState(() =>
    buildRouteSelection(window.location.pathname, "/athletes", "Athlete Details"),
  );
  const [coachMeta, setCoachMeta] = useState(() =>
    buildRouteSelection(window.location.pathname, "/coaches", "Coach Details"),
  );
  const [eventMeta, setEventMeta] = useState(() =>
    buildRouteSelection(window.location.pathname, "/events", "Event Details"),
  );
  const [inventoryMeta, setInventoryMeta] = useState(() =>
    buildRouteSelection(window.location.pathname, "/inventory", "Inventory Item"),
  );
  const [facilityMeta, setFacilityMeta] = useState(() =>
    buildRouteSelection(window.location.pathname, "/facilities", "Facility Details"),
  );
  const [facilityReservationMeta, setFacilityReservationMeta] = useState(() =>
    buildRouteSelection(
      window.location.pathname,
      "/facilities/reservations",
      "Reservation Details",
    ),
  );

  const selectedAthlete = useMemo(() => {
    const routeSelection = buildRouteSelection(pathname, "/athletes", "Athlete Details");
    if (!routeSelection) return null;
    if (!athleteMeta || athleteMeta.id !== routeSelection.id) return routeSelection;
    return { ...routeSelection, ...athleteMeta };
  }, [athleteMeta, pathname]);

  const selectedCoach = useMemo(() => {
    const routeSelection = buildRouteSelection(pathname, "/coaches", "Coach Details");
    if (!routeSelection) return null;
    if (!coachMeta || coachMeta.id !== routeSelection.id) return routeSelection;
    return { ...routeSelection, ...coachMeta };
  }, [coachMeta, pathname]);

  const selectedEvent = useMemo(() => {
    const routeSelection = buildRouteSelection(pathname, "/events", "Event Details");
    if (!routeSelection) return null;
    if (!eventMeta || eventMeta.id !== routeSelection.id) return routeSelection;
    return { ...routeSelection, ...eventMeta };
  }, [eventMeta, pathname]);

  const selectedInventoryItem = useMemo(() => {
    const routeSelection = buildRouteSelection(pathname, "/inventory", "Inventory Item");
    if (!routeSelection) return null;
    if (!inventoryMeta || inventoryMeta.id !== routeSelection.id) return routeSelection;
    return { ...routeSelection, ...inventoryMeta };
  }, [inventoryMeta, pathname]);

  const selectedFacility = useMemo(() => {
    if (pathname.startsWith("/facilities/reservations/")) return null;
    const routeSelection = buildRouteSelection(pathname, "/facilities", "Facility Details");
    if (!routeSelection) return null;
    if (!facilityMeta || facilityMeta.id !== routeSelection.id) return routeSelection;
    return { ...routeSelection, ...facilityMeta };
  }, [facilityMeta, pathname]);

  const selectedFacilityReservation = useMemo(() => {
    const routeSelection = buildRouteSelection(
      pathname,
      "/facilities/reservations",
      "Reservation Details",
    );
    if (!routeSelection) return null;
    if (
      !facilityReservationMeta ||
      facilityReservationMeta.id !== routeSelection.id
    ) {
      return routeSelection;
    }
    return { ...routeSelection, ...facilityReservationMeta };
  }, [facilityReservationMeta, pathname]);

  const navigateTo = useCallback((view) => {
    navigate(viewRoutes[view] ?? "/");
  }, [navigate]);

  const setSelectedAthlete = useCallback((nextAthlete) => {
    if (!nextAthlete?.id) {
      setAthleteMeta(null);
      navigate(viewRoutes.athletes);
      return;
    }

    const normalized = {
      id: nextAthlete.id,
      name: nextAthlete.name ?? selectedAthlete?.name ?? "Athlete Details",
      initialTab: nextAthlete.initialTab ?? selectedAthlete?.initialTab ?? "overview",
    };

    setAthleteMeta(normalized);
    navigate(`/athletes/${encodeURIComponent(nextAthlete.id)}`);
  }, [navigate, selectedAthlete]);

  const setSelectedCoach = useCallback((nextCoach) => {
    if (!nextCoach?.id) {
      setCoachMeta(null);
      navigate(viewRoutes.coaches);
      return;
    }

    const normalized = {
      id: nextCoach.id,
      name: nextCoach.name ?? selectedCoach?.name ?? "Coach Details",
      initialTab: nextCoach.initialTab ?? selectedCoach?.initialTab ?? "overview",
    };

    setCoachMeta(normalized);
    navigate(`/coaches/${encodeURIComponent(nextCoach.id)}`);
  }, [navigate, selectedCoach]);

  const setSelectedEvent = useCallback((nextEvent) => {
    if (!nextEvent?.id) {
      setEventMeta(null);
      navigate(viewRoutes.events);
      return;
    }

    const normalized = {
      id: nextEvent.id,
      name: nextEvent.name ?? selectedEvent?.name ?? "Event Details",
      initialTab: nextEvent.initialTab ?? selectedEvent?.initialTab ?? "overview",
    };

    setEventMeta(normalized);
    navigate(`/events/${encodeURIComponent(nextEvent.id)}`);
  }, [navigate, selectedEvent]);

  const setSelectedInventoryItem = useCallback((nextItem) => {
    if (!nextItem?.id) {
      setInventoryMeta(null);
      navigate(viewRoutes.inventory);
      return;
    }

    const normalized = {
      id: nextItem.id,
      name: nextItem.name ?? selectedInventoryItem?.name ?? "Inventory Item",
      initialTab:
        nextItem.initialTab ?? selectedInventoryItem?.initialTab ?? "overview",
    };

    setInventoryMeta(normalized);
    navigate(`/inventory/${encodeURIComponent(nextItem.id)}`);
  }, [navigate, selectedInventoryItem]);

  const setSelectedFacility = useCallback((nextFacility) => {
    if (!nextFacility?.id) {
      setFacilityMeta(null);
      navigate(viewRoutes.facilities);
      return;
    }

    const normalized = {
      id: nextFacility.id,
      name: nextFacility.name ?? selectedFacility?.name ?? "Facility Details",
      initialTab: nextFacility.initialTab ?? selectedFacility?.initialTab ?? "overview",
    };

    setFacilityReservationMeta(null);
    setFacilityMeta(normalized);
    navigate(`/facilities/${encodeURIComponent(nextFacility.id)}`);
  }, [navigate, selectedFacility]);

  const setSelectedFacilityReservation = useCallback((nextReservation) => {
    if (!nextReservation?.id) {
      setFacilityReservationMeta(null);
      navigate(viewRoutes.facilities);
      return;
    }

    const normalized = {
      id: nextReservation.id,
      name:
        nextReservation.name ??
        selectedFacilityReservation?.name ??
        "Reservation Details",
      initialTab:
        nextReservation.initialTab ??
        selectedFacilityReservation?.initialTab ??
        "overview",
    };

    setFacilityMeta(null);
    setFacilityReservationMeta(normalized);
    navigate(`/facilities/reservations/${encodeURIComponent(nextReservation.id)}`);
  }, [navigate, selectedFacilityReservation]);

  const value = useMemo(
    () => ({
      currentView,
      navigateTo,
      selectedAthlete,
      setSelectedAthlete,
      selectAthlete: setSelectedAthlete,
      clearSelectedAthlete: () => setSelectedAthlete(null),
      selectedCoach,
      setSelectedCoach,
      selectCoach: setSelectedCoach,
      clearSelectedCoach: () => setSelectedCoach(null),
      selectedEvent,
      setSelectedEvent,
      selectEvent: setSelectedEvent,
      clearSelectedEvent: () => setSelectedEvent(null),
      selectedInventoryItem,
      setSelectedInventoryItem,
      selectInventoryItem: setSelectedInventoryItem,
      clearSelectedInventoryItem: () => setSelectedInventoryItem(null),
      selectedFacility,
      setSelectedFacility,
      selectFacility: setSelectedFacility,
      clearSelectedFacility: () => setSelectedFacility(null),
      selectedFacilityReservation,
      setSelectedFacilityReservation,
      selectFacilityReservation: setSelectedFacilityReservation,
      clearSelectedFacilityReservation: () => setSelectedFacilityReservation(null),
      isAuthView: authViews.has(currentView),
    }),
    [
      currentView,
      navigateTo,
      selectedAthlete,
      selectedCoach,
      selectedEvent,
      selectedFacility,
      selectedFacilityReservation,
      selectedInventoryItem,
      setSelectedAthlete,
      setSelectedCoach,
      setSelectedEvent,
      setSelectedFacility,
      setSelectedFacilityReservation,
      setSelectedInventoryItem,
    ],
  );

  return (
    <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider.");
  }

  return context;
}
