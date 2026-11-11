import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { toast } from "#/components/ui/toast";
import type { getLeaveReportFn } from "#/utils/services/leaves/service.leave";
import { Route } from "@/routes/_protected/reports/leaves";

type ReportData = Awaited<ReturnType<typeof getLeaveReportFn>>;
type Period = ReportData["period"];

const periodLabels: Record<Period, string> = {
	daily: "Harian",
	weekly: "Mingguan",
	monthly: "Bulanan",
	yearly: "Tahunan",
};

const statusLabels = {
	PENDING: "Menunggu",
	APPROVED: "Disetujui",
	REJECTED: "Ditolak",
};

function formatDate(value: Date | string) {
	return new Date(value).toLocaleDateString("id-ID", {
		dateStyle: "medium",
		timeZone: "UTC",
	});
}

function csvCell(value: string | number | boolean | null | undefined) {
	let text = value == null ? "" : String(value);
	if (/^[\t\r ]*[=+\-@]/.test(text)) text = `'${text}`;
	return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(report: ReportData) {
	const rows: (string | number | boolean | null | undefined)[][] = [
		["Laporan Pengajuan Cuti"],
		["Periode", periodLabels[report.period]],
		["Rentang tanggal cuti", `${report.startDate} - ${report.endDate}`],
		[],
		["Total", report.summary.total],
		["Menunggu", report.summary.pending],
		["Disetujui", report.summary.approved],
		["Ditolak", report.summary.rejected],
		[],
		[
			"No. Karyawan",
			"Nama Karyawan",
			"Departemen",
			"Kode Cuti",
			"Jenis Cuti",
			"Cuti Dibayar",
			"Tanggal Mulai",
			"Tanggal Selesai",
			"Status",
			"Alasan",
			"Catatan Keputusan",
			"Reviewer",
			"Tanggal Pengajuan",
			"Tanggal Keputusan",
		],
		...report.requests.map((request) => [
			request.employee.emp_number,
			[request.employee.first_name, request.employee.last_name]
				.filter(Boolean)
				.join(" "),
			request.employee.department?.name ?? "",
			request.leave.code,
			request.leave.name,
			request.leave.is_paid ? "Ya" : "Tidak",
			formatDate(request.start_date),
			formatDate(request.end_date),
			statusLabels[request.status],
			request.reason,
			request.decision_note ?? "",
			request.reviewed_by?.username ?? "",
			formatDate(request.created_at),
			request.decided_at ? formatDate(request.decided_at) : "",
		]),
	];
	const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `laporan-cuti-${report.period}-${report.startDate}-${report.endDate}.csv`;
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function LeaveReport() {
	const report = Route.useLoaderData();
	const search = Route.useSearch();
	const navigate = useNavigate({ from: "/reports/leaves" });
	const [isChangingFilter, setIsChangingFilter] = useState(false);

	async function changeFilter(period: Period, date = search.date) {
		setIsChangingFilter(true);
		try {
			await navigate({
				search: (previous) => ({ ...previous, period, date }),
			});
			toast.add({
				type: "success",
				title: "Filter Laporan Diperbarui",
				description: `Periode ${periodLabels[period].toLowerCase()} diterapkan.`,
			});
		} catch (error) {
			toast.add({
				type: "error",
				title: "Gagal Memperbarui Filter",
				description:
					error instanceof Error
						? error.message
						: "Terjadi kesalahan saat memuat laporan.",
			});
		} finally {
			setIsChangingFilter(false);
		}
	}

	const periodItems = Object.entries(periodLabels).map(([value, label]) => ({
		value,
		label,
	}));

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold">Laporan Cuti</h1>
					<p className="text-sm text-muted-foreground">
						Filter berdasarkan tanggal pelaksanaan cuti. Zona waktu: WIB.
					</p>
				</div>
				<Button
					onClick={() => {
						try {
							downloadCsv(report);
							toast.add({
								type: "success",
								title: "Laporan Berhasil Diunduh",
								description: "File CSV laporan cuti telah dibuat.",
							});
						} catch (error) {
							toast.add({
								type: "error",
								title: "Gagal Mengunduh Laporan",
								description:
									error instanceof Error
										? error.message
										: "Terjadi kesalahan saat membuat file CSV.",
							});
						}
					}}
				>
					Unduh CSV
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Filter Periode</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-wrap items-end gap-4">
					<div className="space-y-2">
						<Field>
							<FieldLabel
								htmlFor="leave-report-period"
								className="text-sm font-medium"
							>
								Periode
							</FieldLabel>
							<Select
								items={periodItems}
								onValueChange={(value) => changeFilter(value as Period)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Pilih Periode" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{Object.entries(periodLabels).map(([value, label]) => (
											<SelectItem key={value} value={value}>
												{label}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</Field>
					</div>
					<div className="space-y-2">
						<Field>
							<FieldLabel
								htmlFor="leave-report-date"
								className="text-sm font-medium"
							>
								Tanggal acuan
							</FieldLabel>
							<Input
								id="leave-report-date"
								type="date"
								className="h-8 rounded-2xl border border-input bg-input/50 px-2.5 text-sm"
								value={search.date}
								disabled={isChangingFilter}
								onChange={(event) => {
									if (event.target.value) {
										void changeFilter(search.period, event.target.value);
									}
								}}
							/>
						</Field>
					</div>
					<p className="pb-1 text-sm text-muted-foreground">
						Rentang: {report.startDate} - {report.endDate}
					</p>
				</CardContent>
			</Card>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{[
					["Total pengajuan", report.summary.total],
					["Menunggu", report.summary.pending],
					["Disetujui", report.summary.approved],
					["Ditolak", report.summary.rejected],
				].map(([label, count]) => (
					<Card key={label}>
						<CardHeader>
							<CardTitle className="text-sm text-muted-foreground">
								{label}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold">{count}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Pengajuan yang Beririsan dengan Periode</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>No. Karyawan</TableHead>
								<TableHead>Nama</TableHead>
								<TableHead>Departemen</TableHead>
								<TableHead>Jenis Cuti</TableHead>
								<TableHead>Tanggal Cuti</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Reviewer</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{report.requests.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className="h-24 text-center text-muted-foreground"
									>
										Tidak ada pengajuan yang beririsan dengan periode ini.
									</TableCell>
								</TableRow>
							) : (
								report.requests.map((request) => (
									<TableRow key={request.id}>
										<TableCell>{request.employee.emp_number}</TableCell>
										<TableCell>
											{request.employee.first_name} {request.employee.last_name}
										</TableCell>
										<TableCell>
											{request.employee.department?.name ?? "-"}
										</TableCell>
										<TableCell>{request.leave.name}</TableCell>
										<TableCell>
											{formatDate(request.start_date)} –{" "}
											{formatDate(request.end_date)}
										</TableCell>
										<TableCell>{statusLabels[request.status]}</TableCell>
										<TableCell>
											{request.reviewed_by?.username ?? "-"}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
