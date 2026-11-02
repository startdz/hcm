import { createFileRoute, redirect } from "@tanstack/react-router";
import { EmployeeManagement } from "#/components/containers/employees/employee-management";
import { getEmployeesFn } from "#/utils/services/employees/service.employee";

export const Route = createFileRoute("/_protected/employees")({
	beforeLoad: ({ context }) => {
		const roles = context.auth?.user?.roles ?? [];
		if (!roles.some((role) => ["SUPERADMIN", "ADMIN"].includes(role))) {
			throw redirect({ to: "/dashboard" });
		}
	},
	loader: () => getEmployeesFn(),
	component: EmployeeManagement,
});
