import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { AthletesView } from "./features/athletes/AthletesView";
import { CoachesView } from "./features/coaches/CoachesView";
import { EventsView } from "./features/events/EventsView";
import { InventoryHub } from "./features/inventory/InventoryHub";
import { FacilitiesView } from "./features/facilities/FacilitiesView";
import { SettingsView } from "./features/settings/SettingsView";
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  VerificationSuccessPage,
} from "./features/auth/AuthPages";
import { LandingPage } from "./features/public/LandingPage";
import { PublicEventsPage } from "./features/public/PublicEventsPage";
import { PublicFacilityRequestPage } from "./features/public/PublicFacilityRequestPage";
import { PublicItemRequestPage } from "./features/public/PublicItemRequestPage";
import { ReportsPage } from "./features/system/ReportsPage";
import { NotFoundPage, UnauthorizedPage } from "./features/system/RouteStatusPages";
import { useAuth } from "./contexts/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function ProtectedLayout() {
  return <DashboardLayout />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/public/events" element={<PublicEventsPage />} />
      <Route path="/public/facility-request" element={<PublicFacilityRequestPage />} />
      <Route path="/public/item-request" element={<PublicItemRequestPage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verification-success" element={<VerificationSuccessPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/athletes" element={<AthletesView />} />
          <Route path="/athletes/:athleteId" element={<AthletesView />} />
          <Route path="/coaches" element={<CoachesView />} />
          <Route path="/coaches/:coachId" element={<CoachesView />} />
          <Route path="/events" element={<EventsView />} />
          <Route path="/events/:eventId" element={<EventsView />} />
          <Route path="/inventory" element={<InventoryHub />} />
          <Route path="/inventory/:itemId" element={<InventoryHub />} />
          <Route path="/facilities" element={<FacilitiesView />} />
          <Route path="/facilities/:facilityId" element={<FacilitiesView />} />
          <Route
            path="/facilities/reservations/:reservationId"
            element={<FacilitiesView />}
          />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsView />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}

export default App;
