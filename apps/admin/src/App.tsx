import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ModulePlaceholder } from './pages/ModulePlaceholder';
import { ProductsListPage } from './pages/products/ProductsListPage';
import { ProductFormPage } from './pages/products/ProductFormPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SubcategoriesPage } from './pages/SubcategoriesPage';
import { BrandsPage } from './pages/BrandsPage';
import { OrdersPage } from './pages/OrdersPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { LeadsPage } from './pages/LeadsPage';
import { QuoteRequestsPage } from './pages/QuoteRequestsPage';
import { CustomersPage } from './pages/CustomersPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsListPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="subcategories" element={<SubcategoriesPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="quote-requests" element={<QuoteRequestsPage />} />
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
