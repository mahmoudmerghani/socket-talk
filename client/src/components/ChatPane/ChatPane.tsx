import { useEffect, useRef, useState } from "react";
import { Avatar } from "../Avatar/Avatar";
import { api } from "../../api/api";
import type { Conversation } from "../ConversationList/ConversationList";
import type { AuthUser } from "../../auth/AuthContext";
import "./ChatPane.css";

type MessagesResponse = Awaited<
    ReturnType<typeof api<"/conversations/:conversationId/messages", "GET">>
>;
export type Message = Extract<
    MessagesResponse,
    { messages: unknown[] }
>["messages"][number];

type ChatPaneProps = {
    conversation: Conversation;
    currentUser: AuthUser | null;
    onBack: () => void;
    onUpdateUnreadCount?: (conversationId: number, count: number) => void;
};

// Ensure timestamps from the server are always parsed as UTC
function parseUtc(isoString: string): Date {
    const s =
        isoString.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(isoString)
            ? isoString
            : isoString + "Z";
    return new Date(s);
}

function formatMessageTime(isoString: string): string {
    const date = parseUtc(isoString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function formatMessageDateSeparator(isoString: string): string {
    const date = parseUtc(isoString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) return "Today";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString([], {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export function ChatPane({
    conversation,
    currentUser,
    onBack,
    onUpdateUnreadCount,
}: ChatPaneProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastReadMessageId, setLastReadMessageId] = useState<number | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingBefore, setIsLoadingBefore] = useState(false);
    const [isLoadingAfter, setIsLoadingAfter] = useState(false);
    const [hasMoreBefore, setHasMoreBefore] = useState(true);
    const [hasMoreAfter, setHasMoreAfter] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Ref to avoid stale closures in polling interval
    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    const isPollingRef = useRef(false);
    const lastMarkedReadIdRef = useRef<number | null>(null);
    const readDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scheduleMarkAsRead = (messageId: number) => {
        if (
            lastMarkedReadIdRef.current !== null &&
            messageId <= lastMarkedReadIdRef.current
        ) {
            return;
        }

        lastMarkedReadIdRef.current = messageId;
        // Optimistically update conversation unread badge
        const readMsg = messagesRef.current.find((m) => m.id === messageId);

        if (readMsg && onUpdateUnreadCount) {
            if (conversation.type !== "SELF" && conversation.lastMessage?.sequenceNumber !== undefined) {
                const remaining = Math.max(0, conversation.lastMessage.sequenceNumber - readMsg.sequenceNumber);
                onUpdateUnreadCount(conversation.id, remaining);
            }
        }

        if (readDebounceTimerRef.current) {
            clearTimeout(readDebounceTimerRef.current);
        }

        readDebounceTimerRef.current = setTimeout(() => {
            lastMarkedReadIdRef.current = messageId;
            void api("/conversations/:conversationId/read", {
                method: "POST",
                params: {
                    conversationId: conversation.id,
                },
                body: {
                    messageId,
                },
            });
        }, 2000); // 2-second debounce to minimize API calls
    };

    const scheduleMarkAsReadRef = useRef(scheduleMarkAsRead);
    scheduleMarkAsReadRef.current = scheduleMarkAsRead;

    // Initial message fetch
    useEffect(() => {
        let isMounted = true;

        if (readDebounceTimerRef.current) {
            clearTimeout(readDebounceTimerRef.current);
        }
        lastMarkedReadIdRef.current = null;

        const fetchMessages = async () => {
            setIsLoading(true);
            setError(null);
            setHasMoreBefore(true);
            setHasMoreAfter(true);

            const response = await api(
                "/conversations/:conversationId/messages",
                {
                    method: "GET",
                    params: {
                        conversationId: conversation.id,
                    },
                },
            );

            if (!isMounted) return;

            if ("error" in response) {
                setError(response.error);
                setIsLoading(false);
                return;
            }

            if (!Array.isArray(response) && "messages" in response) {
                setMessages(response.messages);
                setLastReadMessageId(response.lastReadMessageId);
            }

            setIsLoading(false);
        };

        void fetchMessages();

        return () => {
            isMounted = false;
            if (readDebounceTimerRef.current) {
                clearTimeout(readDebounceTimerRef.current);
            }
        };
    }, [conversation.id]);

    // Centering scroll on initial load
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            requestAnimationFrame(() => {
                const scrollContainer = chatScrollRef.current;
                if (!scrollContainer) return;

                if (
                    lastReadMessageId !== null &&
                    lastReadMessageId !== undefined
                ) {
                    const targetEl = document.getElementById(
                        `chat-message-${lastReadMessageId}`,
                    );
                    if (targetEl) {
                        const containerRect =
                            scrollContainer.getBoundingClientRect();
                        const targetRect = targetEl.getBoundingClientRect();
                        const relativeTop =
                            targetRect.top -
                            containerRect.top +
                            scrollContainer.scrollTop;
                        scrollContainer.scrollTop =
                            relativeTop -
                            containerRect.height / 2 +
                            targetRect.height / 2;
                        return;
                    }
                }
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            });
        }
    }, [isLoading, conversation.id, lastReadMessageId]);

    // Mark visible messages as read using IntersectionObserver
    useEffect(() => {
        const root = chatScrollRef.current;
        if (!root || isLoading || messages.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                let highestVisibleId: number | null = null;
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const match = entry.target.id.match(/^chat-message-(\d+)$/);
                        if (match) {
                            const id = parseInt(match[1], 10);
                            if (highestVisibleId === null || id > highestVisibleId) {
                                highestVisibleId = id;
                            }
                        }
                    }
                }
                if (highestVisibleId !== null) {
                    scheduleMarkAsReadRef.current(highestVisibleId);
                }
            },
            { root, threshold: 0.1 }
        );

        const messageElements = root.querySelectorAll(".chat-message-row-wrapper");
        messageElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [messages, isLoading]);

    // Fetch older messages (before)
    const fetchBeforeMessages = async () => {
        if (!hasMoreBefore || isLoadingBefore || isLoading || messages.length === 0) {
            return;
        }

        const oldestMessage = messages[0];
        if (!oldestMessage) return;

        setIsLoadingBefore(true);

        const response = await api("/conversations/:conversationId/messages", {
            method: "GET",
            params: {
                conversationId: conversation.id,
            },
            queries: {
                before: oldestMessage.sequenceNumber,
            },
        });

        if ("error" in response) {
            setIsLoadingBefore(false);
            return;
        }

        if (Array.isArray(response)) {
            if (response.length === 0) {
                setHasMoreBefore(false);
            } else {
                const scrollContainer = chatScrollRef.current;
                const previousScrollHeight = scrollContainer?.scrollHeight ?? 0;
                const previousScrollTop = scrollContainer?.scrollTop ?? 0;

                setMessages((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id));
                    const newMessages = response.filter(
                        (m) => !existingIds.has(m.id),
                    );
                    return [...newMessages, ...prev];
                });

                requestAnimationFrame(() => {
                    if (scrollContainer) {
                        const newScrollHeight = scrollContainer.scrollHeight;
                        scrollContainer.scrollTop =
                            previousScrollTop +
                            (newScrollHeight - previousScrollHeight);
                    }
                });
            }
        }

        setIsLoadingBefore(false);
    };

    // Fetch newer messages (after)
    const fetchAfterMessages = async () => {
        if (!hasMoreAfter || isLoadingAfter || isLoading || messages.length === 0) {
            return;
        }

        const newestMessage = messages[messages.length - 1];
        if (!newestMessage) return;

        setIsLoadingAfter(true);

        const response = await api("/conversations/:conversationId/messages", {
            method: "GET",
            params: {
                conversationId: conversation.id,
            },
            queries: {
                after: newestMessage.sequenceNumber,
            },
        });

        if ("error" in response) {
            setIsLoadingAfter(false);
            return;
        }

        if (Array.isArray(response)) {
            if (response.length === 0) {
                setHasMoreAfter(false);
            } else {
                setMessages((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id));
                    const newMessages = response.filter(
                        (m) => !existingIds.has(m.id),
                    );
                    return [...prev, ...newMessages];
                });
            }
        }

        setIsLoadingAfter(false);
    };

    // Auto-exhaust recent messages if the window fits without a scrollbar
    useEffect(() => {
        if (isLoading || isLoadingAfter || !hasMoreAfter || messages.length === 0) return;

        const scrollContainer = chatScrollRef.current;
        if (!scrollContainer) return;

        const hasNoScrollbar =
            scrollContainer.scrollHeight <= scrollContainer.clientHeight + 10;
        if (hasNoScrollbar) {
            void fetchAfterMessages();
        }
    }, [isLoading, isLoadingAfter, hasMoreAfter, messages.length]);

    // Isolated poll fetch — does NOT touch hasMoreAfter so polling continues even on empty responses
    const pollFetch = async () => {
        if (
            isPollingRef.current ||
            isLoading ||
            messagesRef.current.length === 0
        )
            return;

        const newestMessage =
            messagesRef.current[messagesRef.current.length - 1];
        if (!newestMessage) return;

        isPollingRef.current = true;

        const response = await api("/conversations/:conversationId/messages", {
            method: "GET",
            params: {
                conversationId: conversation.id,
            },
            queries: {
                after: newestMessage.sequenceNumber,
            },
        });

        if (
            !("error" in response) &&
            Array.isArray(response) &&
            response.length > 0
        ) {
            setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const newMessages = response.filter(
                    (m) => !existingIds.has(m.id),
                );
                return newMessages.length > 0
                    ? [...prev, ...newMessages]
                    : prev;
            });
        }

        isPollingRef.current = false;
    };

    // Polling: only active when at the live edge (hasMoreAfter === false)
    useEffect(() => {
        if (isLoading || hasMoreAfter) return;

        const intervalId = setInterval(() => {
            void pollFetch();
        }, 5000);

        return () => {
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, hasMoreAfter, conversation.id]);

    // Scroll listener for top and bottom reach
    const handleScroll = () => {
        const container = chatScrollRef.current;
        if (!container || isLoading) return;

        const { scrollTop, scrollHeight, clientHeight } = container;

        // Scrolled near top
        if (
            scrollTop <= 60 &&
            hasMoreBefore &&
            !isLoadingBefore &&
            messages.length > 0
        ) {
            void fetchBeforeMessages();
        }

        // Scrolled near bottom
        if (
            scrollHeight - scrollTop - clientHeight <= 60 &&
            hasMoreAfter &&
            !isLoadingAfter &&
            messages.length > 0
        ) {
            void fetchAfterMessages();
        }
    };

    const getChatTitle = () => {
        if (conversation.type === "DIRECT")
            return conversation.otherUser.displayName;
        if (conversation.type === "GROUP") return conversation.group.name;
        return "Saved Messages";
    };

    const getChatSubtitle = () => {
        if (conversation.type === "DIRECT") return "Direct Message";
        if (conversation.type === "GROUP") return "Group Chat";
        return "Your personal cloud storage";
    };

    return (
        <section
            className="chat-pane"
            aria-label={`Chat with ${getChatTitle()}`}
        >
            {/* Chat Header */}
            <header className="chat-header">
                <button
                    type="button"
                    className="chat-header-back-btn"
                    onClick={onBack}
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
                    {conversation.type === "DIRECT" ? (
                        <Avatar
                            displayName={conversation.otherUser.displayName}
                            avatarColor={conversation.otherUser.avatarColor}
                            avatarUrl={conversation.otherUser.avatarUrl}
                            size="2.6rem"
                        />
                    ) : conversation.type === "GROUP" ? (
                        <Avatar
                            displayName={conversation.group.name}
                            avatarColor={conversation.group.avatarColor}
                            avatarUrl={conversation.group.avatarUrl}
                            size="2.6rem"
                        />
                    ) : (
                        <div
                            className="saved-messages-badge-avatar small"
                            aria-hidden="true"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="currentColor"
                            >
                                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="chat-header-info">
                    <h2 className="chat-header-title">{getChatTitle()}</h2>
                    <span className="chat-header-subtitle">
                        {getChatSubtitle()}
                    </span>
                </div>
            </header>

            {/* Messages Feed Area */}
            <div
                className="chat-messages-scroll"
                ref={chatScrollRef}
                onScroll={handleScroll}
            >
                {isLoading ? (
                    <div className="chat-messages-loading">
                        <div className="chat-loading-dots">
                            <span />
                            <span />
                            <span />
                        </div>
                        <p>Loading messages...</p>
                    </div>
                ) : error ? (
                    <div className="chat-messages-error">
                        <p>{error}</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="chat-messages-empty">
                        <div className="chat-empty-icon">
                            <svg
                                viewBox="0 0 24 24"
                                width="36"
                                height="36"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <h3>No messages yet</h3>
                        <p>Send a message to start the conversation!</p>
                    </div>
                ) : (
                    <div className="chat-messages-list">
                        {isLoadingBefore ? (
                            <div
                                className="chat-messages-pagination-loader"
                                aria-label="Loading older messages"
                            >
                                <span />
                                <span />
                                <span />
                            </div>
                        ) : null}

                        {messages.map((message, index) => {
                            const isOutgoing =
                                message.sender.id === currentUser?.id;
                            const prevMessage = messages[index - 1];

                            // Date separator logic
                            const messageDate = new Date(
                                message.sentAt,
                            ).toDateString();
                            const prevDate = prevMessage
                                ? new Date(prevMessage.sentAt).toDateString()
                                : null;
                            const showDateSeparator = messageDate !== prevDate;

                            return (
                                <div
                                    key={message.id}
                                    id={`chat-message-${message.id}`}
                                    className="chat-message-row-wrapper"
                                >
                                    {showDateSeparator ? (
                                        <div className="chat-date-separator">
                                            <span>
                                                {formatMessageDateSeparator(
                                                    message.sentAt,
                                                )}
                                            </span>
                                        </div>
                                    ) : null}

                                    <div
                                        className={`chat-message-bubble-wrapper ${isOutgoing ? "outgoing" : "incoming"
                                            }`}
                                    >
                                        {!isOutgoing &&
                                            conversation.type === "GROUP" ? (
                                            <div className="chat-message-avatar">
                                                <Avatar
                                                    displayName={
                                                        message.sender
                                                            .displayName
                                                    }
                                                    avatarColor={
                                                        message.sender
                                                            .avatarColor
                                                    }
                                                    avatarUrl={
                                                        message.sender.avatarUrl
                                                    }
                                                    size="2.1rem"
                                                />
                                            </div>
                                        ) : null}

                                        <div className="chat-message-bubble">
                                            {!isOutgoing &&
                                                conversation.type === "GROUP" ? (
                                                <span
                                                    className="chat-message-sender-name"
                                                    style={{
                                                        color: "var(--accent-strong)",
                                                    }}
                                                >
                                                    {message.sender.displayName}
                                                </span>
                                            ) : null}

                                            <div className="chat-message-text">
                                                {message.content}
                                            </div>

                                            <div className="chat-message-meta">
                                                <span className="chat-message-time">
                                                    {formatMessageTime(
                                                        message.sentAt,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {isLoadingAfter ? (
                            <div
                                className="chat-messages-pagination-loader"
                                aria-label="Loading newer messages"
                            >
                                <span />
                                <span />
                                <span />
                            </div>
                        ) : null}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input Bottom Bar */}
            <footer className="chat-input-bar">
                {sendError ? (
                    <p className="chat-send-error">{sendError}</p>
                ) : null}
                <form
                    className="chat-input-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleSendMessage();
                    }}
                >
                    <input
                        type="text"
                        className="chat-input-field"
                        placeholder="Write a message..."
                        value={inputText}
                        onChange={(e) => {
                            setInputText(e.target.value);
                            if (sendError) setSendError(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void handleSendMessage();
                            }
                        }}
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        className="chat-send-button"
                        disabled={!inputText.trim() || isSending}
                        aria-label="Send message"
                    >
                        {isSending ? (
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
                                fill="currentColor"
                            >
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        )}
                    </button>
                </form>
            </footer>
        </section>
    );

    async function handleSendMessage() {
        const content = inputText.trim();
        if (!content || isSending) return;

        setIsSending(true);
        setSendError(null);

        const response = await api("/conversations/:conversationId/messages", {
            method: "POST",
            params: { conversationId: conversation.id },
            body: { content },
        });

        setIsSending(false);

        if ("error" in response) {
            setSendError(response.error);
            return;
        }

        // Clear input
        setInputText("");

        // Optimistically append the sent message using server response + currentUser shape
        if (currentUser) {
            const sentMessage: Message = {
                id: response.id,
                content: response.content,
                sentAt: response.sentAt,
                sequenceNumber: response.sequenceNumber,
                sender: {
                    id: currentUser.id,
                    username: currentUser.username,
                    displayName: currentUser.displayName,
                    avatarColor: currentUser.avatarColor,
                    avatarUrl: currentUser.avatarUrl,
                },
            };

            setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                return existingIds.has(sentMessage.id)
                    ? prev
                    : [...prev, sentMessage];
            });
        }

        // Scroll to the new message
        requestAnimationFrame(() => {
            const container = chatScrollRef.current;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        });
    }
}
