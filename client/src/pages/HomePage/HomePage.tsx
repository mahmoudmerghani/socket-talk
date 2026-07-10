import { useAuth } from "../../auth/AuthContext";
import "./HomePage.css";

export function HomePage() {
    const { clearAuthenticatedUser } = useAuth();

    return (
        <section className="home-page" aria-label="Home page">
            <div className="home-panel">
                <h1>Home</h1>
                <p>You are signed in. Main home content can be added here next.</p>
                <button type="button" onClick={clearAuthenticatedUser}>
                    Sign Out
                </button>
            </div>
        </section>
    );
}
