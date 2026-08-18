import type { UserSummary } from "../services/userService.js";
import type { SuccessResBodyOf } from "../utils/controller.js";

export function toGetUserResponse(
    user: UserSummary,
): SuccessResBodyOf<"/users/:userId", "GET"> {
    return {
        avatarColor: user.avatarColor,
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        id: user.id,
        username: user.username,
    };
}

export function toGetUsersResponse(
    users: UserSummary[],
): SuccessResBodyOf<"/users", "GET"> {
    type UserElement = SuccessResBodyOf<"/users", "GET">[number];

    return users.map(
        (u): UserElement => ({
            avatarColor: u.avatarColor,
            avatarUrl: u.avatarUrl,
            displayName: u.displayName,
            id: u.id,
            username: u.username,
        }),
    );
}

export function toUpdateAvatarResponse(obj: {
    publicUrl: string;
    path: string;
}): SuccessResBodyOf<"/users/me/avatar", "PATCH"> {
    return {
        publicUrl: obj.publicUrl,
        path: obj.path,
    };
}
