import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { ForgotPasswordSchema } from "#/schemas/schema.forgot-password";
import { ResetPasswordSchema } from "#/schemas/schema.reset-password";
import { sendPasswordResetEmail } from "#/servers/mailer";
import {
	requestPasswordResetRepository,
	resetPasswordRepository,
} from "#/utils/repositories/auth/repository.password";

export const forgotPasswordFn = createServerFn({ method: "POST" })
	.validator(ForgotPasswordSchema)
	.handler(async ({ data }) => {
		const result = await requestPasswordResetRepository(data, {
			ip: getRequestIP({ xForwardedFor: true }) ?? null,
			userAgent: getRequestHeader("user-agent") ?? null,
		});

		if (result.status === "not_found") {
			return {
				success: false as const,
				message:
					"Akun dengan email tersebut tidak ditemukan atau sudah tidak aktif.",
			};
		}

		if (result.status === "rate_limited") {
			return {
				success: false as const,
				message: "Terlalu banyak permintaan. Coba lagi dalam satu jam.",
			};
		}

		// tidak di-await agar waktu respons tidak membedakan email ada/tidak
		void sendPasswordResetEmail({
			to: result.user.email,
			username: result.user.username,
			token: result.token,
		}).catch((err) => console.error("Failed to send reset email:", err));

		return {
			success: true as const,
			message: "Tautan reset password telah dikirim ke email Anda.",
		};
	});

export const resetPasswordFn = createServerFn({ method: "POST" })
	.validator(ResetPasswordSchema)
	.handler(async ({ data }) => {
		const result = await resetPasswordRepository(data);

		console.log(result);

		if (!result.status) {
			return {
				success: false as const,
				message: "Tautan tidak valid atau sudah kedaluwarsa.",
			};
		}

		return {
			success: true as const,
			message: "Password berhasil diubah. Silakan login kembali.",
		};
	});
