import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../lib/auth';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
