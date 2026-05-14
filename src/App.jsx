import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { AthletesView } from "./features/athletes/AthletesView";
import { CoachesView } from "./features/coaches/CoachesView";
import { EventsView } from "./features/events/EventsView";
import { InventoryHub } from "./features/inventory/InventoryHub";
import { FacilitiesView } from "./features/facilities/FacilitiesView";
import { SettingsView } from "./features/settings/SettingsView";
import { AuthView } from "./features/auth/AuthPages";
import {
  NavigationProvider,
  useNavigation,
} from "./contexts/NavigationContext";

function AppContent() {
  const { currentView, isAuthView } = useNavigation();

  if (isAuthView) {
    return <AuthView view={currentView} />;
  }

  return (
    <DashboardLayout>
      {currentView === "dashboard" && <Dashboard />}
      {currentView === "athletes" && <AthletesView />}
      {currentView === "coaches" && <CoachesView />}
      {currentView === "events" && <EventsView />}
      {currentView === "inventory" && <InventoryHub />}
      {currentView === "facilities" && <FacilitiesView />}
      {currentView === "settings" && <SettingsView />}
    </DashboardLayout>
  );
}

function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}

export default App;
