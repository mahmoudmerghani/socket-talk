import { z } from "zod";

export const createGroupSchema = z.object({
    name: z
        .string({ error: "Group name is required." })
        .trim()
        .min(1, { error: "Group name is required." })
        .max(50, { error: "Group name must be at most 50 characters." }),
});

export type CreateGroupRequest = z.infer<typeof createGroupSchema>;
