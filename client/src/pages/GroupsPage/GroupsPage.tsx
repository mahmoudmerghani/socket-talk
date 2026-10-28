import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { Avatar } from "../../components/Avatar/Avatar";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import "./GroupsPage.css";

export type GroupItem = {
    name: string;
    avatarColor: string;
    avatarUrl: string | null;
    avatarPath: string | null;
    conversationId: number;
    creatorId: number;
};

export function GroupsPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [groups, setGroups] = useState<GroupItem[]>([]);
    const [joinedIds, setJoinedIds] = useState<Set<number>>(() => {
        const stateIds = (location.state as { joinedConversationIds?: number[] })
            ?.joinedConversationIds;
        return stateIds ? new Set(stateIds) : new Set();
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joiningId, setJoiningId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const fetchGroupsAndMembership = async () => {
        setIsLoading(true);
        setError(null);

        // Fetch all groups
        const groupsRes = await api("/groups", {
            method: "GET",
        });

        if ("error" in groupsRes) {
            setError(groupsRes.error);
            setIsLoading(false);
            return;
        }

        setGroups(groupsRes);

        // If joinedConversationIds was not provided via location.state, fetch user's conversations
        const hasPassedState = Boolean(
            (location.state as { joinedConversationIds?: number[] })
                ?.joinedConversationIds,
        );

        if (!hasPassedState || joinedIds.size === 0) {
            const convsRes = await api("/conversations", {
                method: "GET",
            });

            if (!("error" in convsRes)) {
                const groupConvIds = convsRes
                    .filter((c) => c.type === "GROUP")
                    .map((c) => c.id);
                setJoinedIds(new Set(groupConvIds));
            }
        }

        setIsLoading(false);
    };

    useEffect(() => {
        void fetchGroupsAndMembership();
    }, []);

    const filteredGroups = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return groups;

        return groups.filter((g) => g.name.toLowerCase().includes(query));
    }, [groups, searchQuery]);

    const handleOpenGroup = (conversationId: number) => {
        navigate("/", {
            state: {
                targetConversationId: conversationId,
            },
        });
    };

    const handleJoinGroup = async (group: GroupItem) => {
        setActionError(null);
        setJoiningId(group.conversationId);

        const response = await api("/groups/:conversationId/members", {
            method: "POST",
            params: {
                conversationId: group.conversationId,
            },
        });

        if (response && "error" in response) {
            setActionError(response.error);
            setJoiningId(null);
            return;
        }

        // Successfully joined (204)
        setJoinedIds((prev) => new Set([...prev, group.conversationId]));
        setJoiningId(null);

        // Navigate directly to the newly joined group chat
        handleOpenGroup(group.conversationId);
    };

    return (
        <div className="groups-page" aria-label="Discover groups">
            <header className="groups-page-header">
                <div className="groups-header-inner">
                    <div className="groups-header-left">
                        <Link
                            to="/"
                            className="groups-back-btn"
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

                    <div className="groups-header-brand">
                        <BrandLogo />
                    </div>
                </div>
            </header>

            <main className="groups-page-main">
                <div className="groups-container">
                    <div className="groups-title-row">
                        <div className="groups-title-section">
                            <h1>Discover Groups</h1>
                            <p className="groups-subtitle">
                                Find active communities and join conversations
                            </p>
                        </div>
                        <Link
                            to="/groups/create"
                            className="groups-create-link"
                            aria-label="Create a new group"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span>Create a group</span>
                        </Link>
                    </div>

                    {actionError && (
                        <div className="groups-action-alert">
                            <span>{actionError}</span>
                            <button
                                type="button"
                                onClick={() => setActionError(null)}
                                aria-label="Dismiss alert"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div className="groups-search-bar">
                        <div className="groups-search-input-wrapper">
                            <svg
                                className="groups-search-icon"
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
                                className="groups-search-input"
                                placeholder="Search groups by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    className="groups-search-clear"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            ) : null}
                        </div>
                        {!isLoading && !error && (
                            <div className="groups-count-tag">
                                {filteredGroups.length}{" "}
                                {filteredGroups.length === 1 ? "group" : "groups"}
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="groups-loading-state">
                            <div className="groups-loading-spinner" />
                            <p>Loading groups...</p>
                        </div>
                    ) : error ? (
                        <div className="groups-error-state">
                            <div className="groups-error-icon">
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
                            <h3>Failed to load groups</h3>
                            <p>{error}</p>
                            <button
                                type="button"
                                className="groups-retry-btn"
                                onClick={() => void fetchGroupsAndMembership()}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="groups-empty-state">
                            <div className="groups-empty-icon">
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
                                    ? `No groups match "${searchQuery}"`
                                    : "No groups found"}
                            </h3>
                            <p>
                                {searchQuery
                                    ? "Try searching with a different name."
                                    : "There are no public groups available yet."}
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="groups-clear-filter-btn"
                                    onClick={() => setSearchQuery("")}
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <ul className="groups-list">
                            {filteredGroups.map((group) => {
                                const isMember = joinedIds.has(group.conversationId);
                                const isJoining = joiningId === group.conversationId;

                                return (
                                    <li key={group.conversationId} className="group-card-item">
                                        <div className="group-card">
                                            <div className="group-card-avatar-wrapper">
                                                <Avatar
                                                    displayName={group.name}
                                                    avatarColor={group.avatarColor}
                                                    avatarUrl={group.avatarUrl}
                                                    size="3.4rem"
                                                />
                                            </div>

                                            <div className="group-card-info">
                                                <div className="group-card-header">
                                                    <span className="group-card-name">
                                                        {group.name}
                                                    </span>
                                                    {isMember && (
                                                        <span className="group-joined-badge">
                                                            Joined
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="group-card-meta">
                                                    Public Group
                                                </span>
                                            </div>

                                            <div className="group-card-action">
                                                {isMember ? (
                                                    <button
                                                        type="button"
                                                        className="group-open-btn"
                                                        onClick={() =>
                                                            handleOpenGroup(
                                                                group.conversationId,
                                                            )
                                                        }
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
                                                        <span>Open</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="group-join-btn"
                                                        disabled={isJoining}
                                                        onClick={() =>
                                                            void handleJoinGroup(group)
                                                        }
                                                    >
                                                        {isJoining ? (
                                                            <div className="group-btn-spinner" />
                                                        ) : (
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
                                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                                <circle cx="9" cy="7" r="4" />
                                                                <line x1="19" y1="8" x2="19" y2="14" />
                                                                <line x1="22" y1="11" x2="16" y2="11" />
                                                            </svg>
                                                        )}
                                                        <span>
                                                            {isJoining ? "Joining..." : "Join"}
                                                        </span>
                                                    </button>
                                                )}
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
