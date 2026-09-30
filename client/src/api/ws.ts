import type { ServerMessage } from "@socket-talk/shared";

type WsListener = (message: ServerMessage) => void;

const listeners = new Set<WsListener>();

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let isStarted = false;

function connect() {
    if (!isStarted) return;

    const wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) return;

    ws = new WebSocket(wsUrl);

    ws.onopen = (e) => {
        console.log("WebSocket connected:", e);
    };

    ws.onmessage = (e) => {
        try {
            const message = JSON.parse(e.data) as ServerMessage;
            console.log(`[WS] message received, listeners: ${listeners.size}`, message);
            for (const listener of listeners) {
                try {
                    listener(message);
                } catch (err) {
                    console.error("Error in WS listener:", err);
                }
            }
        } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
        }
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws.onclose = (e) => {
        console.log("WebSocket closed:", e);
        ws = null;

        if (isStarted) {
            console.log("Reconnecting WebSocket in 2s...");
            reconnectTimeout = setTimeout(connect, 2000);
        }
    };
}

export function startWebSocket() {
    if (isStarted) return;
    isStarted = true;
    connect();

    return () => {
        stopWebSocket();
    };
}

export function stopWebSocket() {
    isStarted = false;
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
    if (ws) {
        ws.onclose = null; // Prevent the async close event from scheduling a ghost reconnect
        ws.close(1000, "WebSocket stopped");
        ws = null;
    }
}

export function addWsListener(listener: WsListener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
