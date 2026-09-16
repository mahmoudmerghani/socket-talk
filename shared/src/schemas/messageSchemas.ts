import { z } from "zod";

export const createMessageSchema = z.object({
    content: z
        .string({ error: "Message content is required." })
        .trim()
        .min(1, { error: "Message content is required." })
        .max(5000, {
            error: "Message content must be at most 5000 characters.",
        }),

    clientMessageId: z
        .uuid({ error: "clientId must be a valid UUID." }),
});

export type CreateMessageRequest = z.infer<typeof createMessageSchema>;
