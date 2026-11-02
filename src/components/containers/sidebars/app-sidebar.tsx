import {
	RiBuilding2Line,
	RiBuildingLine,
	RiCalendarCheckLine,
	RiDashboardLine,
	RiDatabase2Line,
	RiFileList3Line,
	RiFolderUserLine,
	RiGroupLine,
	RiMoneyDollarCircleLine,
	RiOrganizationChart,
	RiSettings3Line,
	RiShieldUserLine,
	RiUserLine,
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

const data = {
	user: {
		name: "Fuad Jabbar Dzakwan",
		email: "fuad@example.com",
		avatar: "/avatars/default.jpg",
	},

	teams: [
		{
			name: "PT. Induk Group",
			logo: RiBuilding2Line,
			plan: "Head Office",
		},
		{
			name: "PT. Child First, Tbk.",
			logo: RiBuildingLine,
			plan: "Subsidiary",
		},
		{
			name: "PT. Child Second, Tbk.",
			logo: RiBuildingLine,
			plan: "Subsidiary",
		},
	],

	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: RiDashboardLine,
			isActive: true,
			items: [
				{
					title: "Overview",
					url: "/dashboard",
				},
				{
					title: "Riwayat",
					url: "/history",
				},
			],
		},
		{
			title: "Kepegawaian",
			url: "/employees",
			icon: RiGroupLine,
			items: [
				{
					title: "Data Karyawan",
					url: "/employees",
				},
				{
					title: "Tambah Karyawan",
					url: "/employees",
				},
				{
					title: "Onboarding",
					url: "/employees/onboarding",
				},
				{
					title: "Mutasi Karyawan",
					url: "/employees/mutations",
				},
				{
					title: "Riwayat Kepegawaian",
					url: "/employees/histories",
				},
			],
		},
		{
			title: "Organisasi",
			url: "/organization",
			icon: RiOrganizationChart,
			items: [
				{
					title: "Perusahaan",
					url: "/organization/companies",
				},
				{
					title: "Cabang",
					url: "/organization/branches",
				},
				{
					title: "Departemen",
					url: "/organization/departments",
				},
				{
					title: "Jabatan",
					url: "/organization/positions",
				},
				{
					title: "Struktur Organisasi",
					url: "/organization/structure",
				},
			],
		},
		{
			title: "Kehadiran",
			url: "/attendance",
			icon: RiCalendarCheckLine,
			items: [
				{
					title: "Data Kehadiran",
					url: "/attendance",
				},
				{
					title: "Rekap Kehadiran",
					url: "/attendance/recap",
				},
				{
					title: "Jadwal Kerja",
					url: "/attendance/schedules",
				},
				{
					title: "Shift Kerja",
					url: "/attendance/shifts",
				},
				{
					title: "Pengajuan Izin",
					url: "/attendance/permissions",
				},
				{
					title: "Pengajuan Cuti",
					url: "/attendance/leaves",
				},
			],
		},
		{
			title: "Penggajian",
			url: "/payroll",
			icon: RiMoneyDollarCircleLine,
			items: [
				{
					title: "Komponen Gaji",
					url: "/payroll/components",
				},
				{
					title: "Periode Penggajian",
					url: "/payroll/periods",
				},
				{
					title: "Proses Penggajian",
					url: "/payroll/process",
				},
				{
					title: "Slip Gaji",
					url: "/payroll/payslips",
				},
			],
		},
		{
			title: "Administrasi",
			url: "/administration",
			icon: RiFolderUserLine,
			items: [
				{
					title: "Manajemen User",
					url: "/administration/users",
				},
				{
					title: "Undangan User",
					url: "/administration/invitations",
				},
				{
					title: "Role",
					url: "/administration/roles",
				},
				{
					title: "Permission",
					url: "/administration/permissions",
				},
				{
					title: "Session",
					url: "/administration/sessions",
				},
			],
		},
		{
			title: "Laporan",
			url: "/reports",
			icon: RiFileList3Line,
			items: [
				{
					title: "Laporan Karyawan",
					url: "/reports/employees",
				},
				{
					title: "Laporan Kehadiran",
					url: "/reports/attendance",
				},
				{
					title: "Laporan Penggajian",
					url: "/reports/payroll",
				},
			],
		},
		{
			title: "Pengaturan",
			url: "/settings",
			icon: RiSettings3Line,
			items: [
				{
					title: "Profil Saya",
					url: "/settings/profile",
				},
				{
					title: "Pengaturan Akun",
					url: "/settings/account",
				},
				{
					title: "Keamanan",
					url: "/settings/security",
				},
				{
					title: "Preferensi",
					url: "/settings/preferences",
				},
			],
		},
	],

	projects: [
		{
			name: "Data Master",
			url: "/masters",
			icon: RiDatabase2Line,
		},
		{
			name: "Employee Self Service",
			url: "/ess",
			icon: RiUserLine,
		},
		{
			name: "Approval Center",
			url: "/approvals",
			icon: RiShieldUserLine,
		},
	],
};

export default data;

import { useRouteContext } from "@tanstack/react-router";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useRouteContext({ from: "/_protected" });
	const canManageEmployees = user.roles.some((role) =>
		["SUPERADMIN", "ADMIN"].includes(role),
	);
	const navMain = canManageEmployees
		? data.navMain
		: data.navMain.filter((item) => item.title !== "Kepegawaian");

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navMain} />
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
