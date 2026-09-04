import { WebSocketServer, WebSocket } from "ws";
import { parse } from "cookie";
import { getAuthenticatedUser } from "./services/authService.js";
import type { Server } from "node:http";

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
        if (ws.readyState === ws.OPEN) {
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
