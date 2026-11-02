import { createFileRoute, redirect } from "@tanstack/react-router";
import { LeaveTypeManagement } from "#/components/containers/leaves/leave-type-management";
import { getLeaveTypesFn } from "#/utils/services/leaves/service.leave";

export const Route = createFileRoute("/_protected/masters/leaves")({
	beforeLoad: ({ context }) => {
		const roles = context.auth?.user?.roles ?? [];
		if (!roles.some((role) => ["SUPERADMIN", "ADMIN"].includes(role))) {
			throw redirect({ to: "/dashboard" });
		}
	},
	loader: () => getLeaveTypesFn(),
	component: LeaveTypeManagement,
});
