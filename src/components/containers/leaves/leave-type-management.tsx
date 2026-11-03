import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
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
import type { LeaveTypeInput } from "#/schemas/schema.leave";
import type { getLeaveTypesFn } from "#/utils/services/leaves/service.leave";
import {
	archiveLeaveTypeFn,
	createLeaveTypeFn,
	updateLeaveTypeFn,
} from "#/utils/services/leaves/service.leave";
import { Route } from "@/routes/_protected/masters/leaves";

type LeaveType = Awaited<ReturnType<typeof getLeaveTypesFn>>[number];

const EMPTY_FORM: LeaveTypeInput = {
	code: "",
	name: "",
	description: "",
	default_days: null,
	is_paid: true,
	requires_approval: true,
	is_active: true,
};

export function LeaveTypeManagement() {
	const router = useRouter();
	const leaveTypes = Route.useLoaderData();
	const [form, setForm] = useState<LeaveTypeInput>(EMPTY_FORM);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	function startCreate() {
		setEditingId(null);
		setForm(EMPTY_FORM);
		setErrorMessage(null);
		setIsFormOpen(true);
	}

	function startEdit(leaveType: LeaveType) {
		setEditingId(leaveType.id);
		setForm({
			code: leaveType.code,
			name: leaveType.name,
			description: leaveType.description ?? "",
			default_days: leaveType.default_days,
			is_paid: leaveType.is_paid,
			requires_approval: leaveType.requires_approval,
			is_active: leaveType.is_active,
		});
		setErrorMessage(null);
		setIsFormOpen(true);
	}

	async function saveLeaveType(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSaving(true);
		setErrorMessage(null);
		try {
			const values = {
				...form,
				description: form.description?.trim() || null,
			};
			if (editingId) {
				await updateLeaveTypeFn({ data: { id: editingId, ...values } });
				toast.add({
					type: "success",
					title: "Jenis Cuti Berhasil Diperbarui",
					description: "Perubahan master jenis cuti telah disimpan.",
				});
			} else {
				await createLeaveTypeFn({ data: values });
				toast.add({
					type: "success",
					title: "Jenis Cuti Berhasil Ditambahkan",
					description: "Jenis cuti baru telah disimpan.",
				});
			}
			setIsFormOpen(false);
			setForm(EMPTY_FORM);
			setEditingId(null);
			await router.invalidate();
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Terjadi kesalahan saat menyimpan jenis cuti.";
			setErrorMessage(message);
			toast.add({
				type: "error",
				title: "Gagal Menyimpan Jenis Cuti",
				description: message,
			});
		} finally {
			setIsSaving(false);
		}
	}

	async function archiveLeaveType(leaveType: LeaveType) {
		if (!window.confirm(`Arsipkan jenis cuti ${leaveType.name}?`)) return;
		setBusyId(leaveType.id);
		setErrorMessage(null);
		try {
			await archiveLeaveTypeFn({ data: { id: leaveType.id } });
			toast.add({
				type: "success",
				title: "Jenis Cuti Diarsipkan",
				description: `${leaveType.name} tidak lagi tersedia untuk pengajuan baru.`,
			});
			await router.invalidate();
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Terjadi kesalahan saat mengarsipkan jenis cuti.";
			setErrorMessage(message);
			toast.add({
				type: "error",
				title: "Gagal Mengarsipkan Jenis Cuti",
				description: message,
			});
		} finally {
			setBusyId(null);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold">Master Jenis Cuti</h1>
					<p className="text-sm text-muted-foreground">
						Kelola jenis cuti yang tersedia untuk pengajuan karyawan.
					</p>
				</div>
				<Button onClick={startCreate}>Tambah Jenis Cuti</Button>
			</div>

			{errorMessage && (
				<p role="alert" className="text-sm text-destructive">
					{errorMessage}
				</p>
			)}

			{isFormOpen && (
				<Card>
					<CardHeader>
						<CardTitle>
							{editingId ? "Ubah Jenis Cuti" : "Tambah Jenis Cuti"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={saveLeaveType} className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="leave-code">Kode</Label>
									<Input
										id="leave-code"
										required
										maxLength={30}
										value={form.code}
										onChange={(event) =>
											setForm({ ...form, code: event.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="leave-name">Nama</Label>
									<Input
										id="leave-name"
										required
										maxLength={100}
										value={form.name}
										onChange={(event) =>
											setForm({ ...form, name: event.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="default-days">Batas hari (opsional)</Label>
									<Input
										id="default-days"
										type="number"
										min={1}
										value={form.default_days ?? ""}
										onChange={(event) =>
											setForm({
												...form,
												default_days: event.target.value
													? Number(event.target.value)
													: null,
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="leave-description">Deskripsi</Label>
									<Textarea
										id="leave-description"
										maxLength={255}
										value={form.description ?? ""}
										onChange={(event) =>
											setForm({ ...form, description: event.target.value })
										}
									/>
								</div>
							</div>
							<div className="flex flex-wrap gap-5">
								<label className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={form.is_paid}
										onChange={(event) =>
											setForm({ ...form, is_paid: event.target.checked })
										}
									/>
									Cuti dibayar
								</label>
								<label className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={form.requires_approval}
										onChange={(event) =>
											setForm({
												...form,
												requires_approval: event.target.checked,
											})
										}
									/>
									Memerlukan persetujuan
								</label>
								<label className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={form.is_active}
										onChange={(event) =>
											setForm({ ...form, is_active: event.target.checked })
										}
									/>
									Aktif
								</label>
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={isSaving}>
									{isSaving ? "Menyimpan..." : "Simpan"}
								</Button>
								<Button
									type="button"
									variant="outline"
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
								<TableHead>Kode</TableHead>
								<TableHead>Nama</TableHead>
								<TableHead>Batas hari</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{leaveTypes.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="h-24 text-center text-muted-foreground"
									>
										Belum ada jenis cuti.
									</TableCell>
								</TableRow>
							) : (
								leaveTypes.map((leaveType) => (
									<TableRow key={leaveType.id}>
										<TableCell>{leaveType.code}</TableCell>
										<TableCell>{leaveType.name}</TableCell>
										<TableCell>{leaveType.default_days ?? "-"}</TableCell>
										<TableCell>
											{leaveType.is_active ? "Aktif" : "Diarsipkan"}
										</TableCell>
										<TableCell>
											<div className="flex justify-end gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => startEdit(leaveType)}
												>
													Ubah
												</Button>
												{leaveType.is_active && (
													<Button
														variant="destructive"
														size="sm"
														disabled={busyId === leaveType.id}
														onClick={() => archiveLeaveType(leaveType)}
													>
														{busyId === leaveType.id
															? "Mengarsipkan..."
															: "Arsipkan"}
													</Button>
												)}
											</div>
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
