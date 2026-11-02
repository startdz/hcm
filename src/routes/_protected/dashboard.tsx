import { createFileRoute } from "@tanstack/react-router";
import ActiveEmployees from "#/components/common/cards/active-employees";
import AttendanceOverviews from "#/components/common/cards/attendance-overviews";
import NewEmployees from "#/components/common/cards/new-employees";
import OverviewEmployees from "#/components/common/cards/overview-employees";
import PendingApprovals from "#/components/common/cards/pending-approvals";

export const Route = createFileRoute("/_protected/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className="space-y-4 sm:space-y-5 md:space-y-8">
			<div className="grid grid-cols-1 sm:gap-6 md:grid-cols-3 gap-4">
				<OverviewEmployees />
				<ActiveEmployees />
				<NewEmployees />
			</div>

			<AttendanceOverviews />
			<PendingApprovals />
		</section>
	);
}
