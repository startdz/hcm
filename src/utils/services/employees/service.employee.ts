import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";
import { Prisma } from "#/generated/prisma/client";
import {
	EmployeeIdSchema,
	EmployeeInputSchema,
} from "#/schemas/schema.employee";
import { AppError } from "#/utils/helpers/app-error";
import { employeeAdminMiddleware } from "#/utils/middlewares/middleware.employee-admin";

function handleEmployeeError(error: unknown): never {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === "P2002") {
			throw new AppError(
				"Nomor karyawan sudah digunakan.",
				"EMPLOYEE_NUMBER_EXISTS",
				409,
				{ cause: error },
			);
		}

		if (error.code === "P2025") {
			throw new AppError("Data karyawan tidak ditemukan.", "NOT_FOUND", 404, {
				cause: error,
			});
		}

		if (error.code === "P2003") {
			throw new AppError(
				"Departemen yang dipilih tidak valid.",
				"INVALID_DEPARTMENT",
				400,
				{
					cause: error,
				},
			);
		}
	}

	console.error("Employee operation failed:", error);
	throw new AppError(
		"Terjadi kesalahan saat memproses data karyawan.",
		"EMPLOYEE_OPERATION_FAILED",
		500,
		{ cause: error },
	);
}

export const getEmployeesFn = createServerFn({ method: "GET" })
	.middleware([employeeAdminMiddleware])
	.handler(async () => {
		try {
			const [employees, departments] = await Promise.all([
				prisma.employee.findMany({
					orderBy: [{ created_at: "desc" }, { first_name: "asc" }],
					include: {
						department: { select: { id: true, name: true } },
					},
				}),
				prisma.department.findMany({
					orderBy: [{ name: "asc" }],
					select: { id: true, name: true },
				}),
			]);

			return { employees, departments };
		} catch (error) {
			return handleEmployeeError(error);
		}
	});

export const createEmployeeFn = createServerFn({ method: "POST" })
	.middleware([employeeAdminMiddleware])
	.validator(EmployeeInputSchema)
	.handler(async ({ data }) => {
		try {
			return await prisma.employee.create({
				data: {
					...data,
					last_name: data.last_name || null,
				},
			});
		} catch (error) {
			return handleEmployeeError(error);
		}
	});

export const updateEmployeeFn = createServerFn({ method: "POST" })
	.middleware([employeeAdminMiddleware])
	.validator(EmployeeInputSchema.extend({ id: EmployeeIdSchema.shape.id }))
	.handler(async ({ data }) => {
		const { id, ...values } = data;

		try {
			return await prisma.employee.update({
				where: { id },
				data: {
					...values,
					last_name: values.last_name || null,
				},
			});
		} catch (error) {
			return handleEmployeeError(error);
		}
	});

export const deleteEmployeeFn = createServerFn({ method: "POST" })
	.middleware([employeeAdminMiddleware])
	.validator(EmployeeIdSchema)
	.handler(async ({ data }) => {
		try {
			await prisma.employee.delete({ where: { id: data.id } });
			return { success: true as const };
		} catch (error) {
			return handleEmployeeError(error);
		}
	});
