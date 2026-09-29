import { WebSocketServer, WebSocket } from "ws";
import { parse } from "cookie";
import { getAuthenticatedUser } from "./services/authService.js";
import { eventBus } from "./eventBus.js";
import { getConversationParticipants } from "./services/conversationService.js";
import type { Server } from "node:http";
import type { ServerMessage } from "@socket-talk/shared";
import type { ToJson } from "./utils/jsonTypes.js";

const wss = new WebSocketServer({ noServer: true });
const clients = new Map<number, Set<WebSocket>>();

export const setupWebSocket = (server: Server) => {
    server.on("upgrade", async (req, socket, head) => {
        const { pathname } = new URL(req.url ?? "", process.env.API_URL);

        if (pathname !== "/ws") {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            socket.destroy();
            return;
        }

        const onSocketError = (err: Error) => {
            console.error(err);
        };

        socket.on("error", onSocketError);

        const cookieStr = req.headers.cookie ?? "";
        const sessionId = parse(cookieStr).sid;

        if (!sessionId) {
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }

        try {
            const user = await getAuthenticatedUser(sessionId);
            (req as any).user = user;

            socket.removeListener("error", onSocketError);

            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit("connection", ws, req);
            });
        } catch (err) {
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }
    });
};

wss.on("connection", (ws, req) => {
    const userId: number = (req as any).user.id;

    if (!clients.has(userId)) {
        clients.set(userId, new Set<WebSocket>());
    }

    clients.get(userId)?.add(ws);

    let timeoutId = setTimeout(() => {
        ws.terminate();
    }, 60 * 1000);

    const intervalId = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
        }
    }, 30 * 1000);

    ws.on("pong", () => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            ws.terminate();
        }, 60 * 1000);
    });

    ws.on("close", () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);

        const userSockets = clients.get(userId);

        userSockets?.delete(ws);
        if (userSockets?.size === 0) {
            clients.delete(userId);
        }
    });

    ws.on("error", (err) => {
        console.error(err);
    });
});

async function broadcastToConversation(conversationId: number, payload: any) {
    try {
        const conversationParticipants =
            await getConversationParticipants(conversationId);

        for (const p of conversationParticipants) {
            for (const userSocket of clients.get(p.userId) ?? []) {
                if (userSocket.readyState === WebSocket.OPEN) {
                    userSocket.send(JSON.stringify(payload));
                }
            }
        }
    } catch (e) {
        console.error("Broadcast error", {
            conversationId,
            payload,
            error: e,
        });
    }
}

eventBus.on("message_created", (data) => {
    const message = {
        type: "new_message" as const,
        data,
    };

    broadcastToConversation(
        data.conversationId,
        message as unknown as ToJson<typeof message> satisfies Extract<
            ServerMessage,
            { type: "new_message" }
        >,
    );
});

eventBus.on("message_read", (data) => {
    const message = {
        type: "message_read" as const,
        data,
    } satisfies Extract<ServerMessage, { type: "message_read" }>;

    broadcastToConversation(data.conversationId, message);
});

eventBus.on("dm_created", (data) => {
    const message = {
        type: "new_dm" as const,
        data,
    };

    broadcastToConversation(
        data.dm.conversationId,
        message as unknown as ToJson<typeof message> satisfies Extract<
            ServerMessage,
            { type: "new_dm" }
        >,
    );
});

export function isUserOnline(userId: number) {
    return clients.has(userId);
}