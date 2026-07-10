import "./LoadingScreen.css";

export function LoadingScreen() {
    return (
        <section className="loading-screen" aria-label="Loading screen" aria-live="polite">
            <div className="loading-screen__spinner" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
        </section>
    );
}