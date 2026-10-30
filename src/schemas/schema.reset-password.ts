import z from "zod";

const passwordSchema = z
	.string()
	.min(8, { error: "Password minimal 8 karakter" })
	.max(30, { error: "Password maksimal 30 karakter" })
	.regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
		error: "Password harus mengandung huruf dan angka",
	});

export const ResetPasswordSchema = z
	.object({
		token: z.string().min(1),
		password: passwordSchema,
		confirm_password: z.string(),
	})
	.refine((v) => v.password === v.confirm_password, {
		path: ["confirm_password"],
		message: "Konfirmasi password tidak sama",
	});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
