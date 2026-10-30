import { RiEye2Line, RiEyeCloseLine } from "@remixicon/react";
import { cn } from "cn";
import { useState } from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "#/components/ui/input-group";
import { useResetPasswordForm } from "#/utils/forms/password.form";
import { errorState, invalidState } from "#/utils/helpers/form-helper";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";

const ID_FORM = "reset-password";
export function ResetPasswordForm({
	className,
	token,
	...props
}: React.ComponentProps<"form"> & { token: string }) {
	const [openPw, setOpenPw] = useState(false);

	const {
		Field: Controller,
		Subscribe,
		onSubmit,
		isPending,
	} = useResetPasswordForm(token);

	return (
		<form
			id={ID_FORM}
			className={cn("flex flex-col gap-6", className)}
			onSubmit={onSubmit}
			{...props}
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Buat Password Baru</h1>
				</div>
				<Controller
					name="password"
					validators={{
						onChangeAsyncDebounceMs: 1000,
						onChangeAsync: async (data) => {
							await new Promise((resolve) => setTimeout(resolve, 1000));
							if (data.value.includes("error")) return;
							return undefined;
						},
					}}
				>
					{(field) => (
						<Field aria-invalid={invalidState(field)}>
							<FieldLabel htmlFor={field.name}>Password Baru</FieldLabel>
							<InputGroup className="overflow-hidden">
								<InputGroupInput
									id={field.name}
									name={field.name}
									placeholder="Masukkan Password Baru"
									type={openPw ? "text" : "password"}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									data-invalid={invalidState(field)}
									onBlur={field.handleBlur}
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupButton onClick={() => setOpenPw((prev) => !prev)}>
										{openPw ? <RiEye2Line /> : <RiEyeCloseLine />}
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
							{invalidState(field) && <FieldError errors={errorState(field)} />}
						</Field>
					)}
				</Controller>

				<Controller
					name="confirm_password"
					validators={{
						onChangeAsyncDebounceMs: 1000,
						onChangeAsync: async (data) => {
							await new Promise((resolve) => setTimeout(resolve, 1000));
							if (data.value.includes("error")) return;
							return undefined;
						},
					}}
				>
					{(field) => (
						<Field aria-invalid={invalidState(field)}>
							<FieldLabel htmlFor={field.name}>Verifikasi Password</FieldLabel>
							<InputGroup className="overflow-hidden">
								<InputGroupInput
									id={field.name}
									name={field.name}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Verifikasi Password Baru"
									type={openPw ? "text" : "password"}
									onBlur={field.handleBlur}
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupButton onClick={() => setOpenPw((prev) => !prev)}>
										{openPw ? <RiEye2Line /> : <RiEyeCloseLine />}
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
						</Field>
					)}
				</Controller>

				<Field>
					<Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => {
							const DISABLED = isSubmitting || isPending || !canSubmit;
							const VARIANTS =
								isSubmitting || isPending
									? ("secondary" as const)
									: !canSubmit
										? ("destructive" as const)
										: ("default" as const);
							const LABELS =
								isSubmitting || isPending
									? "Tunggu Sebentar..."
									: !canSubmit
										? "Lengkapi Semua Field"
										: "Reset Password";

							return (
								<Field aria-invalid={DISABLED}>
									<Button variant={VARIANTS} type="submit" form={ID_FORM}>
										{LABELS}
									</Button>
								</Field>
							);
						}}
					</Subscribe>
				</Field>
			</FieldGroup>
		</form>
	);
}
