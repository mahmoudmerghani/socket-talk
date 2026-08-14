import type { UserWithoutPassword } from "../services/authService.ts";

declare module "express-serve-static-core" {
    interface Request {
        user: UserWithoutPassword;
        validatedData: {
            body?: unknown;
            query?: unknown;
            params?: unknown;
        };
    }
}
