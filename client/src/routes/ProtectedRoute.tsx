import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { LoadingScreen } from "../components/LoadingScreen/LoadingScreen";

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, isAuthDone } = useAuth();

    if (!isAuthDone) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}
