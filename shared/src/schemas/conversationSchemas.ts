import { z } from "zod";

export const createGroupSchema = z.object({
    name: z
        .string({ error: "Group name is required." })
        .trim()
        .min(1, { error: "Group name is required." })
        .max(50, { error: "Group name must be at most 50 characters." }),
});

export type CreateGroupRequest = z.infer<typeof createGroupSchema>;

export const conversationIdParamSchema = z.object({
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

export type ConversationIdParam = z.infer<typeof conversationIdParamSchema>;

export type GetConversationMessagesQueryRequest = z.infer<
    typeof getConversationMessagesQuerySchema
>;

export const readMessageSchema = z.object({
    messageId: z.coerce.number().int().positive(),
});

export type ReadMessageRequest = z.infer<typeof readMessageSchema>;
