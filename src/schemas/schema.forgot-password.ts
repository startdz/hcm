import z from "zod";

export const ForgotPasswordSchema = z.object({
	email: z.email(),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
