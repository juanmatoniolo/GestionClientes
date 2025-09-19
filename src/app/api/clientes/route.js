// app/api/clientes/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { rtdb, dbRef, dbGet, dbPush, dbSet } from "../../..//lib/firebaseClient";

// GET: lista todos
export async function GET() {
	try {
		const snap = await dbGet(dbRef(rtdb(), "clientes"));
		return NextResponse.json(snap.val() || {});
	} catch (e) {
		console.error("[GET clientes]", e);
		return NextResponse.json(
			{ error: String(e?.message || e) },
			{ status: 500 }
		);
	}
}

// POST: crea uno
export async function POST(req) {
	try {
		const body = await req.json();
		const ref = dbPush(dbRef(rtdb(), "clientes"));
		const now = Date.now();
		await dbSet(ref, { ...body, createdAt: now, updatedAt: now });
		return NextResponse.json({ id: ref.key });
	} catch (e) {
		console.error("[POST clientes]", e);
		return NextResponse.json(
			{ error: String(e?.message || e) },
			{ status: 500 }
		);
	}
}
