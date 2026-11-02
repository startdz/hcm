import { createMiddleware } from "@tanstack/react-start";
import { prisma } from "#/db";
import { AppError } from "#/utils/helpers/app-error";
import { authMiddleware } from "#/utils/middlewares/middleware.auth";

export const leaveEmployeeMiddleware = createMiddleware({ type: "function" })
	.middleware([authMiddleware])
	.server(async ({ context, next }) => {
		const employee = await prisma.employee.findFirst({
			where: {
				user_id: context.userId,
				status: "ACTIVE",
				user: {
					is_active: true,
					roles: {
						some: {
							role: {
								code: "EMPLOYEE",
								is_active: true,
							},
						},
					},
				},
			},
			select: { id: true },
		});

		if (!employee) {
			throw new AppError(
				"Pengajuan cuti hanya tersedia untuk akun karyawan aktif.",
				"FORBIDDEN",
				403,
			);
		}

		return next({
			context: { employeeId: employee.id },
		});
	});
