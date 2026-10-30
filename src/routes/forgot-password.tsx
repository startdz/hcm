import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordContainer from "#/components/containers/auth/forgot-password-container";

export const Route = createFileRoute("/forgot-password")({
	component: ForgotPasswordContainer,
});
