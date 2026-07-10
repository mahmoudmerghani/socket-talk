import type { Endpoints, Bodies } from "@socket-talk/shared/endpoints.js";

const api_url = import.meta.env.VITE_API_URL;

type ResponseHandler = (res: Response) => void;

let responseHandlers: ResponseHandler[] = [];

export function addResponseHandler(handler: ResponseHandler) {
    responseHandlers.push(handler);
}

export function removeResponseHandler(handler: ResponseHandler) {
    responseHandlers = responseHandlers.filter((h) => h !== handler);
}

type Api = <
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path] & string,
    Body extends Endpoints[Path][Method] & Bodies<unknown, unknown>,
>(
    path: Path,
    init: Body["requestBody"] extends never
        ? {
              method: Method;
              headers?: Record<string, string>;
          }
        : {
              method: Method;
              body: Body["requestBody"];
              headers?: Record<string, string>;
          },
) => Promise<Body["responseBody"]>;

export const api: Api = async (path, init) => {
    const requestInit: RequestInit = {
        method: init.method,
        credentials: "include",
        headers: {
            ...init.headers,
        },
    };

    if ("body" in init) {
        if (init.body instanceof FormData) {
            requestInit.body = init.body;
        } else {
            requestInit.body = JSON.stringify(init.body);
            requestInit.headers = {
                "Content-Type": "application/json",
                ...init.headers,
            };
        }
    }

    try {
        const res = await fetch(`${api_url}${path}`, requestInit);

        for (const handler of responseHandlers) {
            handler(res);
        }

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
};
