import {
	clearAuthCookies,
	getAccessCookie,
	getRefreshCookie,
	setRefreshCookie,
	setSessionCookie,
} from "#/servers/session";
import { verifyAccessToken } from "#/utils/helpers/token";
import {
	refreshSessionRepository,
	validSessionRepository,
} from "#/utils/repositories/auth/repository.session";

type ResolveOptions = {
	/** true: boleh merotasi refresh token kalau access token habis */
	refresh?: boolean;
};

export async function resolveAuth({ refresh = false }: ResolveOptions = {}) {
	const accessToken = getAccessCookie();
	const refreshToken = getRefreshCookie();

	// 1) access token valid + session masih aktif
	if (accessToken) {
		const claims = await verifyAccessToken(accessToken);
		if (claims) {
			const session = await validSessionRepository(claims.sessionId);
			if (session && session.user_id === claims.userId) {
				return { userId: claims.userId, sessionId: session.id };
			}
		}
	}

	// 2) access token habis -> rotasi refresh token (hanya kalau diizinkan)
	if (refresh && refreshToken) {
		const refreshed = await refreshSessionRepository(refreshToken);
		if (refreshed) {
			setSessionCookie(refreshed.accessToken);
			setRefreshCookie(refreshed.refreshToken);
			return { userId: refreshed.userId, sessionId: refreshed.sessionId };
		}
	}

	if (refresh && (accessToken || refreshToken)) clearAuthCookies();
	return null;
}
