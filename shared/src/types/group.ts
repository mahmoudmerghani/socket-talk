type Group = {
    name: string;
    avatarColor: string;
    avatarUrl: string | null;
    avatarPath: string | null;
    conversationId: number;
    creatorId: number;
};

export type GetGroupsResponse = Group[];

export type CreateGroupResponse = {
    conversation: {
        id: number;
        createdAt: string;
        type: "GROUP";
        sequenceCounter: number;
    };
    group: {
        name: string;
        avatarColor: string;
        avatarUrl: string | null;
        avatarPath: string | null;
        conversationId: number;
        creatorId: number;
    };
};

type GroupMember = {
    joinedAt: string;
    id: number;
    avatarColor: string;
    avatarUrl: string | null;
    username: string;
    displayName: string;
};

export type GetGroupInfoResponse = {
    group: {
        name: string;
        avatarColor: string;
        avatarUrl: string | null;
        avatarPath: string | null;
        conversationId: number;
        creatorId: number;
    };
    members: GroupMember[];
};

export type GetGroupMembersResponse = GroupMember[];

export type UpdateGroupImageResponse = {
    publicUrl: string;
    path: string;
};
