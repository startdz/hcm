import { z } from "zod";

const leaveCode = z
	.string()
	.trim()
	.min(1, "Kode cuti wajib diisi.")
	.max(30)
	.regex(/^[A-Za-z0-9_-]+$/, "Kode hanya boleh berisi huruf, angka, - dan _.")
	.transform((value) => value.toUpperCase());

export const LeaveTypeInputSchema = z.object({
	code: leaveCode,
	name: z.string().trim().min(1, "Nama cuti wajib diisi.").max(100),
	description: z.string().trim().max(255).nullable(),
	default_days: z.number().int().min(1).nullable(),
	is_paid: z.boolean(),
	requires_approval: z.boolean(),
	is_active: z.boolean(),
});

export const LeaveTypeIdSchema = z.object({
	id: z.uuid(),
});

const leaveDate = z.iso.date();

export const LeaveRequestInputSchema = z
	.object({
		leave_id: z.uuid(),
		start_date: leaveDate,
		end_date: leaveDate,
		reason: z.string().trim().min(1, "Alasan cuti wajib diisi.").max(1000),
	})
	.refine(({ start_date, end_date }) => start_date <= end_date, {
		message: "Tanggal selesai harus sama atau setelah tanggal mulai.",
		path: ["end_date"],
	});

export const UpdateLeaveRequestSchema = z
	.object({
		id: z.uuid(),
		leave_id: z.uuid(),
		start_date: leaveDate,
		end_date: leaveDate,
		reason: z.string().trim().min(1, "Alasan cuti wajib diisi.").max(1000),
	})
	.refine(({ start_date, end_date }) => start_date <= end_date, {
		message: "Tanggal selesai harus sama atau setelah tanggal mulai.",
		path: ["end_date"],
	});

export const ReviewLeaveRequestSchema = z.object({
	id: z.uuid(),
	decision: z.enum(["APPROVED", "REJECTED"]),
	decision_note: z.string().trim().max(1000).nullable(),
});

export const LeaveReportFilterSchema = z.object({
	period: z.enum(["daily", "weekly", "monthly", "yearly"]),
	date: leaveDate,
});

export type LeaveTypeInput = z.infer<typeof LeaveTypeInputSchema>;
export type LeaveRequestInput = z.infer<typeof LeaveRequestInputSchema>;
export type LeaveReportFilter = z.infer<typeof LeaveReportFilterSchema>;
