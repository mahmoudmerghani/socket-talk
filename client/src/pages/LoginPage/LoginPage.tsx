import { useState } from "react";
import type { SubmitEvent } from "react";
import "./LoginPage.css";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        // API wiring will be added when backend auth endpoint contract is finalized.
        console.log("Login payload:", { identifier, password, apiBaseUrl });
    };

    return (
        <section className="login-page" aria-label="Login page">
            <div className="login-panel">
                <div className="brand-chip" aria-hidden="true">
                    ST
                </div>

                <h1>Socket Talk</h1>
                <p className="subtitle">Sign in to continue chatting</p>

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

                    <button type="submit">Sign In</button>
                </form>

            </div>
        </section>
    );
}
