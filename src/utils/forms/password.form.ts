import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import {
	type ForgotPasswordInput,
	ForgotPasswordSchema,
} from "#/schemas/schema.forgot-password";
import {
	type ResetPasswordInput,
	ResetPasswordSchema,
} from "#/schemas/schema.reset-password";
import { useForgotPassword, useResetPassword } from "../hooks/hook.auth";

export const useForgotPasswordForm = () => {
	const { mutateAsync, isPending, isSuccess, error, reset } =
		useForgotPassword();

	const form = useForm({
		defaultValues: { email: "" } satisfies ForgotPasswordInput,
		validators: { onSubmit: ForgotPasswordSchema },
		onSubmit: async ({ value }) => {
			reset();
			try {
				await mutateAsync(value);
			} catch {
				// pesan error ada di `error`
			}
		},
	});

	const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		e.stopPropagation();
		void form.handleSubmit();
	};

	return { ...form, onSubmit, isPending, isSuccess, error };
};

export const useResetPasswordForm = (token: string) => {
	const router = useRouter();

	const { mutateAsync, isPending, error, reset, isSuccess } =
		useResetPassword();

	const form = useForm({
		defaultValues: {
			password: "",
			confirm_password: "",
			token,
		} satisfies ResetPasswordInput,
		validators: { onSubmit: ResetPasswordSchema },
		onSubmit: async ({ value }) => {
			reset();
			try {
				await mutateAsync(value);
			} catch {
				// pesan error ada di `error`
				return;
			}
			await router.navigate({ to: "/" });
		},
	});

	const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		e.stopPropagation();
		void form.handleSubmit();
	};

	return { ...form, onSubmit, isPending, isSuccess, error };
};
