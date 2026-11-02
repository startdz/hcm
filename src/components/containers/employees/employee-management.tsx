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
import type { EmployeeInput } from "#/schemas/schema.employee";
import {
	createEmployeeFn,
	deleteEmployeeFn,
	type getEmployeesFn,
	updateEmployeeFn,
} from "#/utils/services/employees/service.employee";
import { Route } from "#/routes/_protected/employees";

type EmployeeRow = Awaited<
	ReturnType<typeof getEmployeesFn>
>["employees"][number];
type EmployeeFormValues = EmployeeInput;

const EMPTY_FORM: EmployeeFormValues = {
	emp_number: "",
	first_name: "",
	last_name: "",
	status: "ACTIVE",
	department_id: null,
};

const statusLabels: Record<EmployeeFormValues["status"], string> = {
	ACTIVE: "Aktif",
	INACTIVE: "Tidak aktif",
	TERMINATED: "Berhenti",
	MUTATED: "Mutasi",
};

export function EmployeeManagement() {
	const router = useRouter();
	const { employees, departments } = Route.useLoaderData();
	const [form, setForm] = useState<EmployeeFormValues>(EMPTY_FORM);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [busyEmployeeId, setBusyEmployeeId] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	function startCreate() {
		setEditingId(null);
		setForm(EMPTY_FORM);
		setErrorMessage(null);
		setIsFormOpen(true);
	}

	function startEdit(employee: EmployeeRow) {
		setEditingId(employee.id);
		setForm({
			emp_number: employee.emp_number,
			first_name: employee.first_name,
			last_name: employee.last_name ?? "",
			status: employee.status,
			department_id: employee.department_id,
		});
		setErrorMessage(null);
		setIsFormOpen(true);
	}

	async function saveEmployee(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSaving(true);
		setErrorMessage(null);

		try {
			const values = {
				...form,
				last_name: form.last_name?.trim() || null,
			};
			if (editingId) {
				await updateEmployeeFn({ data: { id: editingId, ...values } });
			} else {
				await createEmployeeFn({ data: values });
			}
			setIsFormOpen(false);
			setForm(EMPTY_FORM);
			setEditingId(null);
			await router.invalidate();
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Terjadi kesalahan saat menyimpan data karyawan.",
			);
		} finally {
			setIsSaving(false);
		}
	}

	async function removeEmployee(employee: EmployeeRow) {
		if (
			!window.confirm(
				`Hapus karyawan ${employee.first_name} ${employee.last_name ?? ""}?`,
			)
		) {
			return;
		}

		setBusyEmployeeId(employee.id);
		setErrorMessage(null);
		try {
			await deleteEmployeeFn({ data: { id: employee.id } });
			await router.invalidate();
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Terjadi kesalahan saat menghapus data karyawan.",
			);
		} finally {
			setBusyEmployeeId(null);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold">Data Karyawan</h1>
					<p className="text-sm text-muted-foreground">
						Kelola data karyawan perusahaan.
					</p>
				</div>
				<Button onClick={startCreate}>Tambah Karyawan</Button>
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
							{editingId ? "Ubah Data Karyawan" : "Tambah Karyawan"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={saveEmployee} className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="emp_number">Nomor Karyawan</Label>
									<Input
										id="emp_number"
										required
										maxLength={35}
										value={form.emp_number}
										onChange={(event) =>
											setForm({ ...form, emp_number: event.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="first_name">Nama Depan</Label>
									<Input
										id="first_name"
										required
										maxLength={100}
										value={form.first_name}
										onChange={(event) =>
											setForm({ ...form, first_name: event.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="last_name">Nama Belakang</Label>
									<Input
										id="last_name"
										maxLength={100}
										value={form.last_name ?? ""}
										onChange={(event) =>
											setForm({ ...form, last_name: event.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="department_id">Departemen</Label>
									<select
										id="department_id"
										className="h-8 w-full rounded-2xl border border-input bg-input/50 px-2.5 text-sm"
										value={form.department_id ?? ""}
										onChange={(event) =>
											setForm({
												...form,
												department_id: event.target.value || null,
											})
										}
									>
										<option value="">Tanpa departemen</option>
										{departments.map((department) => (
											<option key={department.id} value={department.id}>
												{department.name}
											</option>
										))}
									</select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="status">Status</Label>
									<select
										id="status"
										className="h-8 w-full rounded-2xl border border-input bg-input/50 px-2.5 text-sm"
										value={form.status}
										onChange={(event) =>
											setForm({
												...form,
												status: event.target
													.value as EmployeeFormValues["status"],
											})
										}
									>
										{Object.entries(statusLabels).map(([value, label]) => (
											<option key={value} value={value}>
												{label}
											</option>
										))}
									</select>
								</div>
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
								<TableHead>Nomor</TableHead>
								<TableHead>Nama</TableHead>
								<TableHead>Departemen</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{employees.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="h-24 text-center text-muted-foreground"
									>
										Belum ada data karyawan.
									</TableCell>
								</TableRow>
							) : (
								employees.map((employee) => (
									<TableRow key={employee.id}>
										<TableCell>{employee.emp_number}</TableCell>
										<TableCell>
											{employee.first_name} {employee.last_name}
										</TableCell>
										<TableCell>{employee.department?.name ?? "-"}</TableCell>
										<TableCell>{statusLabels[employee.status]}</TableCell>
										<TableCell>
											<div className="flex justify-end gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => startEdit(employee)}
												>
													Ubah
												</Button>
												<Button
													variant="destructive"
													size="sm"
													disabled={busyEmployeeId === employee.id}
													onClick={() => removeEmployee(employee)}
												>
													{busyEmployeeId === employee.id
														? "Menghapus..."
														: "Hapus"}
												</Button>
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
