import type { Message } from "./services/messageService.js";
import EventEmitter from "node:events";

type EventMap = {
    message_created: Message;
    message_read: {
        userId: number;
        conversationId: number;
        messageId: number;
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