import z from "zod";

const passwordSchema = z
	.string()
	.min(8, { error: "Password minimal 8 karakter" })
	.max(30, { error: "Password maksimal 30 karakter" })
	.regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
		error: "Password harus mengandung huruf dan angka",
	});

export const LoginSchema = z.object({
	email: z.email(),
	password: passwordSchema,
});

export type LoginInput = z.infer<typeof LoginSchema>;
