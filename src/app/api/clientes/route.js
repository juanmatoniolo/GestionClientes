// app/api/clientes/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { rtdb, dbRef, dbGet, dbPush, dbSet } from "@/lib/firebaseClient";

// GET: lista todos
export async function GET() {
	try {
		const snap = await dbGet(dbRef(rtdb(), "clientes"));
		return NextResponse.json(snap.val() || {});
	} catch (e) {
		console.error("[GET clientes]", e);
		return NextResponse.json(
			{ error: e?.message || "Error al obtener clientes" },
			{ status: 500 }
		);
	}
}

// POST: crea uno
export async function POST(req) {
	try {
		const body = await req.json();

		if (!body || typeof body !== "object" || !body.nombre) {
			return NextResponse.json(
				{ error: "Datos inválidos" },
				{ status: 400 }
			);
		}

		const ref = dbPush(dbRef(rtdb(), "clientes"));
		const now = Date.now();
		await dbSet(ref, { ...body, createdAt: now, updatedAt: now });

		return NextResponse.json({ id: ref.key });
	} catch (e) {
		console.error("[POST clientes]", e);
		return NextResponse.json(
			{ error: e?.message || "Error al crear cliente" },
			{ status: 500 }
		);
	}
}
