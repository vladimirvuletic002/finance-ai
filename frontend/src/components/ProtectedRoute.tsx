import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

// Wraps routes that require authentication. If the user is not logged in
// (no valid, unexpired token), redirect to the login page.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
