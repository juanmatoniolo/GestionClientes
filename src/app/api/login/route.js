import { NextResponse } from "next/server";

const COOKIE = "app_session";
const TTL = 60 * 60 * 8; // 8 horas

function checkCredentials(email, pass) {
	return (
		(email === process.env.APP_USER_1_EMAIL &&
			pass === process.env.APP_USER_1_PASS) ||
		(email === process.env.APP_USER_2_EMAIL &&
			pass === process.env.APP_USER_2_PASS)
	);
}

export async function POST(req) {
	const form = await req.formData();
	const email = form.get("email");
	const password = form.get("password");

	// Validar
	if (!checkCredentials(email, password)) {
		return NextResponse.json(
			{ ok: false, error: "Credenciales inválidas" },
			{ status: 401 }
		);
	}

	// Redirigir a /adm si es válido
	const res = NextResponse.redirect(new URL("/adm", req.url));

	// Podés setear una cookie básica si querés mantener sesión
	res.cookies.set(COOKIE, "ok", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: TTL,
		path: "/",
	});

	return res;
}
