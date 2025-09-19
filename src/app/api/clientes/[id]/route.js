// app/api/clientes/[id]/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { rtdb, dbRef, dbGet, dbUpdate, dbRemove } from "../../../..//lib/firebaseClient";

export async function GET(_req, { params }) {
	try {
		const snap = await dbGet(dbRef(rtdb(), `clientes/${params.id}`));
		const val = snap.val();
		if (!val) return NextResponse.json(null, { status: 404 });
		return NextResponse.json(val, {
			headers: { "Cache-Control": "no-store" },
		});
	} catch (e) {
		console.error("[GET cliente]", e);
		return NextResponse.json(
			{ error: String(e?.message || e) },
			{ status: 500 }
		);
	}
}

export async function PATCH(req, { params }) {
	try {
		const data = await req.json();
		await dbUpdate(dbRef(rtdb(), `clientes/${params.id}`), {
			...data,
			updatedAt: Date.now(),
		});
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("[PATCH cliente]", e);
		return NextResponse.json(
			{ error: String(e?.message || e) },
			{ status: 500 }
		);
	}
}

export async function DELETE(_req, { params }) {
	try {
		await dbRemove(dbRef(rtdb(), `clientes/${params.id}`));
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("[DELETE cliente]", e);
		return NextResponse.json(
			{ error: String(e?.message || e) },
			{ status: 500 }
		);
	}
}
