import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { HotelsPage } from './features/hotels/HotelsPage';
import { RoomsPage } from './features/rooms/RoomsPage';
import { AmenitiesPage } from './features/amenities/AmenitiesPage';
import { BookingsPage } from './features/bookings/BookingsPage';
import { CouponsPage } from './features/coupons/CouponsPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { PaymentSettingsPage } from './features/settings/PaymentSettingsPage';

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/hotels" element={<HotelsPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/amenities" element={<AmenitiesPage />} />
                <Route path="/coupons" element={<CouponsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/payment-settings" element={<PaymentSettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

