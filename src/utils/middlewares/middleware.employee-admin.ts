import { createMiddleware } from "@tanstack/react-start";
import { prisma } from "#/db";
import { AppError } from "#/utils/helpers/app-error";
import { authMiddleware } from "#/utils/middlewares/middleware.auth";

export const employeeAdminMiddleware = createMiddleware({ type: "function" })
	.middleware([authMiddleware])
	.server(async ({ context, next }) => {
		const user = await prisma.user.findFirst({
			where: {
				id: context.userId,
				is_active: true,
				roles: {
					some: {
						role: {
							code: { in: ["SUPERADMIN", "ADMIN"] },
							is_active: true,
						},
					},
				},
			},
			select: { id: true },
		});

		if (!user) {
			throw new AppError(
				"Fitur ini hanya dapat diakses oleh Superadmin atau Admin.",
				"FORBIDDEN",
				403,
			);
		}

		return next();
	});
