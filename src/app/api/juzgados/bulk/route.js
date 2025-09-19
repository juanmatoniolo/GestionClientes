import { NextResponse } from "next/server";

const COOKIE = "app_session";

export async function POST(req) {
	const res = NextResponse.redirect(new URL("/", req.url));

	// Borramos la cookie de sesión
	res.cookies.set(COOKIE, "", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0,
		path: "/",
	});

	return res;
}
