import { RiGalleryFill } from "@remixicon/react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import { LoginForm } from "#/components/common/forms/login-form";
import { safeRedirect } from "#/utils/helpers/safe-redirect";

export const Route = createFileRoute("/")({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	component: Home,
	beforeLoad: ({ context, search }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ href: safeRedirect(search.redirect) });
		}
	},
});

function Home() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="/" className="flex items-center gap-2 font-medium">
						<div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<RiGalleryFill className="size-4" />
						</div>
						HCM inc.
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm />
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<img
					src="/placeholder.svg"
					alt="image-placeholder"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
