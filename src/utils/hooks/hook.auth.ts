import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "#/components/ui/toast";
import type { ForgotPasswordInput } from "#/schemas/schema.forgot-password";
import type { ResetPasswordInput } from "#/schemas/schema.reset-password";
import type { LoginInput } from "#/schemas/schema.signin";
import { loginFn } from "../services/auth/service.login";
import { logoutFn } from "../services/auth/service.logout";
import {
	forgotPasswordFn,
	resetPasswordFn,
} from "../services/auth/service.password";

export const useLogin = () => {
	return useMutation({
		mutationFn: async (data: LoginInput) => {
			const res = await loginFn({ data });

			if (!res.success) {
				toast.add({
					type: "error",
					title: "Login Gagal",
					description: `[CAUSE]: ${res?.message}`,
				});
				throw new Error(res.message);
			}

			toast.add({
				type: "success",
				title: "Login Berhasil",
				description: "Selamat Datang Kembali",
			});

			return res;
		},
	});
};

export const useLogout = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: logoutFn,
		onSuccess: async () => {
			await router.navigate({ to: "/" });
			await router.invalidate();
		},
	});
};

export const useForgotPassword = () => {
	return useMutation({
		mutationFn: async (data: ForgotPasswordInput) => {
			const res = await forgotPasswordFn({ data });
			if (!res.success) {
				toast.add({
					type: "error",
					title: "Lupa Password Gagal di proses",
					description: `[CAUSE]: ${res?.message}`,
				});
				throw new Error(res.message);
			}

			toast.add({
				type: "success",
				title: "Permintaan Reset Password Berhasil Dikirim",
				description:
					"Silakan periksa email yang terdaftar untuk mendapatkan tautan reset password.",
			});

			return res;
		},
	});
};

export const useResetPassword = () => {
	return useMutation({
		mutationFn: async (data: ResetPasswordInput) => {
			const res = await resetPasswordFn({ data });
			if (!res.success) throw new Error(res.message);
			return res;
		},
	});
};
