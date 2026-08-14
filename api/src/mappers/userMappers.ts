import type { UserWithoutPassword } from "../services/authService.js";
import type { UserResponse } from "@socket-talk/shared";

export function toUserResponse(user: UserWithoutPassword): UserResponse {
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
