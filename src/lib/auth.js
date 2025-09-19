// lib/auth.js
import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "app_session";
const TTL = 60 * 60 * 8; // 8 horas

const USERS = [
	{
		email: process.env.APP_USER_1_EMAIL,
		pass: process.env.APP_USER_1_PASS,
	},
	{
		email: process.env.APP_USER_2_EMAIL,
		pass: process.env.APP_USER_2_PASS,
	},
];

// Validación segura (evita hardcodeo directo)
export function checkCredentials(email, pass) {
	return USERS.some((user) => user.email === email && user.pass === pass);
}

// Generar y guardar cookie con token de sesión
export function setSession(email) {
	const secret = process.env.APP_SESSION_SECRET || "default_secret";

	const token = crypto
		.createHmac("sha256", secret)
		.update(email + Date.now())
		.digest("hex");

	cookies().set(COOKIE, token, {
		httpOnly: true,
		sameSite: "lax",
		maxAge: TTL,
		path: "/",
	});
}

// Borrar la sesión
export function clearSession() {
	cookies().set(COOKIE, "", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0,
		path: "/",
	});
}
