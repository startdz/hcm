import { createServerFn } from "@tanstack/react-start";
import { LoginSchema } from "#/schemas/schema.signin";

export const loginFn = createServerFn({ method: "POST" })
	.validator(LoginSchema)
	.handler(async ({ data }) => {
		return `Created user: ${data.email}, password ${data.password}`;
	});
