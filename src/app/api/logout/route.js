// app/api/logout/route.js
import { NextResponse } from "next/server";
import { clearSession } from "../../../lib/auth";

export async function POST(req) {
	clearSession();
	return NextResponse.redirect(new URL("/", req.url));
}
