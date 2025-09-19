// app/api/login/route.js
import { NextResponse } from "next/server";
import { checkCredentials, setSession } from "../../../lib/auth";

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

	setSession(email);

	// ⬇️ Redirige al dashboard /adm
	return NextResponse.redirect(new URL("/adm", req.url));
}
