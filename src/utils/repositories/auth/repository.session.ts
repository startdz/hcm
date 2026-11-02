import { prisma } from "#/db";
import { Prisma, type Session } from "#/generated/prisma/client";
import { AppError } from "#/utils/helpers/app-error";
import {
	createAccessToken,
	createRefreshToken,
	getRefreshTokenExpiry,
	hashRefreshToken,
} from "#/utils/helpers/token";

type CreateSessionInput = {
	userId: string;
	refreshTokenHash: string;
	expiresAt: Date;
	ip?: string | null;
	userAgent?: string | null;
};

type ValidSession = Pick<Session, "id" | "user_id" | "expires_at">;

export type SessionUser = {
	id: string;
	username: string;
	email: string;
	roles: string[];
};

export async function validSessionRepository(sessionId: string) {
	try {
		const [session] = await prisma.$queryRaw<ValidSession[]>(
			Prisma.sql`
				SELECT id, user_id, expires_at
				FROM "sessions"
				WHERE id = ${sessionId}::uuid
					AND revoked_at IS NULL
					AND expires_at > NOW()
				LIMIT 1
			`,
		);
		return session ?? null;
	} catch (error) {
		console.error("Failed to validate session:", error);
		throw new AppError(
			"Gagal memvalidasi session pengguna.",
			"SESSION_VALIDATION_FAILED",
			500,
			{ cause: error },
		);
	}
}

export async function createSessionRepository(values: CreateSessionInput) {
	try {
		const [session] = await prisma.$queryRaw<{ id: string }[]>(
			Prisma.sql`
				INSERT INTO "sessions" (
					user_id, refresh_token_hash, ip, user_agent,
					expires_at, last_used_at, created_at, updated_at
				)
				VALUES (
					${values.userId}::uuid,
					${values.refreshTokenHash},
					${values.ip ?? null},
					${values.userAgent?.slice(0, 500) ?? null},
					${values.expiresAt},
					NOW(), NOW(), NOW()
				)
				RETURNING id
			`,
		);

		if (!session) throw new Error("Failed to create session");
		return session;
	} catch (error) {
		console.error("Failed to insert session:", error);
		throw new AppError(
			"Gagal membuat session pengguna.",
			"SESSION_CREATE_FAILED",
			500,
			{ cause: error },
		);
	}
}

/**
 * Rotasi refresh token secara atomik.
 * Satu UPDATE dengan kondisi WHERE: kalau dua request memakai token lama
 * bersamaan, hanya satu yang berhasil.
 */
export async function refreshSessionRepository(oldRefreshToken: string) {
	try {
		const oldHash = await hashRefreshToken(oldRefreshToken);
		const newRefreshToken = await createRefreshToken();
		const newHash = await hashRefreshToken(newRefreshToken);
		const expiresAt = getRefreshTokenExpiry();

		const [session] = await prisma.$queryRaw<{ id: string; user_id: string }[]>(
			Prisma.sql`
				UPDATE "sessions"
				SET refresh_token_hash = ${newHash},
					expires_at = ${expiresAt},
					last_used_at = NOW(),
					updated_at = NOW()
				WHERE refresh_token_hash = ${oldHash}
					AND revoked_at IS NULL
					AND expires_at > NOW()
				RETURNING id, user_id
			`,
		);

		if (!session) return null;

		return {
			sessionId: session.id,
			userId: session.user_id,
			accessToken: await createAccessToken(session.user_id, session.id),
			refreshToken: newRefreshToken,
		};
	} catch (error) {
		console.error("Failed to refresh session:", error);
		throw new AppError(
			"Gagal memperbarui session pengguna.",
			"SESSION_REFRESH_FAILED",
			500,
			{ cause: error },
		);
	}
}

export async function revokeSessionRepository(input: {
	sessionId?: string | null;
	refreshToken?: string | null;
}) {
	const hash = input.refreshToken
		? await hashRefreshToken(input.refreshToken)
		: null;

	if (!input.sessionId && !hash) return;

	await prisma.$executeRaw(
		Prisma.sql`
			UPDATE "sessions"
			SET revoked_at = NOW(), updated_at = NOW()
			WHERE revoked_at IS NULL
				AND (
					id = ${input.sessionId ?? null}::uuid
					OR refresh_token_hash = ${hash}
				)
		`,
	);
}

export async function getSessionUserRepository(userId: string) {
	const user = await prisma.user.findFirst({
		where: { id: userId, is_active: true },
		select: {
			id: true,
			username: true,
			email: true,
			roles: {
				select: {
					role: {
						select: { code: true },
					},
				},
			},
		},
	});

	if (!user) return null;

	return {
		id: user.id,
		username: user.username,
		email: user.email,
		roles: user.roles.map(({ role }) => role.code),
	};
}
