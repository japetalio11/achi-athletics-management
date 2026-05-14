/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const NavigationContext = createContext();

const viewRoutes = {
  dashboard: "/",
  athletes: "/athletes",
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
  return routeViews[hashRoute] ?? "dashboard";
}

export function NavigationProvider({ children }) {
  const [currentView, setCurrentView] = useState(getViewFromHash);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const navigateTo = (view) => {
    setCurrentView(view);
    window.location.hash = viewRoutes[view] ?? "/";
    if (view !== "athletes") {
      setSelectedAthlete(null);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const nextView = getViewFromHash();
      setCurrentView(nextView);
      if (nextView !== "athletes") {
        setSelectedAthlete(null);
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
