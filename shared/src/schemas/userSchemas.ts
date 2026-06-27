import { email, z } from "zod";

export const userSignupSchema = z
    .object({
        firstName: z
            .string({ error: "First name is required." })
            .trim()
            .min(1, { error: "First name is required." })
            .max(50, { error: "First name must be at most 50 characters." }),

        lastName: z
            .string({ error: "Last name is required." })
            .trim()
            .min(1, { error: "Last name is required." })
            .max(50, { error: "Last name must be at most 50 characters." }),

        username: z
            .string({ error: "Username is required." })
            .trim()
            .min(3, { error: "Username must be at least 3 characters." })
            .max(30, { error: "Username must be at most 30 characters." })
            .regex(/^[a-zA-Z0-9_]+$/, {
                error: "Username can only contain letters, numbers, and underscores.",
            }),

        password: z
            .string({ error: "Password is required." })
            .min(8, { error: "Password must be at least 8 characters." })
            .max(128, { error: "Password must be at most 128 characters." }),

        passwordConfirm: z.string({
            error: "Please confirm your password.",
        }),

        email: z.email({ error: "Email must be valid" }).trim().toLowerCase(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        path: ["passwordConfirm"],
        error: "Passwords do not match.",
    });

export type UserSignupInput = z.infer<typeof userSignupSchema>;

export const AVATAR_COLOR = [
    "blue",
    "green",
    "orange",
    "purple",
    "red",
] as const;
