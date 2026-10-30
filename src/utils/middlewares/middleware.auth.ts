import { createMiddleware } from "@tanstack/react-start";
import { resolveAuth } from "#/servers/auth";
import { AppError } from "#/utils/helpers/app-error";

export const authMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const auth = await resolveAuth(); // tanpa refresh

		if (!auth) {
			throw new AppError(
				"Sesi tidak valid atau sudah berakhir.",
				"UNAUTHORIZED",
				401,
			);
		}

		return next({
			context: { userId: auth.userId, sessionId: auth.sessionId },
		});
	},
);
