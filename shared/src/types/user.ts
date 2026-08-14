type User = {
    id: number;
    username: string;
    displayName: string;
    avatarColor: string;
    avatarUrl: string | null;
};

export type GetUsersResponse = User[];

export type GetUserResponse = User;

export type UpdateAvatarResponse = {
    publicUrl: string;
    path: string;
};
