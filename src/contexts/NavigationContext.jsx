import { createContext, useContext, useState } from "react";

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard', 'athletes'
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (view !== "athletes") {
      setSelectedAthlete(null);
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        navigateTo,
        selectedAthlete,
        setSelectedAthlete,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
