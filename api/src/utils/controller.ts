import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { Endpoints } from "@socket-talk/shared";

export type ResBodyOf<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path],
> = Endpoints[Path][Method] extends { bodies: { responseBody: infer Body } }
    ? Body
    : never;

export type Controller<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path],
> = RequestHandler<ParamsDictionary, ResBodyOf<Path, Method>>;
