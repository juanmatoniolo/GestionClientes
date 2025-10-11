import { NextResponse } from "next/server";
import { buildOficio } from "@/lib/oficios/templates";

// -------------------- Helpers --------------------

function parseDependencia(dep = "") {
	if (!dep) return { fuero: "", numero: "", secretariaNumero: "" };

	const parts = dep.split(/\s*-\s*/);
	const juzgadoParte = parts[0] || "";
	const secretariaParte = parts[1] || "";

	// Extraemos número del juzgado
	const numMatch = juzgadoParte.match(/\d+/);
	const numero = numMatch ? numMatch[0] : "";

	// Fuero sin la palabra "juzgado"
	const fuero = juzgadoParte.replace(/juzgado/i, "").trim();

	// Secretaría
	const m = secretariaParte?.match(
		/(secretar[íi]a|sec\.?)\s*(n[º°ro\.]*)?\s*(\d+)/i
	);
	const secretariaNumero = m?.[3] || "";

	return { fuero, numero, secretariaNumero };
}

// Normalizar secretarias
function normalizeSecretarias(secretarias) {
	if (Array.isArray(secretarias)) return secretarias;
	if (secretarias && typeof secretarias === "object")
		return Object.values(secretarias);
	return [];
}

// -------------------- Data Lookups --------------------

async function getCliente(clienteId) {
	const snap = await adminRtdb.ref(`clientes/${clienteId}`).get();
	return snap.val() || null;
}

async function getAllJuzgados() {
	const snap = await adminRtdb.ref("juzgados").get();
	const val = snap.val() || {};
	return Object.entries(val).map(([id, j]) => ({ id, ...j }));
}

function resolverJuzgado(cliente, juzgados = []) {
	const { fuero, numero, secretariaNumero } = parseDependencia(
		cliente?.dependencia || ""
	);

	const jz = juzgados.find(
		(z) =>
			String(z.numero) === String(numero) &&
			(z.fuero || "").toLowerCase().includes(fuero.toLowerCase())
	);
	if (!jz) return null;

	const secArr = normalizeSecretarias(jz.secretarias);
	const sec =
		secArr.find(
			(s) => String(s.numero ?? "") === String(secretariaNumero)
		) || null;

	return {
		nombre: jz.titulo || `Juzgado ${jz.numero} ${jz.fuero}`,
		juez: jz.juez || "",
		secretaria: sec
			? `${sec.titulo || `Secretaría Nº ${secretariaNumero}`} ${
					sec.titular ? `a cargo de ${sec.titular}` : ""
			}`
			: `Secretaría Nº ${secretariaNumero}`,
		domicilio: jz.domicilio || "",
		email: (sec?.emails && sec.emails[0]) || jz.email || "",
	};
}

// -------------------- API ROUTES --------------------

// GET: lista oficios (si querés histórico)
export async function GET() {
	return NextResponse.json({
		ok: true,
		msg: "usar POST para generar oficio",
	});
}

// POST: generar oficio en base a cliente + juzgado + template
export async function POST(req) {
	try {
		const body = await req.json();
		const { clienteId, tipo, fechaAuto } = body;

		if (!clienteId || !tipo || !fechaAuto) {
			return NextResponse.json(
				{ error: "Faltan datos obligatorios" },
				{ status: 400 }
			);
		}

		// buscar cliente y juzgados
		const cliente = await getCliente(clienteId);
		if (!cliente)
			return NextResponse.json(
				{ error: "Cliente no encontrado" },
				{ status: 404 }
			);

		const juzgados = await getAllJuzgados();
		const juzgadoTpl = resolverJuzgado(cliente, juzgados);
		if (!juzgadoTpl) {
			return NextResponse.json(
				{ error: "No se pudo resolver juzgado/secretaría" },
				{ status: 400 }
			);
		}

		// payload armado
		const payload = {
			expediente: cliente.expediente || "",
			caratula: `${(cliente.apellido || "").toUpperCase()}, ${(
				cliente.nombre || ""
			).toUpperCase()} s/ CIUDADANÍA`,
			juzgado: juzgadoTpl,
			estudio: { email: "abogado.santiagoroncero@gmail.com" },
			cliente: {
				apellido: cliente.apellido || "",
				nombre: cliente.nombre || "",
				sexo: cliente.sexo || cliente.genero || "",
				domicilio: cliente.domicilioReal || cliente.domicilio || "",
				pasaporte: cliente.pasaporteNumero || "",
				dni: cliente.dni || "",
				estadoCivil: cliente.estadoCivil || "",
				fechaNacimiento: cliente.fechaNacimiento || "",
				lugarNacimiento: cliente.lugarNacimiento || "",
				padre: cliente.padre || "",
				madre: cliente.madre || "",
				fechaIngreso: cliente.fechaLlegada || "",
				medioIngreso:
					cliente.medioIngreso || cliente.medioTransporte || "",
			},
			auto: {
				fechaTexto: fechaAuto,
				textoComplementario:
					"… recábese informes conforme art. 400 CPCC …",
				firmante: juzgadoTpl.juez,
			},
		};

		// generar oficio
		const html = buildOficio(tipo, payload, { format: "html" });
		const text = buildOficio(tipo, payload, { format: "text" });

		return NextResponse.json({ html, text, payload }, { status: 200 });
	} catch (e) {
		console.error("POST /api/oficios error:", e);
		return NextResponse.json(
			{ error: "Error generando oficio" },
			{ status: 500 }
		);
	}
}
