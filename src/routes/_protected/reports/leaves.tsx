import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { LeaveReport } from "#/components/containers/reports/leave-report";
import { getLeaveReportFn } from "#/utils/services/leaves/service.leave";

function getJakartaDate() {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

const SearchSchema = z.object({
	period: z.enum(["daily", "weekly", "monthly", "yearly"]).catch("monthly"),
	date: z.iso.date().catch(getJakartaDate()),
});

export const Route = createFileRoute("/_protected/reports/leaves")({
	validateSearch: SearchSchema,
	beforeLoad: ({ context }) => {
		const roles = context.auth?.user?.roles ?? [];
		if (
			!roles.some((role) =>
				["HR_MANAGER", "ADMIN", "SUPERADMIN"].includes(role),
			)
		) {
			throw redirect({ to: "/dashboard" });
		}
	},
	loaderDeps: ({ search }) => ({
		period: search.period,
		date: search.date,
	}),
	loader: ({ deps }) => getLeaveReportFn({ data: deps }),
	component: LeaveReport,
});
