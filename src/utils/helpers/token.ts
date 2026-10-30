import { createHash, randomBytes } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
	throw new Error("JWT_ACCESS_SECRET is not configured");
}

const accessSecret = new TextEncoder().encode(JWT_ACCESS_SECRET);

export const ACCESS_TOKEN_TTL = 60 * 60 * 24; // 1d (detik)
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7d (detik)
export const RESET_TOKEN_TTL = 30 * 60; // detik
export const RESET_TOKEN_TTL_MINUTES = RESET_TOKEN_TTL / 60;

export async function createAccessToken(userId: string, sessionId: string) {
	return new SignJWT({ sid: sessionId })
		.setProtectedHeader({ alg: "HS256", typ: "JWT" })
		.setSubject(userId)
		.setIssuedAt()
		.setExpirationTime(`${ACCESS_TOKEN_TTL}s`) // string durasi, bukan angka mentah
		.sign(accessSecret);
}

export async function verifyAccessToken(token: string) {
	try {
		const { payload } = await jwtVerify(token, accessSecret, {
			algorithms: ["HS256"],
		});

		if (!payload.sub || typeof payload.sid !== "string") return null;

		return { userId: payload.sub, sessionId: payload.sid };
	} catch {
		return null; // expired / invalid
	}
}

export async function createRefreshToken() {
	return randomBytes(64).toString("base64url");
}

export async function hashRefreshToken(token: string) {
	return createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenExpiry() {
	return new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
}

export function createResetToken() {
	return randomBytes(32).toString("base64url");
}

export function getResetTokenExpiry() {
	return new Date(Date.now() + RESET_TOKEN_TTL * 1000);
}
