import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	EmployeeLeaveRequests,
	HrLeaveRequestReview,
} from "#/components/containers/leaves/leave-requests";
import {
	getAvailableLeaveTypesFn,
	getLeaveRequestsForReviewFn,
	getMyLeaveRequestsFn,
} from "#/utils/services/leaves/service.leave";

export const Route = createFileRoute("/_protected/attendance/leaves")({
	beforeLoad: ({ context }) => {
		const roles = context.auth?.user?.roles ?? [];
		if (!roles.some((role) => ["HR_MANAGER", "EMPLOYEE"].includes(role))) {
			throw redirect({ to: "/dashboard" });
		}
	},
	loader: async ({ context }) => {
		const roles = context.auth?.user?.roles ?? [];
		if (roles.includes("HR_MANAGER")) {
			return {
				mode: "review" as const,
				requests: await getLeaveRequestsForReviewFn(),
			};
		}

		const [requests, leaveTypes] = await Promise.all([
			getMyLeaveRequestsFn(),
			getAvailableLeaveTypesFn(),
		]);
		return { mode: "self" as const, requests, leaveTypes };
	},
	component: LeaveRequestsPage,
});

function LeaveRequestsPage() {
	const data = Route.useLoaderData();
	if (data.mode === "review") {
		return <HrLeaveRequestReview requests={data.requests} />;
	}

	return (
		<EmployeeLeaveRequests
			requests={data.requests}
			leaveTypes={data.leaveTypes}
		/>
	);
}
