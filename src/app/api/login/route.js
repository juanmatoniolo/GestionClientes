// app/api/login/route.js
import { NextResponse } from "next/server";
import { checkCredentials } from "@/lib/auth";
import crypto from "crypto";

const COOKIE = "app_session";
const TTL = 60 * 60 * 8; // 8 horas

function generateToken(email) {
	const secret = process.env.APP_SESSION_SECRET || "default_secret";
	return crypto
		.createHmac("sha256", secret)
		.update(email + Date.now())
		.digest("hex");
}

export async function POST(req) {
	let email, password;
	const ct = req.headers.get("content-type") || "";

	if (ct.includes("form")) {
		const form = await req.formData();
		email = form.get("email");
		password = form.get("password");
	} else {
		const body = await req.json().catch(() => ({}));
		email = body.email;
		password = body.password;
	}

	if (!email || !password || !checkCredentials(email, password)) {
		return NextResponse.json(
			{ ok: false, error: "Credenciales inválidas" },
			{ status: 401 }
		);
	}

	// Generar token
	const token = generateToken(email);

	// Redirección real (302)
	const res = NextResponse.redirect(new URL("/adm", req.url));

	// Seteamos la cookie de sesión
	res.cookies.set(COOKIE, token, {
		httpOnly: true,
		sameSite: "lax",
		maxAge: TTL,
		path: "/",
	});

	return res;
}
