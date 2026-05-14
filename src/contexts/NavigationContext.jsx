/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const NavigationContext = createContext();

const viewRoutes = {
  dashboard: "/",
  athletes: "/athletes",
  coaches: "/coaches",
  events: "/events",
  inventory: "/inventory",
  facilities: "/facilities",
  settings: "/settings",
  login: "/login",
  register: "/register",
  "forgot-password": "/forgot-password",
  "reset-password": "/reset-password",
  "verification-success": "/verification-success",
};

const routeViews = Object.fromEntries(
  Object.entries(viewRoutes).map(([view, route]) => [route, view]),
);

const authViews = new Set([
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verification-success",
]);

function getViewFromHash() {
  const hashRoute = window.location.hash.replace(/^#/, "") || "/";
  if (hashRoute.startsWith("/events/")) return "events";
  if (hashRoute.startsWith("/inventory/")) return "inventory";
  if (hashRoute.startsWith("/facilities/")) return "facilities";
  return routeViews[hashRoute] ?? "dashboard";
}

function getEventFromHash() {
  const hashRoute = window.location.hash.replace(/^#/, "") || "/";
  const match = hashRoute.match(/^\/events\/([^/]+)$/);
  return match ? { id: decodeURIComponent(match[1]), name: "Event Details", initialTab: "overview" } : null;
}

function getInventoryItemFromHash() {
  const hashRoute = window.location.hash.replace(/^#/, "") || "/";
  const match = hashRoute.match(/^\/inventory\/([^/]+)$/);
  return match ? { id: decodeURIComponent(match[1]), name: "Inventory Item", initialTab: "overview" } : null;
}

function getFacilityFromHash() {
  const hashRoute = window.location.hash.replace(/^#/, "") || "/";
  if (hashRoute.startsWith("/facilities/reservations/")) return null;
  const match = hashRoute.match(/^\/facilities\/([^/]+)$/);
  return match ? { id: decodeURIComponent(match[1]), name: "Facility Details", initialTab: "overview" } : null;
}

function getFacilityReservationFromHash() {
  const hashRoute = window.location.hash.replace(/^#/, "") || "/";
  const match = hashRoute.match(/^\/facilities\/reservations\/([^/]+)$/);
  return match ? { id: decodeURIComponent(match[1]), name: "Reservation Details", initialTab: "overview" } : null;
}

export function NavigationProvider({ children }) {
  const [currentView, setCurrentView] = useState(getViewFromHash);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(getEventFromHash);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(getInventoryItemFromHash);
  const [selectedFacility, setSelectedFacility] = useState(getFacilityFromHash);
  const [selectedFacilityReservation, setSelectedFacilityReservation] = useState(getFacilityReservationFromHash);

  const navigateTo = (view) => {
    setCurrentView(view);
    window.location.hash = viewRoutes[view] ?? "/";
    if (view !== "athletes") {
      setSelectedAthlete(null);
    }
    if (view !== "coaches") {
      setSelectedCoach(null);
    }
    if (view !== "events") {
      setSelectedEvent(null);
    }
    if (view !== "inventory") {
      setSelectedInventoryItem(null);
    }
    if (view !== "facilities") {
      setSelectedFacility(null);
      setSelectedFacilityReservation(null);
    }
  };

  const selectEvent = (event, initialTab = "overview") => {
    const nextEvent = { id: event.id, name: event.title ?? event.name ?? "Event Details", initialTab };
    setCurrentView("events");
    setSelectedEvent(nextEvent);
    window.location.hash = `/events/${encodeURIComponent(event.id)}`;
  };

  const clearSelectedEvent = () => {
    setSelectedEvent(null);
    setCurrentView("events");
    window.location.hash = viewRoutes.events;
  };

  const selectInventoryItem = (item, initialTab = "overview") => {
    const nextItem = { id: item.id, name: item.name ?? "Inventory Item", initialTab };
    setCurrentView("inventory");
    setSelectedInventoryItem(nextItem);
    window.location.hash = `/inventory/${encodeURIComponent(item.id)}`;
  };

  const clearSelectedInventoryItem = () => {
    setSelectedInventoryItem(null);
    setCurrentView("inventory");
    window.location.hash = viewRoutes.inventory;
  };

  const selectFacility = (facility, initialTab = "overview") => {
    const nextFacility = { id: facility.id, name: facility.name ?? "Facility Details", initialTab };
    setCurrentView("facilities");
    setSelectedFacility(nextFacility);
    setSelectedFacilityReservation(null);
    window.location.hash = `/facilities/${encodeURIComponent(facility.id)}`;
  };

  const clearSelectedFacility = () => {
    setSelectedFacility(null);
    setSelectedFacilityReservation(null);
    setCurrentView("facilities");
    window.location.hash = viewRoutes.facilities;
  };

  const selectFacilityReservation = (reservation, initialTab = "overview") => {
    const nextReservation = {
      id: reservation.id,
      name: reservation.activityName ?? reservation.purpose ?? "Reservation Details",
      initialTab,
    };
    setCurrentView("facilities");
    setSelectedFacilityReservation(nextReservation);
    setSelectedFacility(null);
    window.location.hash = `/facilities/reservations/${encodeURIComponent(reservation.id)}`;
  };

  const clearSelectedFacilityReservation = () => {
    setSelectedFacilityReservation(null);
    setSelectedFacility(null);
    setCurrentView("facilities");
    window.location.hash = viewRoutes.facilities;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const nextView = getViewFromHash();
      setCurrentView(nextView);
      if (nextView !== "athletes") {
        setSelectedAthlete(null);
      }
      if (nextView !== "coaches") {
        setSelectedCoach(null);
      }
      if (nextView === "events") {
        setSelectedEvent(getEventFromHash());
      } else {
        setSelectedEvent(null);
      }
      if (nextView === "inventory") {
        setSelectedInventoryItem(getInventoryItemFromHash());
      } else {
        setSelectedInventoryItem(null);
      }
      if (nextView === "facilities") {
        setSelectedFacility(getFacilityFromHash());
        setSelectedFacilityReservation(getFacilityReservationFromHash());
      } else {
        setSelectedFacility(null);
        setSelectedFacilityReservation(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        navigateTo,
        selectedAthlete,
        setSelectedAthlete,
        selectedCoach,
        setSelectedCoach,
        selectedEvent,
        setSelectedEvent,
        selectEvent,
        clearSelectedEvent,
        selectedInventoryItem,
        setSelectedInventoryItem,
        selectInventoryItem,
        clearSelectedInventoryItem,
        selectedFacility,
        setSelectedFacility,
        selectFacility,
        clearSelectedFacility,
        selectedFacilityReservation,
        setSelectedFacilityReservation,
        selectFacilityReservation,
        clearSelectedFacilityReservation,
        isAuthView: authViews.has(currentView),
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
