import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@socket-talk/shared/endpoints.js";
import { addResponseHandler, api, removeResponseHandler } from "../api/api";

type AuthUser = User;

type AuthContextValue = {
    user: AuthUser | null;
    isAuthDone: boolean;
    setAuthenticatedUser: (user: AuthUser) => void;
    clearAuthenticatedUser: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthDone, setIsAuthDone] = useState(false);

    const setAuthenticatedUser = (nextUser: AuthUser) => {
        setUser(nextUser);
    };

    const clearAuthenticatedUser = () => {
        setUser(null);
    };

    useEffect(() => {
        const clearFromUnauthorized = () => {
            setUser(null);
            setIsAuthDone(true);
        };

        const responseHandler = (res: Response) => {
            if (res.status === 401) {
                clearFromUnauthorized();
            }
        };

        addResponseHandler(responseHandler);

        const bootstrapAuth = async () => {
            const response = await api("/auth/me", {
                method: "GET",
            });

            if ("error" in response) {
                setUser(null);
                setIsAuthDone(true);
                return;
            }

            setUser(response);
            setIsAuthDone(true);
        };

        void bootstrapAuth();

        return () => {
            removeResponseHandler(responseHandler);
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthDone,
                setAuthenticatedUser,
                clearAuthenticatedUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}

export type { AuthUser };
