import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ProjectList from './components/admin/ProjectList';
import ProjectWizard from './components/admin/ProjectWizard';
import ProjectDetail from './components/admin/ProjectDetail';
import ClientList from './components/admin/ClientList';
import ProductList from './components/admin/ProductList';
import ProductEditor from './components/admin/ProductEditor';
import AIProductGenerator from './components/admin/AIProductGenerator';
import EmployeeList from './components/admin/EmployeeList';
import ClientLayout from './components/client/ClientLayout';
import ClientDashboard from './components/client/ClientDashboard';
import ClientSettings from './components/client/ClientSettings';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/new" element={<ProjectWizard />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductEditor />} />
            <Route path="products/ai" element={<AIProductGenerator />} />
            <Route path="products/:id" element={<ProductEditor />} />
            <Route path="team" element={<EmployeeList />} />
          </Route>

          {/* Client Routes */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="settings" element={<ClientSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
