import { NextResponse } from "next/server";

const COOKIE = "app_session";

export async function POST(req) {
	// Borrar cookie de sesión
	const res = NextResponse.redirect(new URL("/", req.url));
	res.cookies.set(COOKIE, "", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0, // expira de inmediato
		path: "/",
	});

	return res;
}
