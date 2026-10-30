import { compare, hashSync } from "bcryptjs";
import { prisma } from "#/db";
import { Prisma, type User } from "#/generated/prisma/client";
import type { LoginInput } from "#/schemas/schema.signin";
import { AppError } from "#/utils/helpers/app-error";
import {
	createAccessToken,
	createRefreshToken,
	getRefreshTokenExpiry,
	hashRefreshToken,
} from "#/utils/helpers/token";
import { createSessionRepository } from "./repository.session";

// hash dummy supaya waktu respons sama saat user tidak ditemukan
const DUMMY_HASH = hashSync("dummy-password-for-timing", 10);
type LoginMeta = { ip?: string | null; userAgent?: string | null };

export async function loginRepository(
	values: LoginInput,
	meta: LoginMeta = {},
) {
	try {
		const [user] = await prisma.$queryRaw<
			Pick<User, "id" | "username" | "email" | "password_hash">[]
		>(
			Prisma.sql`
				SELECT id, username, email, password_hash
				FROM users
				WHERE email = ${values.email} AND is_active = true
				LIMIT 1
			`,
		);

		// selalu jalankan compare, walau user tidak ada
		const validPassword = await compare(
			values.password,
			user?.password_hash ?? DUMMY_HASH,
		);

		if (!user || !validPassword) {
			return {
				message: "Email atau password tidak valid",
				code: 401,
				status: false,
			};
		}

		const session = await createLoginSession(
			{ id: user.id, username: user.username, email: user.email },
			meta,
		);

		await prisma.$executeRaw(
			Prisma.sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}::uuid`,
		);

		return {
			message: "Login berhasil",
			code: 200,
			status: true,
			data: {
				user: session.user,
				accessToken: session.accessToken,
				refreshToken: session.refreshToken,
				expiresAt: session.expiresAt,
			},
		};
	} catch (error) {
		if (error instanceof AppError) throw error;
		console.error("Failed to login:", error);
		throw new AppError(
			"Terjadi kesalahan saat memproses login.",
			"LOGIN_FAILED",
			500,
			{ cause: error },
		);
	}
}

export async function createLoginSession(
	user: { id: string; username: string; email: string },
	meta: LoginMeta = {},
) {
	try {
		const refreshToken = await createRefreshToken();
		const refreshTokenHash = await hashRefreshToken(refreshToken);
		const expiresAt = getRefreshTokenExpiry();

		const session = await createSessionRepository({
			userId: user.id,
			refreshTokenHash,
			expiresAt,
			ip: meta.ip,
			userAgent: meta.userAgent,
		});

		const accessToken = await createAccessToken(user.id, session.id);

		return { user, accessToken, refreshToken, expiresAt };
	} catch (error) {
		if (error instanceof AppError) throw error;
		console.error("Failed to create login session:", error);
		throw new AppError(
			"Gagal membuat login session pengguna.",
			"SESSION_CREATE_FAILED",
			500,
			{ cause: error },
		);
	}
}
