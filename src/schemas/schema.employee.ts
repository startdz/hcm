import { z } from "zod";

export const EmployeeInputSchema = z.object({
	emp_number: z.string().trim().min(1, "Nomor karyawan wajib diisi.").max(35),
	first_name: z.string().trim().min(1, "Nama depan wajib diisi.").max(100),
	last_name: z.string().trim().max(100).nullable(),
	status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED", "MUTATED"]),
	department_id: z.uuid().nullable(),
});

export const EmployeeIdSchema = z.object({
	id: z.uuid(),
});

export type EmployeeInput = z.infer<typeof EmployeeInputSchema>;
