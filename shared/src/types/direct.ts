export type GetDMResponse = {
    conversationId: number;
    userId1: number;
    userId2: number;
};

export type SendMessageToUserResponse = {
    id: number;
    content: string;
    sentAt: string;
    sequenceNumber: number;
    senderId: number;
    conversationId: number;
};
