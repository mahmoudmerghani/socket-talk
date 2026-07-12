import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/api";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import { LoadingScreen } from "../../components/LoadingScreen/LoadingScreen";
import { EMAIL_FAILURE_GITHUB_CODE } from "@socket-talk/shared/endpoints.js";
import "./GithubPendingSignupPage.css";

function ErrorMessage({ message }: { message: string }) {
    return <p className="error-message">{message}</p>;
}

export function GithubPendingSignupPage() {
    const navigate = useNavigate();
    const { setAuthenticatedUser } = useAuth();

    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [isEmailReadOnly, setIsEmailReadOnly] = useState(false);

    useEffect(() => {
        const fetchPendingInfo = async () => {
            setErrorMessage("");
            const response = await api("/auth/github/pending-signup", {
                method: "GET",
            });

            if ("error" in response) {
                console.error(response);
                navigate("/auth", { replace: true });
                return;
            }

            if (response) {
                setUsername(response.username || "");
                setDisplayName(response.displayName || "");
                setEmail(response.email || "");
                setIsEmailReadOnly(response.email !== null);
            }
            setIsLoadingInitial(false);
        };

        void fetchPendingInfo();
    }, []);

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        setIsLoadingSubmit(true);
        setErrorMessage("");

        const response = await api("/auth/github/pending-signup", {
            method: "POST",
            body: {
                username: username.trim(),
                displayName: displayName.trim(),
                email: email.trim() || undefined,
            },
        });

        if ("error" in response) {
            setErrorMessage(response.error);
            setIsLoadingSubmit(false);

            if (response.code === EMAIL_FAILURE_GITHUB_CODE) {
                setIsEmailReadOnly(false);
                setEmail("");
            }
            
            return;
        }

        setAuthenticatedUser(response);
        setIsLoadingSubmit(false);
        navigate("/profile/avatar", { replace: true });
    };

    if (isLoadingInitial) {
        return <LoadingScreen />;
    }

    return (
        <section className="github-pending-signup-page" aria-label="Complete GitHub Signup">
            <div className="github-pending-signup-page__brand">
                <BrandLogo />
            </div>

            <div className="github-pending-signup-panel">
                <h1>Complete Signup</h1>
                <p className="subtitle">Please review and complete your profile details</p>

                {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

                <form className="github-pending-signup-form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        autoComplete="username"
                        placeholder="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                        disabled={isLoadingSubmit}
                    />

                    <label htmlFor="displayName">Display name</label>
                    <input
                        id="displayName"
                        type="text"
                        autoComplete="name"
                        placeholder="Your Name"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        required
                        disabled={isLoadingSubmit}
                    />

                    <label htmlFor="email">
                        Email {isEmailReadOnly ? "" : <span className="field-optional">(optional)</span>}
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        readOnly={isEmailReadOnly}
                        disabled={isLoadingSubmit}
                        className={isEmailReadOnly ? "input-readonly" : ""}
                    />

                    <button type="submit" disabled={isLoadingSubmit}>
                        {isLoadingSubmit ? "Completing..." : "Complete Signup"}
                    </button>
                </form>
            </div>
        </section>
    );
}
