import { z } from "zod";

export const searchUsersQuerySchema = z.object({
    q: z.string().trim().min(1).max(100),
});

export type SearchGroupsQueryRequest = z.infer<typeof searchUsersQuerySchema>;
