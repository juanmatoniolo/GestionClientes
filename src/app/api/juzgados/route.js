// app/api/juzgados/route.js
import { NextResponse } from "next/server";
import { rtdb, dbRef, dbGet, dbPush, dbSet } from "@/lib/firebaseClient";

export async function GET() {
	try {
		const snap = await dbGet(dbRef(rtdb(), "juzgados"));
		return NextResponse.json(snap.val() || {});
	} catch (err) {
		console.error("Error al obtener juzgados:", err);
		return NextResponse.json({ error: "Error al obtener juzgados" }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const body = await req.json();

		if (!body || typeof body !== "object" || !body.nombre) {
			return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
		}

		const ref = dbPush(dbRef(rtdb(), "juzgados"));
		const now = Date.now();
		await dbSet(ref, { ...body, createdAt: now, updatedAt: now });

		return NextResponse.json({ id: ref.key });
	} catch (err) {
		console.error("Error al crear juzgado:", err);
		return NextResponse.json({ error: "Error al crear juzgado" }, { status: 500 });
	}
}
