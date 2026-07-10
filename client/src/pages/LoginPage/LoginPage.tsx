import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/api";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import "./LoginPage.css";

function LoadingText() {
    return <span className="loading-text">Signing in...</span>;
}

function ErrorMessage({ message }: { message: string }) {
    return <p className="error-message">{message}</p>;
}

export function LoginPage() {
    const navigate = useNavigate();
    const { setAuthenticatedUser } = useAuth();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        setErrorMessage("");
        setIsLoading(true);

        const response = await api("/auth/login", {
            method: "POST",
            body: {
                identifier,
                password,
            },
        });

        if ("error" in response) {
            setErrorMessage(response.error);
            setIsLoading(false);
            return;
        }

        setAuthenticatedUser(response);
        setIsLoading(false);
        navigate("/", { replace: true });
    };

    return (
        <section className="login-page" aria-label="Login page">
            <div className="login-page__brand">
                <BrandLogo />
            </div>

            <div className="login-panel">

                <h1>Socket Talk</h1>
                <p className="subtitle">Sign in to continue chatting</p>

                {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="identifier">Email or username</label>
                    <input
                        id="identifier"
                        type="text"
                        autoComplete="username"
                        placeholder="you@example.com"
                        value={identifier}
                        onChange={(event) => setIdentifier(event.target.value)}
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? <LoadingText /> : "Sign In"}
                    </button>
                </form>

                <Link to="/auth" className="home-link">
                    Back to Home
                </Link>
            </div>
        </section>
    );
}
