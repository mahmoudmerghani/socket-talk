import { Link } from "react-router-dom";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import "./LandingPage.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function LandingPage() {
    return (
        <section className="landing-page" aria-label="Landing page">
            <div className="landing-page__brand">
                <BrandLogo />
            </div>

            <div className="landing-panel">

                <h1>Welcome to Socket Talk</h1>
                <p className="subtitle">Choose how you want to continue</p>

                <div className="landing-actions">
                    <Link to="/auth/login" className="action-button primary">
                        Login
                    </Link>

                    <Link to="/auth/signup" className="action-button">
                        Signup
                    </Link>

                    <a href={`${apiUrl}/auth/github`} className="action-button github">
                        <svg
                            className="github-icon"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path
                                fill="currentColor"
                                d="M8 0C3.58 0 0 3.67 0 8.2c0 3.63 2.29 6.71 5.47 7.8.4.08.55-.18.55-.39 0-.2-.01-.85-.01-1.54-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.97-.82-1.17-.28-.16-.68-.57-.01-.58.63-.01 1.08.59 1.23.83.72 1.23 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.92-3.64-4.07 0-.9.31-1.64.82-2.22-.08-.21-.36-1.05.08-2.18 0 0 .67-.22 2.2.85a7.36 7.36 0 0 1 4 0c1.53-1.07 2.2-.85 2.2-.85.44 1.13.16 1.97.08 2.18.51.58.82 1.31.82 2.22 0 3.16-1.87 3.86-3.65 4.07.29.25.54.74.54 1.5 0 1.08-.01 1.94-.01 2.21 0 .21.15.47.55.39A8.25 8.25 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"
                            />
                        </svg>
                        Continue with GitHub
                    </a>
                </div>
            </div>
        </section>
    );
}
