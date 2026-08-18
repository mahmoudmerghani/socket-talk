import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { Endpoints, ResError } from "@socket-talk/shared";

// this includes ResError type in the union
export type ResBodyOf<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path],
> = Endpoints[Path][Method] extends { bodies: { responseBody: infer Body } }
    ? Body
    : never;

// without ResError
export type SuccessResBodyOf<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path],
> = ResBodyOf<Path, Method> extends ResError | infer Body ? Body : never;

export type Controller<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path],
> = RequestHandler<ParamsDictionary, SuccessResBodyOf<Path, Method>>;
