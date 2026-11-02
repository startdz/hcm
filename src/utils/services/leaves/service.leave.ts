import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";
import { Prisma } from "#/generated/prisma/client";
import {
	LeaveRequestInputSchema,
	LeaveTypeIdSchema,
	LeaveTypeInputSchema,
	ReviewLeaveRequestSchema,
	UpdateLeaveRequestSchema,
} from "#/schemas/schema.leave";
import { AppError } from "#/utils/helpers/app-error";
import { employeeAdminMiddleware } from "#/utils/middlewares/middleware.employee-admin";
import { leaveEmployeeMiddleware } from "#/utils/middlewares/middleware.leave-employee";
import { leaveHrMiddleware } from "#/utils/middlewares/middleware.leave-hr";

const activeRequestStatuses = ["PENDING", "APPROVED"] as const;

function handleLeaveError(error: unknown): never {
	if (error instanceof AppError) throw error;

	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === "P2002") {
			throw new AppError(
				"Kode cuti sudah digunakan.",
				"LEAVE_CODE_EXISTS",
				409,
				{
					cause: error,
				},
			);
		}

		if (error.code === "P2025") {
			throw new AppError("Data cuti tidak ditemukan.", "NOT_FOUND", 404, {
				cause: error,
			});
		}

		if (error.code === "P2003") {
			throw new AppError("Jenis cuti tidak valid.", "INVALID_LEAVE_TYPE", 400, {
				cause: error,
			});
		}
	}

	console.error("Leave operation failed:", error);
	throw new AppError(
		"Terjadi kesalahan saat memproses data cuti.",
		"LEAVE_OPERATION_FAILED",
		500,
		{ cause: error },
	);
}

function toUtcDate(value: string) {
	return new Date(`${value}T00:00:00.000Z`);
}

export const getLeaveTypesFn = createServerFn({ method: "GET" })
	.middleware([employeeAdminMiddleware])
	.handler(async () => {
		try {
			return await prisma.leave.findMany({
				orderBy: [{ is_active: "desc" }, { name: "asc" }],
			});
		} catch (error) {
			return handleLeaveError(error);
		}
	});

export const createLeaveTypeFn = createServerFn({ method: "POST" })
	.middleware([employeeAdminMiddleware])
	.validator(LeaveTypeInputSchema)
	.handler(async ({ data }) => {
		try {
			return await prisma.leave.create({ data });
		} catch (error) {
			return handleLeaveError(error);
		}
	});

export const updateLeaveTypeFn = createServerFn({ method: "POST" })
	.middleware([employeeAdminMiddleware])
	.validator(LeaveTypeInputSchema.extend({ id: LeaveTypeIdSchema.shape.id }))
	.handler(async ({ data }) => {
		const { id, ...values } = data;
		try {
			return await prisma.leave.update({ where: { id }, data: values });
		} catch (error) {
			return handleLeaveError(error);
		}
	});

export const archiveLeaveTypeFn = createServerFn({ method: "POST" })
	.middleware([employeeAdminMiddleware])
	.validator(LeaveTypeIdSchema)
	.handler(async ({ data }) => {
		try {
			await prisma.leave.update({
				where: { id: data.id },
				data: { is_active: false },
			});
			return { success: true as const };
		} catch (error) {
			return handleLeaveError(error);
		}
	});

export const getAvailableLeaveTypesFn = createServerFn({ method: "GET" })
	.middleware([leaveEmployeeMiddleware])
	.handler(async () => {
		try {
			return await prisma.leave.findMany({
				where: { is_active: true },
				orderBy: { name: "asc" },
				select: { id: true, code: true, name: true, default_days: true },
			});
		} catch (error) {
			return handleLeaveError(error);
		}
	});

export const getMyLeaveRequestsFn = createServerFn({ method: "GET" })
	.middleware([leaveEmployeeMiddleware])
	.handler(async ({ context }) => {
		try {
			const requests = await prisma.leaveRequest.findMany({
				where: { employee_id: context.employeeId },
				include: {
					leave: { select: { code: true, name: true } },
				},
				orderBy: [{ created_at: "desc" }],
			});

			if (requests.length === 0) return [];

			const possibleConflicts = await prisma.leaveRequest.findMany({
				where: {
					employee_id: { not: context.employeeId },
					status: { in: [...activeRequestStatuses] },
					OR: requests.map((request) => ({
						start_date: { lte: request.end_date },
						end_date: { gte: request.start_date },
					})),
				},
				select: {
					id: true,
					start_date: true,
					end_date: true,
				},
			});

			return requests.map((request) => ({
				...request,
				hasConflict:
					request.status !== "REJECTED" &&
					possibleConflicts.some(
						(conflict) =>
							conflict.start_date <= request.end_date &&
							conflict.end_date >= request.start_date,
					),
			}));
		} catch (error) {
			return handleLeaveError(error);
		}
	});

