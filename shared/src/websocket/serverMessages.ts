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
      };
