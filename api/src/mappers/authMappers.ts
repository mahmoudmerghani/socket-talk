import type {
    UserWithoutPassword,
    GithubUserData,
} from "../services/authService.js";
import type { SuccessResBodyOf } from "../utils/controller.js";

export function toAuthUserResponse(
    user: UserWithoutPassword,
): SuccessResBodyOf<"/auth/me", "GET"> {
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

export function toGetGithubPendingSignupDataResponse(
    data: GithubUserData,
): SuccessResBodyOf<"/auth/github/pending-signup", "GET"> {
    return {
        avatarUrl: data.avatarUrl,
        displayName: data.displayName,
        email: data.email,
        id: data.id,
        username: data.username,
    };
}
