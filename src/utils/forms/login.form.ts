import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { type LoginInput, LoginSchema } from "#/schemas/schema.signin";
import { safeRedirect } from "#/utils/helpers/safe-redirect";
import { useLogin } from "../hooks/hook.auth";

export const useLoginForm = (redirectTo?: string) => {
	const router = useRouter();

	const { mutateAsync, isPending, error, reset } = useLogin();

	const defaultValues = {
		email: "",
		password: "",
	} satisfies LoginInput;

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: LoginSchema,
		},
		onSubmit: async ({ value }) => {
			reset();

			try {
				await mutateAsync(value);
			} catch {
				return; // pesan error sudah tersedia lewat `error`
			}

			// paksa beforeLoad root mengambil ulang status auth
			await router.invalidate();
			router.history.push(safeRedirect(redirectTo));
		},
	});

	const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		e.stopPropagation();
		void form.handleSubmit();
	};

	return { ...form, onSubmit, isPending, error };
};
