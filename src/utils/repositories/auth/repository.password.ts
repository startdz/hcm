import { hash } from "bcryptjs";
import { prisma } from "#/db";
import { Prisma } from "#/generated/prisma/client";
import type { ForgotPasswordInput } from "#/schemas/schema.forgot-password";
import type { ResetPasswordInput } from "#/schemas/schema.reset-password";
import { AppError, InvalidResetTokenError } from "#/utils/helpers/app-error";
import {
	createResetToken,
	hashRefreshToken,
	RESET_TOKEN_TTL,
} from "#/utils/helpers/token";

type Meta = { ip?: string | null; userAgent?: string | null };

const MAX_REQUESTS_PER_HOUR = 3;

/**
 * Mengembalikan data untuk dikirim lewat email, atau null kalau tidak ada
 * yang perlu dikirim. Pemanggil TIDAK boleh membedakan respons ke client.
 */
export async function requestPasswordResetRepository(
	values: ForgotPasswordInput,
	meta: Meta = {},
) {
	try {
		const user = await prisma.user.findFirst({
			where: { email: values.email, is_active: true },
			select: { id: true, email: true, username: true },
		});

		if (!user) return { status: "not_found" as const };

		// batasi per user: maksimal N permintaan per jam
		const [{ count }] = await prisma.$queryRaw<{ count: number }[]>(
			Prisma.sql`
				SELECT COUNT(*)::int AS count
				FROM "password_reset_tokens"
				WHERE user_id = ${user.id}::uuid
				AND created_at > NOW() - INTERVAL '1 hour'
			`,
		);

		if (count >= MAX_REQUESTS_PER_HOUR)
			return { status: "rate_limited" as const };

		const token = createResetToken();
		const tokenHash = await hashRefreshToken(token);

		await prisma.$transaction([
			prisma.passwordResetToken.updateMany({
				where: { user_id: user.id, used_at: null },
				data: { used_at: new Date() },
			}),
			prisma.$executeRaw(
				Prisma.sql`
			INSERT INTO "password_reset_tokens"
				(user_id, token_hash, expires_at, ip, user_agent)
			VALUES (
				${user.id}::uuid,
				${tokenHash},
				NOW() + make_interval(secs => ${RESET_TOKEN_TTL}),
				${meta.ip ?? null},
				${meta.userAgent?.slice(0, 500) ?? null}
			)
		`,
			),
		]);

		return { status: "sent" as const, user, token };
	} catch (error) {
		if (error instanceof AppError) throw error;
		console.error("Failed to request password reset:", error);
		throw new AppError(
			"Terjadi kesalahan saat memproses lupa password.",
			"FORGOT_PASSWORD_FAILED",
			500,
			{ cause: error },
		);
	}
}

export async function resetPasswordRepository(values: ResetPasswordInput) {
	try {
		const tokenHash = await hashRefreshToken(values.token);
		const passwordHash = await hash(values.password, 10);

		return await prisma.$transaction(async (tx) => {
			const [claimed] = await tx.$queryRaw<{ user_id: string }[]>(
				Prisma.sql`
					UPDATE "password_reset_tokens"
					SET used_at = NOW()
					WHERE token_hash = ${tokenHash}
						AND used_at IS NULL
						AND expires_at > NOW()
					RETURNING user_id
				`,
			);

			if (!claimed) throw new InvalidResetTokenError();

			const updated = await tx.$executeRaw(
				Prisma.sql`
					UPDATE "users"
					SET password_hash = ${passwordHash}, updated_at = NOW()
					WHERE id = ${claimed.user_id}::uuid AND is_active = true
				`,
			);
			if (updated === 0) throw new InvalidResetTokenError(); // rollback, token tidak terbakar

			await tx.$executeRaw(
				Prisma.sql`
					UPDATE "sessions"
					SET revoked_at = NOW(), updated_at = NOW()
					WHERE user_id = ${claimed.user_id}::uuid AND revoked_at IS NULL
				`,
			);

			return { status: true as const };
		});
	} catch (error) {
		if (error instanceof InvalidResetTokenError) {
			return { status: false as const };
		}
		if (error instanceof AppError) throw error;
		console.error("Failed to reset password:", error);
		throw new AppError(
			"Terjadi kesalahan saat mengatur ulang password.",
			"RESET_PASSWORD_FAILED",
			500,
			{ cause: error },
		);
	}
}
