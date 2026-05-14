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
  return routeViews[hashRoute] ?? "dashboard";
}

function getEventFromHash() {
  const hashRoute = window.location.hash.replace(/^#/, "") || "/";
  const match = hashRoute.match(/^\/events\/([^/]+)$/);
  return match ? { id: decodeURIComponent(match[1]), name: "Event Details", initialTab: "overview" } : null;
}

export function NavigationProvider({ children }) {
  const [currentView, setCurrentView] = useState(getViewFromHash);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(getEventFromHash);

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
