import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import VehicleList from "../pages/Vehicles/VehicleList";
import DriverList from "../pages/Drivers/DriverList";
import TripList from "../pages/Trips/TripList";
import MaintenanceList from "../pages/Maintenance/MaintenanceList";
import FuelList from "../pages/Fuel/FuelList";
import ExpenseList from "../pages/Expenses/ExpenseList";
import DocumentList from "../pages/Documents/DocumentList";
import NotificationList from "../pages/Notifications/NotificationList";
import AuditLogList from "../pages/AuditLogs/AuditLogList";

import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/drivers" element={<DriverList />} />
          <Route path="/trips" element={<TripList />} />
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/fuel" element={<FuelList />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/notifications" element={<NotificationList />} />
          <Route path="/audit-logs" element={<AuditLogList />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
