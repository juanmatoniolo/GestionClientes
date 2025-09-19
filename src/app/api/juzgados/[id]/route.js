// app/api/juzgados/[id]/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { rtdb, dbRef, dbGet, dbUpdate, dbRemove } from "@/lib/firebaseClient";

// GET /api/juzgados/:id
export async function GET(_req, { params }) {
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: "ID faltante" }, { status: 400 });
	}

	try {
		const snap = await dbGet(dbRef(rtdb(), `juzgados/${id}`));
		const val = snap.val();

		if (!val) {
			return NextResponse.json(null, { status: 404 });
		}

		return NextResponse.json(val, {
			status: 200,
			headers: {
				"Cache-Control": "no-store",
			},
		});
	} catch (e) {
		console.error("[GET juzgado]", e);
		return NextResponse.json(
			{ error: e.message || "Error desconocido" },
			{ status: 500 }
		);
	}
}

// PATCH /api/juzgados/:id
export async function PATCH(req, { params }) {
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: "ID faltante" }, { status: 400 });
	}

	try {
		const data = await req.json();

		await dbUpdate(dbRef(rtdb(), `juzgados/${id}`), {
			...data,
			updatedAt: Date.now(),
		});

		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("[PATCH juzgado]", e);
		return NextResponse.json(
			{ error: e.message || "Error desconocido" },
			{ status: 500 }
		);
	}
}

// DELETE /api/juzgados/:id
export async function DELETE(_req, { params }) {
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: "ID faltante" }, { status: 400 });
	}

	try {
		await dbRemove(dbRef(rtdb(), `juzgados/${id}`));
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("[DELETE juzgado]", e);
		return NextResponse.json(
			{ error: e.message || "Error desconocido" },
			{ status: 500 }
		);
	}
}
