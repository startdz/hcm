import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "#/utils/middlewares/middleware.auth";

export const getLeavesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		console.log(context);
		return [];
	});
