import { useForm } from "@tanstack/react-form";
import { type LoginInput, LoginSchema } from "#/schemas/schema.signin";
import { useLogin } from "../hooks/hook.login";

export const useLoginForm = () => {
	const {
		mutate: loginMutate,
		isPending,
		isSuccess,
		reset: resetMutate,
	} = useLogin();

	const defaultValues = {
		email: "",
		password: "",
	} satisfies LoginInput;

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: LoginSchema,
			async onSubmitAsync({ value }) {
				resetMutate();
				loginMutate({ data: value });
			},
		},
	});

	const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		e.stopPropagation();
		form.handleSubmit();
	};

	return { ...form, onSubmit, isPending, isSuccess };
};
