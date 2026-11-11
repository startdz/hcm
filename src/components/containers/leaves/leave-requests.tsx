import { useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
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
import { Textarea } from "#/components/ui/textarea";
import { toast } from "#/components/ui/toast";
import type { LeaveRequestInput } from "#/schemas/schema.leave";
import type {
	getAvailableLeaveTypesFn,
	getLeaveRequestsForReviewFn,
	getMyLeaveRequestsFn,
} from "#/utils/services/leaves/service.leave";
import {
	createMyLeaveRequestFn,
	reviewLeaveRequestFn,
	updateMyConflictedLeaveRequestFn,
} from "#/utils/services/leaves/service.leave";

type OwnRequests = Awaited<ReturnType<typeof getMyLeaveRequestsFn>>;
type ReviewRequests = Awaited<ReturnType<typeof getLeaveRequestsForReviewFn>>;
type LeaveOption = Awaited<ReturnType<typeof getAvailableLeaveTypesFn>>[number];

const EMPTY_FORM: LeaveRequestInput = {
	leave_id: "",
	start_date: "",
	end_date: "",
	reason: "",
};

function formatDate(value: Date | string) {
	return new Date(value).toLocaleDateString("id-ID", {
		dateStyle: "medium",
		timeZone: "UTC",
	});
}

const requestStatusLabels = {
	PENDING: "Menunggu",
	APPROVED: "Disetujui",
	REJECTED: "Ditolak",
};

export function EmployeeLeaveRequests({
	requests,
	leaveTypes,
}: {
	requests: OwnRequests;
	leaveTypes: LeaveOption[];
}) {
	const router = useRouter();
	const [form, setForm] = useState<LeaveRequestInput>(EMPTY_FORM);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	function startEdit(request: OwnRequests[number]) {
		setEditingId(request.id);
		setForm({
			leave_id: request.leave_id,
			start_date: new Date(request.start_date).toISOString().slice(0, 10),
			end_date: new Date(request.end_date).toISOString().slice(0, 10),
			reason: request.reason,
		});
		setErrorMessage(null);
		setIsFormOpen(true);
	}

	async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSaving(true);
		setErrorMessage(null);
		try {
			if (editingId) {
				await updateMyConflictedLeaveRequestFn({
					data: { id: editingId, ...form },
				});
				toast.add({
					type: "success",
					title: "Pengajuan Cuti Diperbarui",
					description: "Bentrok jadwal berhasil diselesaikan.",
				});
			} else {
				await createMyLeaveRequestFn({ data: form });
				toast.add({
					type: "success",
					title: "Pengajuan Cuti Terkirim",
					description: "Pengajuan cuti Anda menunggu tinjauan HR.",
				});
			}
			setIsFormOpen(false);
			setEditingId(null);
			setForm(EMPTY_FORM);
			await router.invalidate();
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Terjadi kesalahan saat mengirim pengajuan.";
			setErrorMessage(message);
			toast.add({
				type: "error",
				title: editingId
					? "Gagal Memperbarui Pengajuan"
					: "Gagal Mengajukan Cuti",
				description: message,
			});
		} finally {
			setIsSaving(false);
		}
	}

	const itemLeaves = useMemo(() => {
		return leaveTypes?.map((item) => ({
			label: item.name,
			value: item.id,
		}));
	}, [leaveTypes]);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold">Pengajuan Cuti Saya</h1>
					<p className="text-sm text-muted-foreground">
						Pengajuan hanya dapat dilihat dan dibuat untuk akun Anda sendiri.
					</p>
				</div>
				<Button
					disabled={leaveTypes.length === 0}
					onClick={() => {
						setEditingId(null);
						setForm(EMPTY_FORM);
						setErrorMessage(null);
						setIsFormOpen(true);
					}}
				>
					Ajukan Cuti
				</Button>
			</div>

			{leaveTypes.length === 0 && (
				<p className="text-sm text-muted-foreground">
					Belum ada jenis cuti aktif yang dapat diajukan.
				</p>
			)}
			{errorMessage && (
				<p role="alert" className="text-sm text-destructive">
					{errorMessage}
				</p>
			)}

			{isFormOpen && (
				<Card>
					<CardHeader>
						<CardTitle>
							{editingId ? "Ubah Pengajuan Bentrok" : "Ajukan Cuti"}
						</CardTitle>
						{editingId && (
							<p className="text-sm text-muted-foreground">
								Perubahan harus menghilangkan bentrok dengan pengajuan karyawan
								lain.
							</p>
						)}
					</CardHeader>
					<CardContent>
						<form onSubmit={submitRequest} className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Field>
										<FieldLabel>Jenis Cuti</FieldLabel>
										<Select
											items={itemLeaves}
											onValueChange={(value) =>
												setForm({ ...form, leave_id: value as string })
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Pilih Cuti" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>Pilih Jenis Cuti</SelectLabel>
													{form.leave_id &&
														!itemLeaves.some(
															(leaveType) => leaveType.value === form.leave_id,
														) && (
															<SelectItem value={form.leave_id}>
																Jenis cuti saat ini (diarsipkan)
															</SelectItem>
														)}
													{itemLeaves?.map((item) => (
														<SelectItem key={item.value} value={item.value}>
															{item.label}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
									</Field>
								</div>
								<div className="space-y-2">
									<Field>
										<FieldLabel htmlFor="request-start-date">
											Tanggal Mulai
										</FieldLabel>
										<Input
											id="request-start-date"
											type="date"
											required
											value={form.start_date}
											onChange={(event) =>
												setForm({ ...form, start_date: event.target.value })
											}
										/>
									</Field>
								</div>
								<div className="space-y-2">
									<Field>
										<FieldLabel htmlFor="request-end-date">
											Tanggal Selesai
										</FieldLabel>
										<Input
											id="request-end-date"
											type="date"
											required
											value={form.end_date}
											onChange={(event) =>
												setForm({ ...form, end_date: event.target.value })
											}
										/>
									</Field>
								</div>
								<div className="space-y-2 sm:col-span-2">
									<Field>
										<FieldLabel htmlFor="request-reason">Alasan</FieldLabel>
										<Textarea
											id="request-reason"
											required
											placeholder="Tulis Alasan Cuti"
											maxLength={1000}
											value={form.reason}
											onChange={(event) =>
												setForm({ ...form, reason: event.target.value })
											}
										/>
									</Field>
								</div>
							</div>
							<div className="flex gap-2">
								<Button className="min-w-24" type="submit" disabled={isSaving}>
									{isSaving ? "Mengirim..." : editingId ? "Simpan" : "Kirim"}
								</Button>
								<Button
									type="button"
									variant="outline"
									className="min-w-24"
									disabled={isSaving}
									onClick={() => setIsFormOpen(false)}
								>
									Batal
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardContent className="pt-5">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Jenis Cuti</TableHead>
								<TableHead>Tanggal</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Bentrok</TableHead>
								<TableHead className="text-right">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{requests.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="h-24 text-center text-muted-foreground"
									>
										Belum ada pengajuan cuti.
									</TableCell>
								</TableRow>
							) : (
								requests.map((request) => (
									<TableRow key={request.id}>
										<TableCell>{request.leave.name}</TableCell>
										<TableCell>
											{formatDate(request.start_date)} -{" "}
											{formatDate(request.end_date)}
										</TableCell>
										<TableCell>{requestStatusLabels[request.status]}</TableCell>
										<TableCell>
											{request.hasConflict ? "Bentrok" : "-"}
										</TableCell>
										<TableCell>
											{request.status === "PENDING" && request.hasConflict && (
												<Button
													variant="destructive"
													size="sm"
													onClick={() => startEdit(request)}
												>
													Selesaikan Bentrok
												</Button>
											)}
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

export function HrLeaveRequestReview({
	requests,
}: {
	requests: ReviewRequests;
}) {
	const router = useRouter();
	const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>(
		{},
	);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	async function review(id: string, decision: "APPROVED" | "REJECTED") {
		setBusyId(id);
		setErrorMessage(null);
		try {
			await reviewLeaveRequestFn({
				data: {
					id,
					decision,
					decision_note: decisionNotes[id]?.trim() || null,
				},
			});
			toast.add({
				type: "success",
				title:
					decision === "APPROVED"
						? "Pengajuan Cuti Disetujui"
						: "Pengajuan Cuti Ditolak",
				description: "Keputusan telah disimpan.",
			});
			await router.invalidate();
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Terjadi kesalahan saat memutuskan pengajuan.";
			setErrorMessage(message);
			toast.add({
				type: "error",
				title: "Gagal Memproses Pengajuan",
				description: message,
			});
		} finally {
			setBusyId(null);
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Persetujuan Pengajuan Cuti</h1>
				<p className="text-sm text-muted-foreground">
					Hanya HR Manager yang dapat membaca dan memutuskan pengajuan karyawan.
				</p>
			</div>
			{errorMessage && (
				<p role="alert" className="text-sm text-destructive">
					{errorMessage}
				</p>
			)}
			<Card>
				<CardContent className="pt-5">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Karyawan</TableHead>
								<TableHead>Jenis Cuti</TableHead>
								<TableHead>Tanggal</TableHead>
								<TableHead>Alasan</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Catatan Keputusan</TableHead>
								<TableHead>Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{requests.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className="h-24 text-center text-muted-foreground"
									>
										Belum ada pengajuan cuti.
									</TableCell>
								</TableRow>
							) : (
								requests.map((request) => (
									<TableRow key={request.id}>
										<TableCell>
											<div>
												<p>
													{request.employee.first_name}{" "}
													{request.employee.last_name}
												</p>
												<p className="text-xs text-muted-foreground">
													{request.employee.emp_number}
													{request.employee.department?.name
														? ` · ${request.employee.department.name}`
														: ""}
												</p>
											</div>
										</TableCell>
										<TableCell>{request.leave.name}</TableCell>
										<TableCell>
											{formatDate(request.start_date)} -{" "}
											{formatDate(request.end_date)}
										</TableCell>
										<TableCell>{request.reason}</TableCell>
										<TableCell>{requestStatusLabels[request.status]}</TableCell>
										<TableCell>
											{request.status === "PENDING" ? (
												<Input
													aria-label={`Catatan untuk ${request.employee.first_name}`}
													maxLength={1000}
													placeholder="Tulis Keputusan"
													value={decisionNotes[request.id] ?? ""}
													onChange={(event) =>
														setDecisionNotes({
															...decisionNotes,
															[request.id]: event.target.value,
														})
													}
												/>
											) : (
												(request.decision_note ?? "-")
											)}
										</TableCell>
										<TableCell>
											{request.status === "PENDING" && (
												<div className="flex gap-2">
													<Button
														size="sm"
														disabled={busyId === request.id}
														onClick={() => review(request.id, "APPROVED")}
													>
														Setujui
													</Button>
													<Button
														variant="destructive"
														size="sm"
														disabled={busyId === request.id}
														onClick={() => review(request.id, "REJECTED")}
													>
														Tolak
													</Button>
												</div>
											)}
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
