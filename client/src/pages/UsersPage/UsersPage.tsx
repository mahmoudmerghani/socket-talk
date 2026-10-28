import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/api";
import { Avatar } from "../../components/Avatar/Avatar";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import "./UsersPage.css";

export type UserListItem = {
    id: number;
    username: string;
    displayName: string;
    avatarColor: string;
    avatarUrl: string | null;
};

export function UsersPage() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);

        const response = (await api("/users", {
            method: "GET",
        }));

        if ("error" in response) {
            setError(response.error);
            setIsLoading(false);
            return;
        }

        setUsers(response);
        setIsLoading(false);
    };

    useEffect(() => {
        void fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return users;

        return users.filter(
            (u) =>
                u.displayName.toLowerCase().includes(query) ||
                u.username.toLowerCase().includes(query),
        );
    }, [users, searchQuery]);

    const handleStartChat = (targetUser: UserListItem) => {
        navigate("/", {
            state: {
                targetUser: {
                    id: targetUser.id,
                    username: targetUser.username,
                    displayName: targetUser.displayName,
                    avatarColor: targetUser.avatarColor,
                    avatarUrl: targetUser.avatarUrl,
                },
            },
        });
    };

    return (
        <div className="users-page" aria-label="Chat with other people">
            <header className="users-page-header">
                <div className="users-header-inner">
                    <div className="users-header-left">
                        <Link
                            to="/"
                            className="users-back-btn"
                            title="Back to chats"
                            aria-label="Back to chats"
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
                            <span>Back to Chats</span>
                        </Link>
                    </div>

                    <div className="users-header-brand">
                        <BrandLogo />
                    </div>
                </div>
            </header>

            <main className="users-page-main">
                <div className="users-container">
                    <div className="users-title-section">
                        <h1>Chat with Other People</h1>
                        <p className="users-subtitle">
                            Connect with community members and start a direct conversation
                        </p>
                    </div>

                    <div className="users-search-bar">
                        <div className="users-search-input-wrapper">
                            <svg
                                className="users-search-icon"
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                className="users-search-input"
                                placeholder="Search by name or username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    className="users-search-clear"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            ) : null}
                        </div>
                        {!isLoading && !error && (
                            <div className="users-count-tag">
                                {filteredUsers.length}{" "}
                                {filteredUsers.length === 1 ? "person" : "people"}
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="users-loading-state">
                            <div className="users-loading-spinner" />
                            <p>Loading community members...</p>
                        </div>
                    ) : error ? (
                        <div className="users-error-state">
                            <div className="users-error-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    width="32"
                                    height="32"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            <h3>Failed to load people</h3>
                            <p>{error}</p>
                            <button
                                type="button"
                                className="users-retry-btn"
                                onClick={() => void fetchUsers()}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="users-empty-state">
                            <div className="users-empty-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    width="48"
                                    height="48"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3>
                                {searchQuery
                                    ? `No users match "${searchQuery}"`
                                    : "No users found"}
                            </h3>
                            <p>
                                {searchQuery
                                    ? "Try searching with a different keyword or username."
                                    : "Check back later when other members join!"}
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="users-clear-filter-btn"
                                    onClick={() => setSearchQuery("")}
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <ul className="users-list">
                            {filteredUsers.map((item) => {
                                const isSelf = currentUser?.id === item.id;

                                return (
                                    <li key={item.id} className="user-card-item">
                                        <div className="user-card">
                                            <div className="user-card-avatar-wrapper">
                                                <Avatar
                                                    displayName={item.displayName}
                                                    avatarColor={item.avatarColor}
                                                    avatarUrl={item.avatarUrl}
                                                    size="3.2rem"
                                                />
                                            </div>

                                            <div className="user-card-info">
                                                <div className="user-card-header">
                                                    <span className="user-card-name">
                                                        {item.displayName}
                                                    </span>
                                                    {isSelf && (
                                                        <span className="user-self-badge">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="user-card-handle">
                                                    @{item.username}
                                                </span>
                                            </div>

                                            <div className="user-card-action">
                                                <button
                                                    type="button"
                                                    className="user-message-btn"
                                                    onClick={() => handleStartChat(item)}
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        width="16"
                                                        height="16"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                                    </svg>
                                                    <span>
                                                        {isSelf ? "Saved Messages" : "Chat"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}
