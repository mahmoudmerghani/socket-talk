import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { HomePage } from "./pages/HomePage/HomePage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { ProfileAvatarPage } from "./pages/ProfileAvatarPage/ProfileAvatarPage";
import { SignupPage } from "./pages/SignupPage/SignupPage";
import { GithubPendingSignupPage } from "./pages/GithubPendingSignupPage/GithubPendingSignupPage";
import { AuthRoute } from "./routes/AuthRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import "./App.css";

function App() {
    return (
        <main className="app-shell">
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/auth"
                    element={
                        <AuthRoute>
                            <LandingPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/auth/login"
                    element={
                        <AuthRoute>
                            <LoginPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/auth/signup"
                    element={
                        <AuthRoute authenticatedRedirectTo="/profile/avatar">
                            <SignupPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/auth/github/pending-signup"
                    element={
                        <AuthRoute authenticatedRedirectTo="/profile/avatar">
                            <GithubPendingSignupPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/profile/avatar"
                    element={
                        <ProtectedRoute>
                            <ProfileAvatarPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        </main>
    );
}

export default App;
