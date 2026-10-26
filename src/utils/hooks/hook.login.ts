import { useMutation } from "@tanstack/react-query";
import { loginFn } from "../services/auth/service.login";

export const useLogin = () => {
	return useMutation({
		mutationFn: loginFn,
	});
};
