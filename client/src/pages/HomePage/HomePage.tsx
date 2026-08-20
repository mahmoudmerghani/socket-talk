import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/api";
import { Avatar } from "../../components/Avatar/Avatar";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import { ConversationList, type Conversation } from "../../components/ConversationList/ConversationList";
import "./HomePage.css";

export function HomePage() {
    const { user, clearAuthenticatedUser } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            setIsLoading(true);
            setError(null);

            const response = await api("/conversations", {
                method: "GET",
            });

            if ("error" in response) {
                setError(response.error);
                setIsLoading(false);
                return;
            }

            setConversations(response);
            setIsLoading(false);
        };

        void fetchConversations();
    }, []);

    const handleSelectConversation = (conv: Conversation) => {
        setSelectedConversation(conv);
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
    };

    const getChatTitle = (conv: Conversation) => {
        if (conv.type === "DIRECT") return conv.otherUser.displayName;
        if (conv.type === "GROUP") return conv.group.name;
        return "Saved Messages";
    };

    return (
        <div className={`chat-layout ${selectedConversation ? "chat-selected" : ""}`}>
            {/* Left Sidebar */}
            <div className="chat-layout-sidebar">
                <header className="sidebar-header">
                    <div className="sidebar-user-section">
                        {user ? (
                            <Avatar
                                displayName={user.displayName}
                                avatarColor={user.avatarColor}
                                avatarUrl={user.avatarUrl}
                                size="2.4rem"
                            />
                        ) : null}
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{user?.displayName}</span>
                            <span className="sidebar-user-handle">@{user?.username}</span>
                        </div>
                    </div>

                    <div className="sidebar-header-actions">
                        <button
                            type="button"
                            className="sidebar-logout-btn"
                            onClick={clearAuthenticatedUser}
                            title="Sign Out"
                            aria-label="Sign Out"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </header>

                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversation?.id ?? null}
                    onSelect={handleSelectConversation}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isLoading={isLoading}
                    error={error}
                />
            </div>

            {/* Right Chat Main Area */}
            <main className="chat-layout-main">
                {selectedConversation ? (
                    <div className="active-chat-container">
                        <header className="active-chat-header">
                            <button
                                type="button"
                                className="chat-back-btn"
                                onClick={handleBackToList}
                                aria-label="Back to conversation list"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>

                            <div className="active-chat-avatar-wrapper">
                                {selectedConversation.type === "DIRECT" ? (
                                    <Avatar
                                        displayName={selectedConversation.otherUser.displayName}
                                        avatarColor={selectedConversation.otherUser.avatarColor}
                                        avatarUrl={selectedConversation.otherUser.avatarUrl}
                                        size="2.6rem"
                                    />
                                ) : selectedConversation.type === "GROUP" ? (
                                    <Avatar
                                        displayName={selectedConversation.group.name}
                                        avatarColor={selectedConversation.group.avatarColor}
                                        avatarUrl={selectedConversation.group.avatarUrl}
                                        size="2.6rem"
                                    />
                                ) : (
                                    <div className="saved-messages-badge-avatar small" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="active-chat-details">
                                <h2 className="active-chat-title">{getChatTitle(selectedConversation)}</h2>
                                <span className="active-chat-subtitle">
                                    {selectedConversation.type === "DIRECT"
                                        ? "Direct Message"
                                        : selectedConversation.type === "GROUP"
                                          ? "Group Chat"
                                          : "Your Personal Cloud"}
                                </span>
                            </div>
                        </header>

                        <div className="active-chat-messages-placeholder">
                            <div className="active-chat-placeholder-card">
                                <div className="placeholder-brand">
                                    <BrandLogo />
                                </div>
                                <h3>{getChatTitle(selectedConversation)}</h3>
                                <p>Conversation history and messaging will be connected next.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-chat-state">
                        <div className="empty-chat-illustration">
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h2>Select a chat</h2>
                        <p>Choose a conversation from the left to start messaging</p>
                    </div>
                )}
            </main>
        </div>
    );
}
