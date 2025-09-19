// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
	const { pathname } = req.nextUrl;

	// Rutas públicas
	if (
		pathname === "/" ||
		pathname.startsWith("/login") ||
		pathname.startsWith("/api/login") ||
		pathname.startsWith("/api/logout")
	) {
		return NextResponse.next();
	}

	// Rutas protegidas (incluye /adm y demás)
	const token = req.cookies.get("app_session")?.value;
	if (!token) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}
	return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|favicon.ico|public).*)"] };
