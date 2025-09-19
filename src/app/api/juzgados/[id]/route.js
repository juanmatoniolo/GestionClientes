// app/api/juzgados/[id]/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
	rtdb,
	dbRef,
	dbGet,
	dbUpdate,
	dbRemove,
} from "../../../../lib/firebaseClient";

// GET /api/juzgados/:id  → trae 1 juzgado
export async function GET(_req, { params }) {
	try {
		const id = params.id;
		const snap = await dbGet(dbRef(rtdb(), `juzgados/${id}`));
		const val = snap.val();
		if (!val) {
			console.error("[GET juzgado] no existe id:", id);
			return NextResponse.json(null, { status: 404 });
		}
		// Evitamos cache intermedio
		return new NextResponse(JSON.stringify(val), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store",
			},
		});
	} catch (e) {
		console.error("[GET juzgado] error:", e);
		return NextResponse.json(
			{ error: String(e?.message || e) },
			{ status: 500 }
		);
	}
}

// PATCH /api/juzgados/:id  → actualiza
export async function PATCH(req, { params }) {
	try {
		const id = params.id;
		const data = await req.json();
		await dbUpdate(dbRef(rtdb(), `juzgados/${id}`), {
			...data,
			updatedAt: Date.now(),
		});
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("[PATCH juzgado] error:", e);
		return NextResponse.json(
			{ error: String(e?.message || e) },
			{ status: 500 }
		);
	}
}

// DELETE /api/juzgados/:id  → elimina
export async function DELETE(_req, { params }) {
	try {
		const id = params.id;
		await dbRemove(dbRef(rtdb(), `juzgados/${id}`));
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("[DELETE juzgado] error:", e);
		return NextResponse.json(
			{ error: String(e?.message || e) },
			{ status: 500 }
		);
	}
}
