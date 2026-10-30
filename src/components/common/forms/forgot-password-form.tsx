import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useForgotPasswordForm } from "#/utils/forms/password.form";
import { errorState, invalidState } from "#/utils/helpers/form-helper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const ID_FORM = "forgot-password";
export function ForgotPasswordForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const {
		Field: Controller,
		onSubmit,
		Subscribe,
		isPending,
	} = useForgotPasswordForm();

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Lupa Password</CardTitle>
				</CardHeader>
				<CardContent>
					<form id={ID_FORM} onSubmit={onSubmit}>
						<FieldGroup>
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
										{invalidState(field) && (
											<FieldError errors={errorState(field)} />
										)}
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
													: "Dapatkan Kode OTP";

										return (
											<Field aria-invalid={DISABLED}>
												<Button variant={VARIANTS} type="submit" form={ID_FORM}>
													{LABELS}
												</Button>
											</Field>
										);
									}}
								</Subscribe>
								<FieldDescription className="text-center">
									Sudah Punya Akun ? <Link to="/">Masuk</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
