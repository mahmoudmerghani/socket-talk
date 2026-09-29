import type { Message } from "./services/messageService.js";
import EventEmitter from "node:events";

type EventMap = {
    message_created: Message & { clientMessageId: string };
    message_read: {
        userId: number;
        conversationId: number;
        messageId: number;
    };
    dm_created: {
        dm: {
            conversationId: number;
            user1: {
                id: number;
                username: string;
                displayName: string;
                avatarColor: string;
                avatarUrl: string | null;
            };
            user2: {
                id: number;
                username: string;
                displayName: string;
                avatarColor: string;
                avatarUrl: string | null;
            };
        };
        firstMessage: {
            content: string;
            sentAt: Date;
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

class TypedEventEmitter extends EventEmitter {
    emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean {
        return super.emit(event, data);
    }

    on<K extends keyof EventMap>(
        event: K,
        listener: (data: EventMap[K]) => void,
    ): this {
        return super.on(event, listener);
    }
}

export const eventBus = new TypedEventEmitter();
