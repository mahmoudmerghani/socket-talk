import type {
    CreateGroupReturnType,
    GroupInfo,
    GroupMembers,
    Groups,
} from "../services/conversationService.js";
import type { SuccessResBodyOf } from "../utils/controller.js";

export function toGetGroupsResponse(
    groups: Groups,
): SuccessResBodyOf<"/groups", "GET"> {
    type GroupElement = SuccessResBodyOf<"/groups", "GET">[number];

    return groups.map(
        (g): GroupElement => ({
            avatarColor: g.avatarColor,
            avatarPath: g.avatarPath,
            avatarUrl: g.avatarUrl,
            conversationId: g.conversationId,
            creatorId: g.creatorId,
            name: g.name,
        }),
    );
}

export function toGetGroupInfoResponse(
    groupInfo: GroupInfo,
): SuccessResBodyOf<"/groups/:conversationId", "GET"> {
    type Member = SuccessResBodyOf<
        "/groups/:conversationId",
        "GET"
    >["members"][number];

    return {
        group: {
            avatarColor: groupInfo.group.avatarColor,
            avatarPath: groupInfo.group.avatarPath,
            avatarUrl: groupInfo.group.avatarUrl,
            conversationId: groupInfo.group.conversationId,
            creatorId: groupInfo.group.creatorId,
            name: groupInfo.group.name,
        },

        members: groupInfo.members.map(
            (m): Member => ({
                avatarColor: m.avatarColor,
                avatarUrl: m.avatarUrl,
                displayName: m.displayName,
                id: m.id,
                joinedAt: m.joinedAt.toISOString(),
                username: m.username,
            }),
        ),
    };
}

export function toGetGroupMembersResponse(
    members: GroupMembers,
): SuccessResBodyOf<"/groups/:conversationId/members", "GET"> {
    type GroupMemberElement = SuccessResBodyOf<
        "/groups/:conversationId/members",
        "GET"
    >[number];

    return members.map(
        (m): GroupMemberElement => ({
            avatarColor: m.avatarColor,
            avatarUrl: m.avatarUrl,
            displayName: m.displayName,
            id: m.id,
            joinedAt: m.joinedAt.toISOString(),
            username: m.username,
        }),
    );
}

export function toCreateGroupResponse(
    groupData: CreateGroupReturnType,
): SuccessResBodyOf<"/groups", "POST"> {
    return {
        conversation: {
            createdAt: groupData.conversation.createdAt.toISOString(),
            id: groupData.conversation.id,
            sequenceCounter: groupData.conversation.sequenceCounter,
            type: "GROUP",
        },

        group: {
            avatarColor: groupData.group.avatarColor,
            avatarPath: groupData.group.avatarPath,
            avatarUrl: groupData.group.avatarUrl,
            conversationId: groupData.group.conversationId,
            creatorId: groupData.group.creatorId,
            name: groupData.group.name,
        },
    };
}

export function toUpdateGroupImageResponse(img: {
    path: string;
    publicUrl: string;
}): SuccessResBodyOf<"/groups/:conversationId/group-image", "PATCH"> {
    return {
        path: img.path,
        publicUrl: img.publicUrl,
    };
}
