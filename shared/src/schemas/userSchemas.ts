import { z } from "zod";

export const userIdParamSchema = z.object({
    userId: z.coerce.number().int().positive(),
});

export const searchUsersQuerySchema = z.object({
    q: z.string().trim().min(1).max(100),
});

export type SearchGroupsQueryRequest = z.infer<typeof searchUsersQuerySchema>;

export type UserIdParam = z.infer<typeof userIdParamSchema>;
