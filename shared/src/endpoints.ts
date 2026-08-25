import * as bodies from "./index.js";

export type ResError = {
    status: number;
    error: string;
    code?: string;
};

export type Bodies<Request, Response> = {
    requestBody: Request;
    responseBody: Response | ResError;
};

export type Endpoints = {
    "/auth/login": {
        POST: {
            bodies: Bodies<bodies.LoginRequest, bodies.LoginResponse>;
        };
    };

    "/auth/signup": {
        POST: {
            bodies: Bodies<bodies.SignupRequest, bodies.SignupResponse>;
        };
    };

    "/auth/logout": {
        POST: { bodies: Bodies<never, void> };
    };

    "/auth/me": {
        GET: { bodies: Bodies<never, bodies.GetAuthUserResponse> };
    };

    "/auth/github": {
        GET: { bodies: Bodies<never, void> };
    };

    "/auth/github/callback": {
        GET: { bodies: Bodies<never, void> };
    };

    "/auth/github/pending-signup": {
        GET: {
            bodies: Bodies<never, bodies.GetGithubPendingSignupDataResponse>;
        };
        POST: {
            bodies: Bodies<
                bodies.GithubSignupRequest,
                bodies.SignupWithGithubResponse
            >;
        };
    };

    "/conversations": {
        GET: {
            bodies: Bodies<never, bodies.GetAllUserConversationsResponse>;
        };
    };

    "/conversations/:conversationId/messages": {
        GET: {
            bodies: Bodies<
                never,
                | bodies.GetConversationMessagesWithQueryResponse
                | bodies.GetConversationMessagesWithoutQueryResponse
            >;
            params: {
                conversationId: number;
            };
            queries: {
                after?: number;
                before?: number;
                around?: number;
            };
        };

        POST: {
            bodies: Bodies<
                bodies.CreateMessageRequest,
                bodies.SendMessageToConversationResponse
            >;
            params: {
                conversationId: number;
            };
        };
    };

    "/conversations/:conversationId/read": {
        POST: {
            bodies: Bodies<bodies.ReadMessageRequest, void>;
            params: {
                conversationId: number;
            };
        };
    };

    "/directs/:userId": {
        GET: {
            bodies: Bodies<never, bodies.GetDMResponse>;
            params: {
                userId: number;
            };
        };
    };

    "/directs/:userId/messages": {
        POST: {
            bodies: Bodies<
                bodies.CreateMessageRequest,
                bodies.SendMessageToUserResponse
            >;
            params: {
                userId: number;
            };
        };
    };

    "/groups": {
        GET: {
            bodies: Bodies<never, bodies.GetGroupsResponse>;
            queries: {
                q?: string;
            };
        };
        POST: {
            bodies: Bodies<
                bodies.CreateGroupRequest,
                bodies.CreateGroupResponse
            >;
        };
    };

    "/groups/:conversationId": {
        GET: {
            bodies: Bodies<never, bodies.GetGroupInfoResponse>;
            params: {
                conversationId: number;
            };
        };
    };

    "/groups/:conversationId/members": {
        GET: {
            bodies: Bodies<never, bodies.GetGroupMembersResponse>;
            params: {
                conversationId: number;
            };
        };

        POST: {
            bodies: Bodies<never, void>;
            params: {
                conversationId: number;
            };
        };

        DELETE: {
            bodies: Bodies<never, void>;
            params: {
                conversationId: number;
            };
        };
    };

    "/groups/:conversationId/group-image": {
        PATCH: {
            bodies: Bodies<FormData, bodies.UpdateGroupImageResponse>;
            params: {
                conversationId: number;
            };
        };
    };

    "/users": {
        GET: {
            bodies: Bodies<never, bodies.GetUsersResponse>;
            queries: {
                q?: string;
            };
        };
    };

    "/users/:userId": {
        GET: {
            bodies: Bodies<never, bodies.GetUserResponse>;
            params: {
                userId: number;
            };
        };
    };

    "/users/me/avatar": {
        PATCH: {
            bodies: Bodies<FormData, bodies.UpdateAvatarResponse>;
        };
    };
};
