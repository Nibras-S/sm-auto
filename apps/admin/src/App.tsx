import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ModulePlaceholder } from './pages/ModulePlaceholder';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ModulePlaceholder title="Products" />} />
          <Route path="inventory" element={<ModulePlaceholder title="Inventory" />} />
          <Route path="orders" element={<ModulePlaceholder title="Orders" />} />
          <Route path="customers" element={<ModulePlaceholder title="Customers" />} />
          <Route path="inquiries" element={<ModulePlaceholder title="Inquiries" />} />
          <Route path="quote-requests" element={<ModulePlaceholder title="Quote Requests" />} />
          <Route path="quotations" element={<ModulePlaceholder title="Quotations" />} />
          <Route path="banners" element={<ModulePlaceholder title="Banners" />} />
          <Route path="content" element={<ModulePlaceholder title="Content" />} />
          <Route path="faq" element={<ModulePlaceholder title="FAQ" />} />
          <Route path="reports" element={<ModulePlaceholder title="Reports" />} />
          <Route path="users" element={<ModulePlaceholder title="Users & Roles" />} />
          <Route path="settings" element={<ModulePlaceholder title="Settings" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
