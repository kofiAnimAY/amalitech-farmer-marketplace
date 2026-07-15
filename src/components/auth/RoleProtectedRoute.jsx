import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../common/LoadingSpinner';

/**
 * @param {string[]} [allowedRoles] - if omitted, any authenticated user passes.
 */
export default function RoleProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const home = user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
