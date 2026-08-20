/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Endpoints, ResError } from "@socket-talk/shared";

const apiUrl = import.meta.env.VITE_API_URL;

type ResponseHandler = (res: Response) => void;

let responseHandlers: ResponseHandler[] = [];

export function addResponseHandler(handler: ResponseHandler) {
    responseHandlers.push(handler);
}

export function removeResponseHandler(handler: ResponseHandler) {
    responseHandlers = responseHandlers.filter((h) => h !== handler);
}

function resolvePathParams(
    path: string,
    params: Record<string, string | number>,
) {
    let resolvedPath = path;

    for (const [param, value] of Object.entries(params)) {
        resolvedPath = resolvedPath.replace(`:${param}`, `${value}`);
    }

    return resolvedPath;
}

function resolvePathQueries(
    path: string,
    queries: Record<string, string | number>,
) {
    let resolvedPath = path;

    const queriesArray = Object.entries(queries);

    for (let i = 0; i < queriesArray.length; i++) {
        if (i === 0) {
            resolvedPath += `?${queriesArray[0][0]}=${queriesArray[0][1]}`;
        } else {
            resolvedPath += `&${queriesArray[i][0]}=${queriesArray[i][1]}`;
        }
    }

    return resolvedPath;
}

type ReqBodyOf<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path],
> = Endpoints[Path][Method] extends { bodies: { requestBody: infer B } }
    ? B
    : never;

type ResBodyOf<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path],
> = Endpoints[Path][Method] extends { bodies: { responseBody: infer B } }
    ? B
    : never;

type ParamsOf<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path],
> = Endpoints[Path][Method] extends { params: infer P } ? P : never;

type QueriesOf<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path],
> = Endpoints[Path][Method] extends { queries: infer Q } ? Q : never;

type InitOf<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path],
> = {
    method: Method;
    headers?: Record<string, string>;
} & (ReqBodyOf<Path, Method> extends never
    ? {}
    : { body: ReqBodyOf<Path, Method> }) &
    (ParamsOf<Path, Method> extends never
        ? {}
        : {
              params: ParamsOf<Path, Method> & Record<string, string | number>;
          }) &
    (QueriesOf<Path, Method> extends never
        ? {}
        : {} extends QueriesOf<Path, Method>
          ? {
                queries?: QueriesOf<Path, Method> &
                    Record<string, string | number>;
            }
          : {
                queries: QueriesOf<Path, Method> &
                    Record<string, string | number>;
            });

export async function api<
    Path extends keyof Endpoints & string,
    Method extends keyof Endpoints[Path] & string,
>(path: Path, init: InitOf<Path, Method>): Promise<ResBodyOf<Path, Method>> {
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

    let resolvedPath: string = path;

    if ("params" in init) {
        resolvedPath = resolvePathParams(resolvedPath, init.params);
    }

    if ("queries" in init && init.queries !== undefined) {
        resolvedPath = resolvePathQueries(resolvedPath, init.queries);
    }

    try {
        const res = await fetch(`${apiUrl}${resolvedPath}`, requestInit);

        for (const handler of responseHandlers) {
            handler(res);
        }

        if (!res.ok) {
            const body = (await res.json()) as ResError;
            return {
                error: body.error,
                status: res.status,
                ...(body.code !== undefined ? { code: body.code } : {}),
            } satisfies ResError as ResBodyOf<Path, Method>;
        }

        if (res.status === 204) {
            return undefined as ResBodyOf<Path, Method>;
        }

        return (await res.json()) as ResBodyOf<Path, Method>;
    } catch (e) {
        console.error(e);

        return {
            error: "Network Error",
            status: -1,
        } satisfies ResError as ResBodyOf<Path, Method>;
    }
}
