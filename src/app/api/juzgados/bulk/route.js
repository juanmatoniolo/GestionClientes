// app/api/juzgados/bulk/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { rtdb, dbRef, dbPush, dbSet } from "../../../../lib/firebaseClient";

export async function POST(req) {
	try {
		const { items } = await req.json().catch(() => ({}));
		if (!Array.isArray(items) || items.length === 0) {
			return NextResponse.json(
				{ ok: false, error: "Sin items" },
				{ status: 400 }
			);
		}

		const db = rtdb();
		const now = Date.now();

		for (const it of items) {
			const ref = dbPush(dbRef(db, "juzgados"));
			await dbSet(ref, { ...it, createdAt: now, updatedAt: now });
		}

		return NextResponse.json({ ok: true, count: items.length });
	} catch (err) {
		// Log a la terminal y devuelvo el mensaje exacto
		console.error("BULK ERROR:", err);
		return NextResponse.json(
			{
				ok: false,
				error: err && err.message ? err.message : String(err),
			},
			{ status: 500 }
		);
	}
}
