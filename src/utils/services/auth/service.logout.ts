import { createServerFn } from "@tanstack/react-start";
import {
	clearAuthCookies,
	getAccessCookie,
	getRefreshCookie,
} from "#/servers/session";
import { verifyAccessToken } from "#/utils/helpers/token";
import { revokeSessionRepository } from "#/utils/repositories/auth/repository.session";

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
	const accessToken = getAccessCookie();
	const refreshToken = getRefreshCookie();

	// access token boleh sudah expired -> claims null, refresh token tetap dipakai
	const claims = accessToken ? await verifyAccessToken(accessToken) : null;

	try {
		await revokeSessionRepository({
			sessionId: claims?.sessionId,
			refreshToken,
		});
	} catch (error) {
		// jangan gagalkan logout hanya karena DB bermasalah
		console.error("Failed to revoke session on logout:", error);
	} finally {
		clearAuthCookies();
	}

	return { success: true as const };
});
