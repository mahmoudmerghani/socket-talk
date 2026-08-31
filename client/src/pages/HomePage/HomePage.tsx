import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/api";
import { Avatar } from "../../components/Avatar/Avatar";
import { ConversationList, type Conversation } from "../../components/ConversationList/ConversationList";
import { ChatPane, type Message } from "../../components/ChatPane/ChatPane";
import "./HomePage.css";

export function HomePage() {
    const { user, clearAuthenticatedUser } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [pendingDirectUser, setPendingDirectUser] = useState<Message["sender"] | null>(null);
    const [pendingInputText, setPendingInputText] = useState("");
    const [isCreatingDirect, setIsCreatingDirect] = useState(false);
    const [pendingSendError, setPendingSendError] = useState<string | null>(null);
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
        setPendingDirectUser(null);
        setPendingInputText("");
        setPendingSendError(null);
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
        setPendingDirectUser(null);
        setPendingInputText("");
        setPendingSendError(null);
    };

    const handleSelectUser = (targetUser: Message["sender"]) => {
        setPendingInputText("");
        setPendingSendError(null);

        if (user && targetUser.id === user.id) {
            const selfConv = conversations.find((c) => c.type === "SELF");
            if (selfConv) {
                setSelectedConversation(selfConv);
                setPendingDirectUser(null);
            }
            return;
        }

        const matchedConv = conversations.find(
            (c) => c.type === "DIRECT" && c.otherUser.id === targetUser.id
        );

        if (matchedConv) {
            setSelectedConversation(matchedConv);
            setPendingDirectUser(null);
        } else {
            setSelectedConversation(null);
            setPendingDirectUser(targetUser);
        }
    };

    const handleSendFirstDirectMessage = async () => {
        if (!pendingDirectUser || !pendingInputText.trim() || isCreatingDirect) {
            return;
        }

        const content = pendingInputText.trim();
        setIsCreatingDirect(true);
        setPendingSendError(null);

        const response = await api("/directs/:userId/messages", {
            method: "POST",
            params: {
                userId: pendingDirectUser.id,
            },
            body: {
                content,
            },
        });

        if ("error" in response) {
            setPendingSendError(response.error);
            setIsCreatingDirect(false);
            return;
        }

        const newConversation: Conversation = {
            id: response.conversationId,
            type: "DIRECT",
            otherUser: {
                id: pendingDirectUser.id,
                displayName: pendingDirectUser.displayName,
                avatarColor: pendingDirectUser.avatarColor,
                avatarUrl: pendingDirectUser.avatarUrl ?? "",
            },
            lastMessage: {
                id: response.id,
                content: response.content,
                sentAt: response.sentAt,
                sequenceNumber: response.sequenceNumber,
                senderId: response.senderId,
                senderName: user?.displayName ?? "",
            },
            unreadMessagesCount: 0,
        };

        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        setPendingDirectUser(null);
        setPendingInputText("");
        setIsCreatingDirect(false);
    };

    const handleUpdateUnreadCount = (conversationId: number, count: number) => {
        setConversations((prev) =>
            prev.map((c) => {
                if (c.id === conversationId && c.type !== "SELF") {
                    return {
                        ...c,
                        unreadMessagesCount: Math.max(0, count),
                    };
                }
                return c;
            })
        );
    };

    return (
        <div className={`chat-layout ${selectedConversation || pendingDirectUser ? "chat-selected" : ""}`}>
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
                    <ChatPane
                        conversation={selectedConversation}
                        currentUser={user}
                        onBack={handleBackToList}
                        onUpdateUnreadCount={handleUpdateUnreadCount}
                        onSelectUser={handleSelectUser}
                    />
                ) : pendingDirectUser ? (
                    <section
                        className="chat-pane"
                        aria-label={`Chat with ${pendingDirectUser.displayName}`}
                    >
                        {/* Chat Header */}
                        <header className="chat-header">
                            <button
                                type="button"
                                className="chat-header-back-btn"
                                onClick={handleBackToList}
                                aria-label="Back to conversations"
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
                            </button>

                            <div className="chat-header-avatar">
                                <Avatar
                                    displayName={pendingDirectUser.displayName}
                                    avatarColor={pendingDirectUser.avatarColor}
                                    avatarUrl={pendingDirectUser.avatarUrl}
                                    size="2.6rem"
                                />
                            </div>

                            <div className="chat-header-info">
                                <h2 className="chat-header-title">
                                    {pendingDirectUser.displayName}
                                </h2>
                                <span className="chat-header-subtitle">
                                    Direct Message
                                </span>
                            </div>
                        </header>

                        {/* Empty Messages Scroll Area */}
                        <div className="chat-messages-scroll">
                            <div className="chat-messages-empty">
                                <div className="chat-empty-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="44"
                                        height="44"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                        />
                                    </svg>
                                </div>
                                <h3>No messages yet</h3>
                                <p>
                                    Start a conversation with{" "}
                                    {pendingDirectUser.displayName}!
                                </p>
                            </div>
                        </div>

                        {/* Input Bottom Bar */}
                        <footer className="chat-input-bar">
                            {pendingSendError ? (
                                <p className="chat-send-error">{pendingSendError}</p>
                            ) : null}
                            <form
                                className="chat-input-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    void handleSendFirstDirectMessage();
                                }}
                            >
                                <input
                                    type="text"
                                    className="chat-input-field"
                                    placeholder={`Message ${pendingDirectUser.displayName}...`}
                                    value={pendingInputText}
                                    onChange={(e) => {
                                        setPendingInputText(e.target.value);
                                        if (pendingSendError) setPendingSendError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            void handleSendFirstDirectMessage();
                                        }
                                    }}
                                    disabled={isCreatingDirect}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="chat-send-button"
                                    disabled={!pendingInputText.trim() || isCreatingDirect}
                                    aria-label="Send message"
                                >
                                    {isCreatingDirect ? (
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="18"
                                            height="18"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                                strokeOpacity="0.3"
                                            />
                                            <path
                                                d="M12 3a9 9 0 0 1 9 9"
                                                className="chat-send-spinner"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="18"
                                            height="18"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </footer>
                    </section>
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
