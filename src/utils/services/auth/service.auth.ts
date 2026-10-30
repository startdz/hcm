import { createServerFn } from "@tanstack/react-start";
import { resolveAuth } from "#/servers/auth";
import { clearAuthCookies } from "#/servers/session";
import { getSessionUserRepository } from "#/utils/repositories/auth/repository.session";

// ACCORDING TO CURRENT USER
export const getAuthFn = createServerFn({ method: "GET" }).handler(async () => {
	const auth = await resolveAuth({ refresh: true });

	if (!auth) {
		return { isAuthenticated: false as const, user: null };
	}

	const user = await getSessionUserRepository(auth.userId);
	if (!user) {
		clearAuthCookies();
		return { isAuthenticated: false as const, user: null };
	}

	return { isAuthenticated: true as const, user };
});
