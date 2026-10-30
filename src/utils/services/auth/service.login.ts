import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { LoginSchema } from "#/schemas/schema.signin";
import { setRefreshCookie, setSessionCookie } from "#/servers/session";
import { AppError } from "#/utils/helpers/app-error";
import { loginRepository } from "#/utils/repositories/auth/repository.login";

export const loginFn = createServerFn({ method: "POST" })
	.validator(LoginSchema)
	.handler(async ({ data }) => {
		try {
			const result = await loginRepository(data, {
				ip: getRequestIP({ xForwardedFor: true }) ?? null,
				userAgent: getRequestHeader("user-agent") ?? null,
			});

			if (!result.status || !result.data) {
				return { success: false as const, message: result.message };
			}

			setSessionCookie(result.data.accessToken);
			setRefreshCookie(result.data.refreshToken);

			return { success: true as const, message: result.message };
		} catch (error) {
			if (error instanceof AppError) {
				return { success: false as const, message: error.message };
			}
			throw error;
		}
	});
