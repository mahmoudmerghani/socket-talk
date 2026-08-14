type User = {
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

export type GetAuthUserResponse = User;

export type LoginResponse = User;

export type SignupResponse = User;

export type GetGithubPendingSignupDataResponse = {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string;
    email: string | null;
};

export type SignupWithGithubResponse = User;


export const OAUTH_FAILURE_GITHUB_CODE = "OAUTH_GITHUB_FAILED";
export const EMAIL_FAILURE_GITHUB_CODE = "GITHUB_EMAIL_DUPLICATE";
