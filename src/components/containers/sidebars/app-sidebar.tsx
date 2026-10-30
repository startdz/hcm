import {
	RiAiAgentLine,
	RiBarChartLine,
	RiBookOpenLine,
	RiCommandLine,
	RiGalleryLine,
	RiLayout2Line,
	RiMapLine,
	RiRecordCircleLine,
	RiSettings2Line,
	RiSquareLine,
} from "@remixicon/react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

// This is sample data.
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Acme Inc",
			logo: RiGalleryLine,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: RiRecordCircleLine,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: RiCommandLine,
			plan: "Free",
		},
	],
	navMain: [
		{
			title: "Playground",
			url: "#",
			icon: RiSquareLine,
			isActive: true,
			items: [
				{
					title: "History",
					url: "#",
				},
				{
					title: "Starred",
					url: "#",
				},
				{
					title: "Settings",
					url: "#",
				},
			],
		},
		{
			title: "Models",
			url: "#",
			icon: RiAiAgentLine,
			items: [
				{
					title: "Genesis",
					url: "#",
				},
				{
					title: "Explorer",
					url: "#",
				},
				{
					title: "Quantum",
					url: "#",
				},
			],
		},
		{
			title: "Documentation",
			url: "#",
			icon: RiBookOpenLine,
			items: [
				{
					title: "Introduction",
					url: "#",
				},
				{
					title: "Get Started",
					url: "#",
				},
				{
					title: "Tutorials",
					url: "#",
				},
				{
					title: "Changelog",
					url: "#",
				},
			],
		},
		{
			title: "Settings",
			url: "#",
			icon: RiSettings2Line,
			items: [
				{
					title: "General",
					url: "#",
				},
				{
					title: "Team",
					url: "#",
				},
				{
					title: "Billing",
					url: "#",
				},
				{
					title: "Limits",
					url: "#",
				},
			],
		},
	],
	projects: [
		{
			name: "Design Engineering",
			url: "#",
			icon: RiLayout2Line,
		},
		{
			name: "Sales & Marketing",
			url: "#",
			icon: RiBarChartLine,
		},
		{
			name: "Travel",
			url: "#",
			icon: RiMapLine,
		},
	],
};

import { useRouteContext } from "@tanstack/react-router";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useRouteContext({ from: "/_protected" });

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavProjects projects={data.projects} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={{
						name: user.username,
						email: user.email,
						avatar: "", // belum ada kolom avatar
					}}
				/>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
