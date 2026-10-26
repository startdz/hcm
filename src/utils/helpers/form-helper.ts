import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";

type ButtonStateProps = {
	loadingText: ReactNode;
	defaultText: ReactNode;
	errorText: ReactNode;
	canSubmit: boolean;
	isSubmitting: boolean;
};

export const invalidState = (field: AnyFieldApi) => {
	// isTouched untuk client-side validation saat user ketik
	// errors.length > 0 untuk server-side validation yang masuk tanpa touch
	return (
		!field.state.meta.isValid &&
		(field.state.meta.isTouched || field.state.meta.errors.length > 0)
	);
};

export const errorState = (field: AnyFieldApi) => {
	return field.state.meta.errors.filter(Boolean).map((error) => ({
		message:
			typeof error === "string"
				? error
				: typeof error === "object" && error !== null && "message" in error
					? String((error as { message: unknown }).message)
					: String(error),
	}));
};

export const buttonState = ({
	isSubmitting,
	canSubmit,
	loadingText = "Loading...",
	defaultText = "Submit",
	errorText = "Complete all required fields",
}: ButtonStateProps) => {
	const label = isSubmitting
		? loadingText
		: !canSubmit
			? errorText
			: defaultText;

	const variant = isSubmitting
		? "secondary"
		: !canSubmit
			? "destructive"
			: "default";

	return { label, variant };
};
