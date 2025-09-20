import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.APP_SESSION_SECRET);

export async function middleware(req) {
	const token = req.cookies.get("session")?.value;

	if (!token) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	try {
		await jwtVerify(token, secret);
		return NextResponse.next();
	} catch (err) {
		return NextResponse.redirect(new URL("/login", req.url));
	}
}

// Proteger solo /admin
export const config = {
	matcher: ["/adm/:path*"],
};
