import nodemailer from "nodemailer";
import { RESET_TOKEN_TTL_MINUTES } from "#/utils/helpers/token";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT ?? 587),
	secure: process.env.SMTP_SECURE === "true",
	auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendPasswordResetEmail(input: {
	to: string;
	username: string;
	token: string;
}) {
	const url = `${process.env.APP_URL}/reset-password?token=${encodeURIComponent(input.token)}`;

	await transporter.sendMail({
		from: process.env.MAIL_FROM,
		to: input.to,
		subject: "Atur ulang password HCM Monitor",
		text: `Halo ${input.username},\n\nKlik tautan berikut untuk mengatur ulang password (berlaku ${RESET_TOKEN_TTL_MINUTES}):\n${url}\n\nAbaikan email ini jika Anda tidak memintanya.`,
	});
}
