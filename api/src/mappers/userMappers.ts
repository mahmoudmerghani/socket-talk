import type { UserWithoutPassword } from "../services/authService.js";
import type { UserSummary } from "../services/userService.js";
import type {
    UserResponse,
    GetUserResponse,
    GetUsersResponse,
    UpdateAvatarResponse,
} from "@socket-talk/shared";

export function toAuthUserResponse(user: UserWithoutPassword): UserResponse {
    return {
        avatarColor: user.avatarColor,
        avatarPath: user.avatarPath,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        displayName: user.displayName,
        email: user.email,
        id: user.id,
        isVerified: user.isVerified,
        username: user.username,
    };
}

export function toGetUserResponse(user: UserSummary): GetUserResponse {
    return {
        avatarColor: user.avatarColor,
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        id: user.id,
        username: user.username,
    };
}

export function toGetUsersResponse(users: UserSummary[]): GetUsersResponse {
    return users.map((u) => ({
        avatarColor: u.avatarColor,
        avatarUrl: u.avatarUrl,
        displayName: u.displayName,
        id: u.id,
        username: u.username,
    }));
}

export function toUpdateAvatarResponse(obj: {
    publicUrl: string;
    path: string;
}): UpdateAvatarResponse {
    return {
        publicUrl: obj.publicUrl,
        path: obj.path,
    };
}
