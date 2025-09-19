// app/api/juzgados/route.js
import { NextResponse } from "next/server";
import { rtdb, dbRef, dbGet, dbPush, dbSet } from "../../../lib/firebaseClient";

export async function GET() {
	const snap = await dbGet(dbRef(rtdb(), "juzgados"));
	return NextResponse.json(snap.val() || {});
}

export async function POST(req) {
	const body = await req.json();
	const ref = dbPush(dbRef(rtdb(), "juzgados"));
	const now = Date.now();
	await dbSet(ref, { ...body, createdAt: now, updatedAt: now });
	return NextResponse.json({ id: ref.key });
}
