import type { LoginRequest, SignupRequest } from "./schemas/authSchemas.js";
import type { Jsonify } from "type-fest";

type ResError = {
    status: number;
    error: string;
};

type User = Jsonify<{
    displayName: string;
    username: string;
    email: string | null;
    id: number;
    isVerified: boolean;
    avatarColor: string;
    avatarUrl: string | null;
    createdAt: Date;
}>;

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
};
