import type { User } from "../../generated/prisma/client.js";

declare module "express-serve-static-core" {
    interface Request {
        user: Omit<User, "password">;
        validatedData: {
            body?: unknown;
            query?: unknown;
            params?: unknown;
        };
    }
}
