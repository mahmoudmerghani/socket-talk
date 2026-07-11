import type { LoginRequest, SignupRequest, GithubSignupRequest } from "./schemas/authSchemas.js";
import type { Jsonify } from "type-fest";

type ResError = {
    status: number;
    error: string;
};

export type User = Jsonify<{
    displayName: string;
    username: string;
    email: string | null;
    id: number;
    isVerified: boolean;
    avatarColor: string;
    avatarUrl: string | null;
    avatarPath: string | null;
    createdAt: Date;
}>;

type GithubPendingSignupData = {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string;
    email: string | null;
};

export type Bodies<Request, Response> = {
    requestBody: Request;
    responseBody: Response;
};

export type Endpoints = {
    "/auth/login": {
        POST: Bodies<LoginRequest, User | ResError>;
    };

    "/auth/signup": {
        POST: Bodies<SignupRequest, User | ResError>;
    };

    "/auth/logout": {
        POST: Bodies<never, void | ResError>;
    };

    "/auth/me": {
        GET: Bodies<never, User | ResError>;
    };

    "/github/pending-signup": {
        GET: Bodies<never, GithubPendingSignupData | ResError>;
        POST: Bodies<GithubSignupRequest, User | ResError>
    };

    "/users/me/avatar": {
        PATCH: Bodies<FormData, { publicUrl: string } | ResError>;
    };
};