export const createMyLeaveRequestFn = createServerFn({ method: "POST" })
	.middleware([leaveEmployeeMiddleware])
	.validator(LeaveRequestInputSchema)
	.handler(async ({ context, data }) => {
		try {
			const leaveType = await prisma.leave.findFirst({
				where: { id: data.leave_id, is_active: true },
				select: { id: true },
			});
			if (!leaveType) {
				throw new AppError(
					"Jenis cuti tidak tersedia.",
					"INVALID_LEAVE_TYPE",
					400,
				);
			}

			return await prisma.leaveRequest.create({
				data: {
					employee_id: context.employeeId,
					leave_id: data.leave_id,
					start_date: toUtcDate(data.start_date),
					end_date: toUtcDate(data.end_date),
					reason: data.reason,
				},
			});
		} catch (error) {
			return handleLeaveError(error);
		}
	});

export const updateMyConflictedLeaveRequestFn = createServerFn({
	method: "POST",
})
	.middleware([leaveEmployeeMiddleware])
	.validator(UpdateLeaveRequestSchema)
	.handler(async ({ context, data }) => {
		const startDate = toUtcDate(data.start_date);
		const endDate = toUtcDate(data.end_date);

		try {
			return await prisma.$transaction(
				async (tx) => {
					const request = await tx.leaveRequest.findFirst({
						where: {
							id: data.id,
							employee_id: context.employeeId,
							status: "PENDING",
						},
						select: {
							id: true,
							leave_id: true,
							start_date: true,
							end_date: true,
						},
					});
					if (!request) {
						throw new AppError(
							"Pengajuan tidak ditemukan atau sudah diputuskan.",
							"LEAVE_REQUEST_NOT_EDITABLE",
							409,
						);
					}

					const existingConflicts = await tx.leaveRequest.findMany({
						where: {
							employee_id: { not: context.employeeId },
							status: { in: [...activeRequestStatuses] },
							start_date: { lte: request.end_date },
							end_date: { gte: request.start_date },
						},
						select: { id: true },
					});
					if (existingConflicts.length === 0) {
						throw new AppError(
							"Pengajuan hanya dapat diubah saat ada bentrok dengan karyawan lain.",
							"LEAVE_REQUEST_HAS_NO_CONFLICT",
							409,
						);
					}

					const remainingConflicts = await tx.leaveRequest.findMany({
						where: {
							employee_id: { not: context.employeeId },
							status: { in: [...activeRequestStatuses] },
							start_date: { lte: endDate },
							end_date: { gte: startDate },
						},
						select: { id: true },
					});
					if (remainingConflicts.length > 0) {
						throw new AppError(
							"Perubahan harus menghilangkan bentrok dengan pengajuan karyawan lain.",
							"LEAVE_REQUEST_STILL_CONFLICTS",
							409,
						);
					}

					const leaveType = await tx.leave.findFirst({
						where: {
							id: data.leave_id,
							OR: [{ is_active: true }, { id: request.leave_id }],
						},
						select: { id: true },
					});
					if (!leaveType) {
						throw new AppError(
							"Jenis cuti tidak tersedia.",
							"INVALID_LEAVE_TYPE",
							400,
						);
					}

					return tx.leaveRequest.update({
						where: { id: request.id },
						data: {
							leave_id: data.leave_id,
							start_date: startDate,
							end_date: endDate,
							reason: data.reason,
						},
					});
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
			);
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2034"
			) {
				throw new AppError(
					"Jadwal berubah saat pengajuan diperbarui. Muat ulang lalu coba lagi.",
					"LEAVE_REQUEST_CONFLICT_RETRY",
					409,
					{ cause: error },
				);
			}
			return handleLeaveError(error);
		}
	});

export const getLeaveRequestsForReviewFn = createServerFn({ method: "GET" })
	.middleware([leaveHrMiddleware])
	.handler(async () => {
		try {
			return await prisma.leaveRequest.findMany({
				include: {
					leave: { select: { code: true, name: true } },
					employee: {
						select: {
							emp_number: true,
							first_name: true,
							last_name: true,
							department: { select: { name: true } },
						},
					},
				},
				orderBy: [{ status: "asc" }, { created_at: "desc" }],
			});
		} catch (error) {
			return handleLeaveError(error);
		}
	});

export const reviewLeaveRequestFn = createServerFn({ method: "POST" })
	.middleware([leaveHrMiddleware])
	.validator(ReviewLeaveRequestSchema)
	.handler(async ({ context, data }) => {
		try {
			const result = await prisma.leaveRequest.updateMany({
				where: { id: data.id, status: "PENDING" },
				data: {
					status: data.decision,
					decision_note: data.decision_note || null,
					decided_at: new Date(),
					reviewed_by_user_id: context.userId,
				},
			});

			if (result.count !== 1) {
				throw new AppError(
					"Pengajuan tidak ditemukan atau sudah diputuskan.",
					"LEAVE_REQUEST_ALREADY_REVIEWED",
					409,
				);
			}

			return { success: true as const };
		} catch (error) {
			return handleLeaveError(error);
		}
	});
