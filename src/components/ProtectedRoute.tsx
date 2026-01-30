import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types/index';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { state } = useApp();

  if (!state.currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(state.currentUser.role)) {
    // Redirect to appropriate dashboard based on role
    if (state.currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/client" replace />;
    }
  }

  return <>{children}</>;
}
