import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { AthletesView } from "./features/athletes/AthletesView";
import { InventoryHub } from "./features/inventory/InventoryHub";
import { FacilitiesView } from "./features/facilities/FacilitiesView";
import { SettingsView } from "./features/settings/SettingsView";
import {
  NavigationProvider,
  useNavigation,
} from "./contexts/NavigationContext";

function AppContent() {
  const { currentView } = useNavigation();

  return (
    <DashboardLayout>
      {currentView === "dashboard" && <Dashboard />}
      {currentView === "athletes" && <AthletesView />}
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
