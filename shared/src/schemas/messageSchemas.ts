import { z } from "zod";

export const createMessageSchema = z.object({
    content: z
        .string({ error: "Message content is required." })
        .trim()
        .min(1, { error: "Message content is required." })
        .max(5000, {
            error: "Message content must be at most 5000 characters.",
        }),
});

export type CreateMessageRequest = z.infer<typeof createMessageSchema>;

export const getConversationMessagesParamsSchema = z.object({
    conversationId: z.coerce.number().int().positive(),
});

export const getConversationMessagesQuerySchema = z
    .object({
        before: z.coerce.number().int().positive().optional(),
        after: z.coerce.number().int().positive().optional(),
        around: z.coerce.number().int().positive().optional(),
    })
    .refine(
        ({ before, after, around }) =>
            [before, after, around].filter((value) => value !== undefined)
                .length <= 1,
        {
            message: "Only one of before, after, or around can be specified",
        },
    );

export type GetConversationMessagesParamsRequest = z.infer<
    typeof getConversationMessagesParamsSchema
>;

export type GetConversationMessagesQueryRequest = z.infer<
    typeof getConversationMessagesQuerySchema
>;
