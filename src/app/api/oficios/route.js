import { NextResponse } from "next/server";
import { adminRtdb } from "@/lib/firebaseAdmin";

// Validación simple
function validate(body) {
	const required = ["clienteId", "juzgadoId", "tipo"];
	for (const k of required) if (!body?.[k]) return `Falta ${k}`;
	const tipos = ["azopardo", "migraciones", "interpol", "rnr", "renaper"];
	if (!tipos.includes(body.tipo)) return "Tipo de oficio inválido";
	return null;
}

async function buildDestinatarios(juzgadoId) {
	const snap = await adminRtdb.ref(`juzgados/${juzgadoId}`).get();
	const j = snap.val();
	if (!j) return [];
	const dests = [];
	for (const s of j.secretarias ?? []) {
		for (const em of s.emails ?? []) dests.push(em);
	}
	return Array.from(new Set(dests));
}

async function getClienteSnapshot(clienteId) {
	const snap = await adminRtdb.ref(`clientes/${clienteId}`).get();
	const c = snap.val();
	if (!c) return {};
	return {
		nombre: `${(c.apellido ?? "").trim()} ${(
			c.nombre ?? ""
		).trim()}`.trim(),
		dni: c.dni ?? "",
	};
}

async function getJuzgadoSnapshot(juzgadoId) {
	const snap = await adminRtdb.ref(`juzgados/${juzgadoId}`).get();
	const j = snap.val();
	if (!j) return {};
	return { titulo: j.titulo ?? "", ciudad: j.ciudad ?? "" };
}

export async function GET() {
	try {
		const snap = await adminRtdb
			.ref("oficios")
			.orderByChild("createdAt")
			.get();
		const val = snap.val() || {};
		const list = Object.entries(val).map(([id, data]) => ({ id, ...data }));
		list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
		return NextResponse.json({ oficios: list }, { status: 200 });
	} catch (e) {
		console.error("GET /api/oficios error:", e);
		return NextResponse.json(
			{ error: "Error listando oficios" },
			{ status: 500 }
		);
	}
}

export async function POST(req) {
	try {
		const body = await req.json();
		const err = validate(body);
		if (err) return NextResponse.json({ error: err }, { status: 400 });

		const now = Date.now();
		const destinatarios = body.destinatarios?.length
			? body.destinatarios
			: await buildDestinatarios(body.juzgadoId);

		const payload = {
			clienteId: body.clienteId,
			juzgadoId: body.juzgadoId,
			tipo: body.tipo,
			estado: "borrador",
			titulo: body.titulo ?? `Oficio a ${body.tipo}`,
			numeroExpediente: body.numeroExpediente ?? "",
			destinatarios,
			payload: body.payload ?? {},
			clienteSnapshot: await getClienteSnapshot(body.clienteId),
			juzgadoSnapshot: await getJuzgadoSnapshot(body.juzgadoId),
			createdAt: now,
			updatedAt: now,
			createdBy: body.createdBy ?? null,
		};

		const ref = adminRtdb.ref("oficios").push();
		await ref.set(payload);

		return NextResponse.json({ id: ref.key, ...payload }, { status: 201 });
	} catch (e) {
		console.error("POST /api/oficios error:", e);
		return NextResponse.json(
			{ error: "Error creando oficio" },
			{ status: 500 }
		);
	}
}
