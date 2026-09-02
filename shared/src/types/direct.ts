export type GetDMResponse = {
    conversationId: number;
    userId1: number;
    userId2: number;
};

export type SendMessageToUserResponse = {
    content: string;
    sentAt: string;
    sequenceNumber: number;
    sender: {
        id: number;
        username: string;
        displayName: string;
        avatarColor: string;
        avatarUrl: string | null;
    };
    id: number;
    conversationId: number;
};
