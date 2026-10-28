import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/api";
import { Avatar } from "../../components/Avatar/Avatar";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import { useAuth } from "../../auth/AuthContext";
import "./GroupInfoPage.css";

type GroupInfoResponse = Awaited<
    ReturnType<typeof api<"/groups/:conversationId", "GET">>
>;

type GroupInfo = Extract<GroupInfoResponse, { group: unknown }>;


export type UserListItem = {
    id: number;
    username: string;
    displayName: string;
    avatarColor: string;
    avatarUrl: string | null;
};

export function GroupInfoPage() {
    const { user: currentUser } = useAuth();
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<GroupInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const convId = Number(conversationId);

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

    useEffect(() => {
        if (!convId || isNaN(convId)) {
            setError("Invalid group.");
            setIsLoading(false);
            return;
        }

        const fetchGroup = async () => {
            setIsLoading(true);
            setError(null);

            const res = await api("/groups/:conversationId", {
                method: "GET",
                params: { conversationId: convId },
            });

            if ("error" in res) {
                setError(res.error);
            } else {
                setData(res);
            }

            setIsLoading(false);
        };

        void fetchGroup();
    }, [convId]);

    const handleOpenChat = () => {
        navigate("/", {
            state: { targetConversationId: convId },
        });
    };

    return (
        <div className="group-info-page" aria-label="Group info">
            <header className="group-info-header">
                <div className="group-info-header-inner">
                    <div className="group-info-header-left">
                        <button
                            type="button"
                            className="group-info-back-btn"
                            onClick={() => navigate(-1)}
                            aria-label="Go back"
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
                            <span>Back</span>
                        </button>
                    </div>

                    <div className="group-info-header-brand">
                        <BrandLogo />
                    </div>
                </div>
            </header>

            <main className="group-info-main">
                {isLoading ? (
                    <div className="group-info-loading">
                        <div className="group-info-spinner" />
                        <p>Loading group info...</p>
                    </div>
                ) : error ? (
                    <div className="group-info-error-state">
                        <svg
                            viewBox="0 0 24 24"
                            width="40"
                            height="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <h2>Failed to load</h2>
                        <p>{error}</p>
                        <Link to="/groups" className="group-info-back-link">
                            Browse groups
                        </Link>
                    </div>
                ) : data ? (
                    <div className="group-info-container">
                        {/* Hero section */}
                        <div className="group-info-hero">
                            <div className="group-info-avatar-ring">
                                <Avatar
                                    displayName={data.group.name}
                                    avatarColor={data.group.avatarColor}
                                    avatarUrl={data.group.avatarUrl}
                                    size="6rem"
                                />
                            </div>
                            <h1 className="group-info-name">{data.group.name}</h1>
                            <span className="group-info-meta">
                                Public Group &middot;{" "}
                                {data.members.length}{" "}
                                {data.members.length === 1 ? "member" : "members"}
                            </span>

                            <button
                                type="button"
                                className="group-info-open-btn"
                                onClick={handleOpenChat}
                                id="group-info-open-chat"
                            >
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
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                                <span>Open Chat</span>
                            </button>
                        </div>

                        {/* Members list */}
                        <section className="group-info-section" aria-labelledby="group-members-heading">
                            <h2 id="group-members-heading" className="group-info-section-title">
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
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                Members
                                <span className="group-info-count-badge">{data.members.length}</span>
                            </h2>

                            <ul className="group-info-members-list">
                                {data.members.map((member) => {
                                    const isSelf = currentUser?.id === member.id
                                    const isCreator = member.id === data.group.creatorId;
                                    const joinedDate = new Date(member.joinedAt).toLocaleDateString(
                                        undefined,
                                        { month: "short", day: "numeric", year: "numeric" },
                                    );

                                    return (
                                        <li
                                            key={member.id}
                                            className="group-info-member-item"
                                        >
                                            <Avatar
                                                displayName={member.displayName}
                                                avatarColor={member.avatarColor}
                                                avatarUrl={member.avatarUrl}
                                                size="2.75rem"
                                            />
                                            <div className="group-info-member-info">
                                                <div className="group-info-member-name-row">
                                                    <span className="group-info-member-name">
                                                        {member.displayName}
                                                    </span>
                                                    {isCreator && (
                                                        <span className="group-info-creator-badge">
                                                            Creator
                                                        </span>
                                                    )}
                                                    {isSelf && (
                                                        <span className="group-info-creator-badge">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="group-info-member-sub">
                                                    @{member.username} &middot; Joined {joinedDate}
                                                </span>

                                            </div>
                                            <div className="user-card-action">
                                                <button
                                                    type="button"
                                                    className="user-message-btn"
                                                    onClick={() => handleStartChat(member)}
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
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    </div>
                ) : null}
            </main>
        </div>
    );
}
