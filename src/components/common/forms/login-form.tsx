import { cn } from "cn";
import { useLoginForm } from "#/utils/forms/login.form";
import { errorState, invalidState } from "#/utils/helpers/form-helper";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "../../ui/input-group";

const ID_FORM = "login-form";
export function LoginForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const { Field: Controller, onSubmit, Subscribe, isPending } = useLoginForm();
	return (
		<form
			id={ID_FORM}
			onSubmit={onSubmit}
			className={cn("flex flex-col gap-6", className)}
			{...props}
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Masuk Akun Anda</h1>
					<p className="text-sm text-balance text-muted-foreground">
						Masuk ke akun Anda menggunakan Email Kantor untuk Mengakses HCM
						Monitor
					</p>
				</div>
				<Controller
					name="email"
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
							<FieldLabel htmlFor={field.name}>Email</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								placeholder="Masukkan Email Anda."
								data-invalid={invalidState(field)}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								autoComplete="off"
							/>
							{invalidState(field) && <FieldError errors={errorState(field)} />}
						</Field>
					)}
				</Controller>

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
							<div className="flex items-center">
								<FieldLabel htmlFor="password">Password</FieldLabel>
								<a
									href="/forgot-password"
									className="ml-auto text-sm underline-offset-4 hover:underline"
								>
									Forgot your password?
								</a>
							</div>
							<InputGroup className="input-group">
								<InputGroupInput
									id={field.name}
									name={field.name}
									type="password"
									placeholder="Masukkan Password Anda."
									data-invalid={invalidState(field)}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="off"
								/>
							</InputGroup>
							{invalidState(field) && <FieldError errors={errorState(field)} />}
						</Field>
					)}
				</Controller>
				<Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
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
									: "Masuk";

						return (
							<Field aria-invalid={DISABLED}>
								<Button variant={VARIANTS} type="submit" form={ID_FORM}>
									{LABELS}
								</Button>
							</Field>
						);
					}}
				</Subscribe>
			</FieldGroup>
		</form>
	);
}
