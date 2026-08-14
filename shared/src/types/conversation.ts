type Conversation =
    | {
          id: number;
          type: "DIRECT";
          unreadMessagesCount: number;
          lastMessage: {
              senderId: number;
              senderName: string;
              content: string;
              sentAt: string;
          } | null;
          otherUser: {
              id: number;
              displayName: string;
              avatarColor: string;
              avatarUrl: string | null;
          };
      }
    | {
          id: number;
          type: "GROUP";
          unreadMessagesCount: number;
          lastMessage: {
              senderId: number;
              senderName: string;
              content: string;
              sentAt: string;
          } | null;
          group: {
              name: string;
              avatarColor: string;
              avatarUrl: string | null;
          };
      }
    | {
          id: number;
          type: "SELF";
          lastMessage: {
              content: string;
              sentAt: string;
          } | null;
      };

type GetMessagesBase = {
    id: number;
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
}[];

export type GetAllUserConversationsResponse = Conversation[];

export type GetConversationMessagesWithQueryResponse = GetMessagesBase;

// for /conversations/:id/messages without a query
export type GetConversationMessagesWithoutQueryResponse = {
    messages: GetMessagesBase;
    othersLastReadMessageIds: {
        userId: number;
        lastReadMessageId: number | null;
    }[];
    lastReadMessageId: number | null;
};

export type SendMessageToConversationResponse = {
    id: number;
    conversationId: number;
    content: string;
    sentAt: string;
    sequenceNumber: number;
    senderId: number;
};
