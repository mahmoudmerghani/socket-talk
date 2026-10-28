import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import "./CreateGroupPage.css";

export function CreateGroupPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = name.trim();
        if (!trimmed || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        const response = await api("/groups", {
            method: "POST",
            body: { name: trimmed },
        });

        if ("error" in response) {
            setError(response.error);
            setIsSubmitting(false);
            return;
        }

        // Navigate to home and open the newly created group conversation
        navigate("/", {
            replace: true,
            state: {
                targetConversationId: response.conversation.id,
            },
        });
    };

    return (
        <div className="create-group-page" aria-label="Create a group">
            <header className="create-group-header">
                <div className="create-group-header-inner">
                    <div className="create-group-header-left">
                        <Link
                            to="/groups"
                            className="create-group-back-btn"
                            aria-label="Back to groups"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            <span>Back to Groups</span>
                        </Link>
                    </div>

                    <div className="create-group-header-brand">
                        <BrandLogo />
                    </div>
                </div>
            </header>

            <main className="create-group-main">
                <div className="create-group-container">
                    <div className="create-group-icon-wrap">
                        <div className="create-group-icon">
                            <svg
                                viewBox="0 0 24 24"
                                width="30"
                                height="30"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                        </div>
                    </div>

                    <div className="create-group-title-section">
                        <h1>Create a Group</h1>
                        <p className="create-group-subtitle">
                            Start a new community where people can chat together
                        </p>
                    </div>

                    <form
                        className="create-group-form"
                        onSubmit={(e) => void handleSubmit(e)}
                        noValidate
                    >
                        {error && (
                            <div className="create-group-error" role="alert">
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="create-group-field">
                            <label
                                htmlFor="group-name"
                                className="create-group-label"
                            >
                                Group Name
                            </label>
                            <input
                                id="group-name"
                                type="text"
                                className="create-group-input"
                                placeholder="e.g. Design Team, Book Club..."
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (error) setError(null);
                                }}
                                maxLength={80}
                                autoFocus
                                disabled={isSubmitting}
                                autoComplete="off"
                            />
                            <span className="create-group-char-count">
                                {name.length}/80
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="create-group-submit-btn"
                            disabled={!name.trim() || isSubmitting}
                            id="create-group-submit"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="create-group-btn-spinner" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="17"
                                        height="17"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <line x1="19" y1="8" x2="19" y2="14" />
                                        <line x1="22" y1="11" x2="16" y2="11" />
                                    </svg>
                                    <span>Create Group</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
