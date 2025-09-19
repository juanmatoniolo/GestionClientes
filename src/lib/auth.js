// lib/auth.js
import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "app_session";
const TTL = 60 * 60 * 8; // 8 horas

export function checkCredentials(email, pass) {
	return (
		(email === process.env.APP_USER_1_EMAIL &&
			pass === process.env.APP_USER_1_PASS) ||
		(email === process.env.APP_USER_2_EMAIL &&
			pass === process.env.APP_USER_2_PASS)
	);
}

export function setSession(email) {
	const token = crypto
		.createHmac("sha256", process.env.APP_SESSION_SECRET || "secret")
		.update(email + Date.now())
		.digest("hex");

	cookies().set(COOKIE, token, {
		httpOnly: true,
		sameSite: "lax",
		maxAge: TTL,
		path: "/",
	});
}

export function clearSession() {
	cookies().set(COOKIE, "", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0,
		path: "/",
	});
}
