import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children, requiredRole }) {
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <h2>Access Denied</h2>;
  return children;
}
