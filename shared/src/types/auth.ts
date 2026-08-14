export type UserResponse = {
    createdAt: string;
    id: number;
    avatarColor: string;
    avatarUrl: string | null;
    avatarPath: string | null;
    username: string;
    displayName: string;
    email: string | null;
    isVerified: boolean;
};

export type GetAuthUserResponse = UserResponse;

export type LoginResponse = UserResponse;

export type SignupResponse = UserResponse;

export type GetGithubPendingSignupDataResponse = {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string;
    email: string | null;
};

export type SignupWithGithubResponse = UserResponse;

export const OAUTH_FAILURE_GITHUB_CODE = "OAUTH_GITHUB_FAILED";
export const EMAIL_FAILURE_GITHUB_CODE = "GITHUB_EMAIL_DUPLICATE";
