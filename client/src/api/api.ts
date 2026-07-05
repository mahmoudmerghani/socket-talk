import type { Endpoints, Bodies } from "@socket-talk/shared/endpoints.js";

const api_url = import.meta.env.VITE_API_URL;

export async function api<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path] & string,
    Body extends Endpoints[Path][Method] & Bodies<unknown, unknown>,
>(
    path: Path,
    method: Method,
    ...body: Body["requestBody"] extends never ? [] : [Body["requestBody"]]
): Promise<Body["responseBody"]> {
    try {
        const res = await fetch(`${api_url}${path}`, {
            body: JSON.stringify(body[0]),
            method,
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!res.ok) {
            return {
                error: (await res.json()).error,
                status: res.status,
            };
        }

        return await res.json();
    } catch (e) {
        console.error(e);

        return {
            error: "Network Error",
            status: -1,
        };
    }
}
