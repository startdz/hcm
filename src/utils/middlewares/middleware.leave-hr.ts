import { createMiddleware } from "@tanstack/react-start";
import { prisma } from "#/db";
import { AppError } from "#/utils/helpers/app-error";
import { authMiddleware } from "#/utils/middlewares/middleware.auth";

export const leaveHrMiddleware = createMiddleware({ type: "function" })
	.middleware([authMiddleware])
	.server(async ({ context, next }) => {
		const user = await prisma.user.findFirst({
			where: {
				id: context.userId,
				is_active: true,
				roles: {
					some: {
						role: {
							code: "HR_MANAGER",
							is_active: true,
						},
					},
				},
			},
			select: { id: true },
		});

		if (!user) {
			throw new AppError(
				"Pengajuan cuti hanya dapat ditinjau oleh HR Manager.",
				"FORBIDDEN",
				403,
			);
		}

		return next();
	});
