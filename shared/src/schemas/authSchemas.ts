import { z } from "zod";

const signupBaseSchema = z.object({
    displayName: z
        .string({ error: "First name is required." })
        .trim()
        .min(1, { error: "Display name is required." })
        .max(50, { error: "Display name must be at most 50 characters." }),

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

    email: z.preprocess(
        (value) => {
            if (typeof value === "string" && value.trim() === "") {
                return undefined;
            }
            return value;
        },
        z.email().trim().toLowerCase().optional(),
    ),
});

export const signupSchema = signupBaseSchema.refine(
    (data) => data.password === data.passwordConfirm,
    {
        path: ["passwordConfirm"],
        error: "Passwords do not match.",
    }
);

export const githubSignupSchema = signupBaseSchema.omit({
    password: true,
    passwordConfirm: true,
});

export type SignupRequest = z.infer<typeof signupSchema>;

export type GithubSignupRequest = z.infer<typeof githubSignupSchema>;

export const loginSchema = z.object({
    identifier: z.string({ error: "Username/Email is required." }),
    password: z.string({ error: "Password is required." }),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export const AVATAR_COLORS = [
    "blue",
    "green",
    "orange",
    "purple",
    "red",
] as const;

