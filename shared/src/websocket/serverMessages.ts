import type { SendMessageToUserResponse } from "../types/direct.js";

export type ServerMessage =
    | {
          type: "new_message";
          data: SendMessageToUserResponse & { clientMessageId: string };
      }
    | {
          type: "message_read";
          data: {
              userId: number;
              conversationId: number;
              messageId: number;
          };
      }
    | {
          type: "new_dm";
          data: {
              dm: {
                  conversationId: number;
                  user1: {
                      id: number;
                      username: string;
                      displayName: string;
                      avatarColor: string;
                      avatarUrl: string | null;
                      isOnline: boolean;
                  };
                  user2: {
                      id: number;
                      username: string;
                      displayName: string;
                      avatarColor: string;
                      avatarUrl: string | null;
                      isOnline: boolean;
                  };
              };
              firstMessage: {
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
          };
      };
