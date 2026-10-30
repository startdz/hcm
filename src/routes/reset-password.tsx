import { RiGalleryLine } from "@remixicon/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import z from "zod";
import { ResetPasswordForm } from "#/components/common/forms/reset-password-form";

export const Route = createFileRoute("/reset-password")({
	validateSearch: z.object({ token: z.string().optional() }),
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const { token } = Route.useSearch();

	if (!token) {
		return (
			<p>
				Tautan tidak valid. <Link to="/forgot-password">Minta tautan baru</Link>
			</p>
		);
	}

	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link to="/" className="flex items-center gap-2 font-medium">
						<div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<RiGalleryLine className="size-4" />
						</div>
						Acme Inc.
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<ResetPasswordForm token={token} />
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<img
					src="/placeholder.svg"
					alt="placeholder-image"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
