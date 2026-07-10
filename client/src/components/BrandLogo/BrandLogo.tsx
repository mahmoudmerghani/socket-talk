import "./BrandLogo.css";

export function BrandLogo() {
    return (
        <div className="brand-logo" aria-label="Socket Talk">
            <span className="brand-logo__word">Socket</span>
            <span className="brand-logo__equals" aria-hidden="true">
                <span />
                <span />
            </span>
            <span className="brand-logo__word">Talk</span>
        </div>
    );
}
