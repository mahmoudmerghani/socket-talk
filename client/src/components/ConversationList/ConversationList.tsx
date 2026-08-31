import { useMemo } from "react";
import { Avatar } from "../Avatar/Avatar";
import { api } from "../../api/api";
import "./ConversationList.css";
import { useAuth } from "../../auth/AuthContext";

type ConversationsResponse = Awaited<ReturnType<typeof api<"/conversations", "GET">>>;
export type Conversation = Extract<ConversationsResponse, unknown[]>[number];

type ConversationListProps = {
    conversations: Conversation[];
    selectedId: number | null;
    onSelect: (conversation: Conversation) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isLoading?: boolean;
    error?: string | null;
};

function formatTime(isoString?: string | null): string {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
        return "Yesterday";
    }

    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: "short" });
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ConversationList({
    conversations,
    selectedId,
    onSelect,
    searchQuery,
    onSearchChange,
    isLoading,
    error,
}: ConversationListProps) {
    const { user } = useAuth();
    const filteredConversations = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return conversations;

        return conversations.filter((item) => {
            let title = "";
            if (item.type === "DIRECT") {
                title = item.otherUser.displayName;
            } else if (item.type === "GROUP") {
                title = item.group.name;
            } else if (item.type === "SELF") {
                title = "Saved Messages";
            }

            const matchTitle = title.toLowerCase().includes(query);
            const matchLastMessage = item.lastMessage?.content.toLowerCase().includes(query) ?? false;

            return matchTitle || matchLastMessage;
        });
    }, [conversations, searchQuery]);

    return (
        <aside className="conversation-sidebar" aria-label="Conversations">
            <div className="conversation-search-container">
                <div className="conversation-search-wrapper">
                    <svg
                        className="conversation-search-icon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
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
                        className="conversation-search-input"
                        placeholder="Search chats"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchQuery ? (
                        <button
                            type="button"
                            className="conversation-search-clear"
                            onClick={() => onSearchChange("")}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="conversation-items-scroll">
                {isLoading ? (
                    <div className="conversation-list-loading">
                        <div className="conversation-loading-dots">
                            <span />
                            <span />
                            <span />
                        </div>
                        <p>Loading chats...</p>
                    </div>
                ) : error ? (
                    <div className="conversation-list-error">
                        <p>{error}</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="conversation-list-empty">
                        <p>{searchQuery ? "No chats match your search" : "No conversations yet"}</p>
                    </div>
                ) : (
                    <ul className="conversation-items-list">
                        {filteredConversations.map((item) => {
                            const isSelected = selectedId === item.id;
                            const timeStr = formatTime(item.lastMessage?.sentAt);

                            if (item.type === "DIRECT") {
                                const unread = item.unreadMessagesCount;
                                return (
                                    <li key={`direct-${item.id}`}>
                                        <button
                                            type="button"
                                            className={`conversation-item ${isSelected ? "selected" : ""}`}
                                            onClick={() => onSelect(item)}
                                        >
                                            <div className="conversation-item-avatar-wrapper">
                                                <Avatar
                                                    displayName={item.otherUser.displayName}
                                                    avatarColor={item.otherUser.avatarColor}
                                                    avatarUrl={item.otherUser.avatarUrl}
                                                    size="3.2rem"
                                                />
                                            </div>
                                            <div className="conversation-item-content">
                                                <div className="conversation-item-header">
                                                    <span className="conversation-item-title">
                                                        {item.otherUser.displayName}
                                                    </span>
                                                    {timeStr ? (
                                                        <span className="conversation-item-time">{timeStr}</span>
                                                    ) : null}
                                                </div>
                                                <div className="conversation-item-footer">
                                                    <span className="conversation-item-snippet">
                                                        {item.lastMessage
                                                            ? (
                                                                <>
                                                                    <span className="snippet-sender">
                                                                        {item.lastMessage.senderId === user?.id ? "You" : item.lastMessage.senderName}:
                                                                    </span>{" "}
                                                                    {item.lastMessage.content}
                                                                </>
                                                            )
                                                            : "No messages yet"}
                                                    </span>
                                                    {unread > 0 ? (
                                                        <span className="conversation-unread-badge">
                                                            {unread > 99 ? "99+" : unread}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                );
                            }

                            if (item.type === "GROUP") {
                                const unread = item.unreadMessagesCount;
                                return (
                                    <li key={`group-${item.id}`}>
                                        <button
                                            type="button"
                                            className={`conversation-item ${isSelected ? "selected" : ""}`}
                                            onClick={() => onSelect(item)}
                                        >
                                            <div className="conversation-item-avatar-wrapper">
                                                <Avatar
                                                    displayName={item.group.name}
                                                    avatarColor={item.group.avatarColor}
                                                    avatarUrl={item.group.avatarUrl}
                                                    size="3.2rem"
                                                />
                                            </div>
                                            <div className="conversation-item-content">
                                                <div className="conversation-item-header">
                                                    <span className="conversation-item-title">
                                                        {item.group.name}
                                                    </span>
                                                    {timeStr ? (
                                                        <span className="conversation-item-time">{timeStr}</span>
                                                    ) : null}
                                                </div>
                                                <div className="conversation-item-footer">
                                                    <span className="conversation-item-snippet">
                                                        {item.lastMessage ? (
                                                            <>
                                                                <span className="snippet-sender">
                                                                    {item.lastMessage.senderId === user?.id ? "You" : item.lastMessage.senderName}:
                                                                </span>{" "}
                                                                {item.lastMessage.content}
                                                            </>
                                                        ) : (
                                                            "No messages yet"
                                                        )}
                                                    </span>
                                                    {unread > 0 ? (
                                                        <span className="conversation-unread-badge">
                                                            {unread > 99 ? "99+" : unread}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                );
                            }

                            // SELF (Saved Messages)
                            return (
                                <li key={`self-${item.id}`}>
                                    <button
                                        type="button"
                                        className={`conversation-item ${isSelected ? "selected" : ""}`}
                                        onClick={() => onSelect(item)}
                                    >
                                        <div className="conversation-item-avatar-wrapper">
                                            <div className="saved-messages-badge-avatar" aria-hidden="true">
                                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="conversation-item-content">
                                            <div className="conversation-item-header">
                                                <span className="conversation-item-title">Saved Messages</span>
                                                {timeStr ? (
                                                    <span className="conversation-item-time">{timeStr}</span>
                                                ) : null}
                                            </div>
                                            <div className="conversation-item-footer">
                                                <span className="conversation-item-snippet">
                                                    {item.lastMessage
                                                        ? item.lastMessage.content
                                                        : "Save notes, links, and messages"}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}
