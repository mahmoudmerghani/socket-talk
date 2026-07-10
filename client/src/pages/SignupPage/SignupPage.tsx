import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/api";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import "./SignupPage.css";

function LoadingText() {
    return <span className="loading-text">Creating account...</span>;
}

function ErrorMessage({ message }: { message: string }) {
    return <p className="error-message">{message}</p>;
}

export function SignupPage() {
    const navigate = useNavigate();
    const { setAuthenticatedUser } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        const trimmedPassword = password.trim();
        const trimmedPasswordConfirm = passwordConfirm.trim();

        if (trimmedPassword !== trimmedPasswordConfirm) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setErrorMessage("");
        setIsLoading(true);

        const response = await api("/auth/signup", {
            method: "POST",
            body: {
                displayName: displayName.trim(),
                username: username.trim(),
                email: email.trim() || undefined,
                password: trimmedPassword,
                passwordConfirm: trimmedPasswordConfirm,
            },
        });

        if ("error" in response) {
            setErrorMessage(response.error);
            setIsLoading(false);
            return;
        }

        setAuthenticatedUser(response);
        setIsLoading(false);
        navigate("/profile/avatar", { replace: true });
    };

    return (
        <section className="signup-page" aria-label="Signup page">
            <div className="signup-page__brand">
                <BrandLogo />
            </div>

            <div className="signup-panel">

                <h1>Create your account</h1>
                <p className="subtitle">Create your account to start chatting</p>

                {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

                <form className="signup-form" onSubmit={handleSubmit}>
                    <label htmlFor="displayName">Display name</label>
                    <input
                        id="displayName"
                        type="text"
                        autoComplete="name"
                        placeholder="Socket Talk"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        required
                    />

                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        autoComplete="username"
                        placeholder="sockettalk"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />

                    <label htmlFor="email">Email <span className="field-optional">(optional)</span></label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    <label htmlFor="passwordConfirm">Confirm password</label>
                    <input
                        id="passwordConfirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        value={passwordConfirm}
                        onChange={(event) => setPasswordConfirm(event.target.value)}
                        required
                    />

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? <LoadingText /> : "Create Account"}
                    </button>
                </form>

                <Link to="/auth" className="login-link">
                    Back to Home
                </Link>
            </div>
        </section>
    );
}
