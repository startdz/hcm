import {
	deleteCookie,
	getCookie,
	setCookie,
} from "@tanstack/react-start/server";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "#/utils/helpers/token";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

const baseOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const,
	path: "/",
};

export function setSessionCookie(token: string) {
	setCookie(ACCESS_COOKIE, token, { ...baseOptions, maxAge: ACCESS_TOKEN_TTL });
}

export function setRefreshCookie(token: string) {
	setCookie(REFRESH_COOKIE, token, {
		...baseOptions,
		maxAge: REFRESH_TOKEN_TTL,
	});
}

export function getAccessCookie() {
	return getCookie(ACCESS_COOKIE);
}

export function getRefreshCookie() {
	return getCookie(REFRESH_COOKIE);
}

export function clearAuthCookies() {
	deleteCookie(ACCESS_COOKIE, { path: "/" });
	deleteCookie(REFRESH_COOKIE, { path: "/" });
}
