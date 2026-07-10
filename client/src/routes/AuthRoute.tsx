import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { LoadingScreen } from "../components/LoadingScreen/LoadingScreen";

type AuthRouteProps = {
    children: ReactNode;
    authenticatedRedirectTo?: string;
};

export function AuthRoute({
    children,
    authenticatedRedirectTo = "/",
}: AuthRouteProps) {
    const { user, isAuthDone } = useAuth();

    if (!isAuthDone) {
        return <LoadingScreen />;
    }

    if (user) {
        return <Navigate to={authenticatedRedirectTo} replace />;
    }

    return children;
}
