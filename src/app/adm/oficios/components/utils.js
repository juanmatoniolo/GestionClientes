/* ==========================================
   utilidades judiciales y de fetch
========================================== */

export const stripAccents = (s = "") =>
	s
		.toString()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");

export const norm = (s = "") => stripAccents(s).trim().toLowerCase();
export const onlyDigits = (s = "") => (s.match(/\d+/g) || []).join("");

export function parseDependencia(dep = "") {
	if (!dep) return { titulo: "", secretariaNumero: "" };
	const parts = dep.split(/\s*-\s*/);
	const juzgadoParte = parts[0] || "";
	const secretariaParte = parts[1] || "";
	const titulo = juzgadoParte.trim();
	const m = secretariaParte?.match(
		/(secretar[íi]a|sec\.?)\s*(n[º°ro\.]*)?\s*(\d+)/i
	);
	const secretariaNumero = m?.[3] || onlyDigits(secretariaParte);
	return { titulo, secretariaNumero };
}

export function pickNonEmpty(...vals) {
	for (const v of vals) if (v && String(v).trim()) return v;
	return "";
}

export function normalizeSecretarias(secretarias) {
	if (Array.isArray(secretarias)) return secretarias;
	if (secretarias && typeof secretarias === "object")
		return Object.values(secretarias);
	return [];
}

/* ==========================================
   Resolver juzgado desde dependencias
========================================== */
export function matchJuzgado(depTitulo = "", jzTitulo = "") {
	const dep = norm(depTitulo);
	const jz = norm(jzTitulo);
	const nDep = onlyDigits(dep);
	const nJz = onlyDigits(jz);
	if (nDep && nJz && nDep !== nJz) return false;
	const drop = new Set([
		"juzgado",
		"nacional",
		"de",
		"del",
		"en",
		"primera",
		"instancia",
		"nro",
		"n°",
		"nº",
		"numero",
		"n",
	]);
	const tokens = dep.split(/\s+/).filter((t) => t && !drop.has(t));
	return tokens.every((t) => jz.includes(t));
}

export function findJuzgadoAndSecretaria(
	juzgados = [],
	tituloDep = "",
	secNum = ""
) {
	const jz =
		juzgados.find((z) => matchJuzgado(tituloDep, z.titulo || z.nombre)) ||
		null;
	if (!jz) return { jz: null, sec: null };
	const secArr = normalizeSecretarias(jz.secretarias);
	if (!secArr.length || !secNum) return { jz, sec: null };
	const sec =
		secArr.find((s) => String(s.numero ?? "") === String(secNum)) ||
		secArr.find((s) =>
			onlyDigits(s.numero || s.rotulo || s.titulo || "").includes(secNum)
		) ||
		null;
	return { jz, sec };
}

export function buildJuzgadoFromLookup(jz = {}, sec = {}, secNum = "") {
	const juez =
		pickNonEmpty(jz.juez, jz.juezTitular, jz.titular, jz.aCargo) || "";
	const domicilio = pickNonEmpty(jz.domicilio, jz.direccion) || "";
	const ciudad = pickNonEmpty(jz.ciudad, jz.localidad) || "";
	const secretariaLabel =
		sec?.titulo ||
		sec?.rotulo ||
		(secNum ? `Secretaría Nro. ${secNum}` : "Secretaría");
	const secTitular = pickNonEmpty(
		sec?.titular,
		sec?.aCargo,
		sec?.jefe,
		sec?.titularNombre
	);
	const secretaria = secTitular
		? `${secretariaLabel} a cargo de ${secTitular}`
		: secretariaLabel;
	const email =
		(Array.isArray(sec?.emails) && sec.emails[0]) ||
		(Array.isArray(jz?.emails) && jz.emails[0]) ||
		jz?.email ||
		"";
	return {
		nombre: jz.titulo || jz.nombre || "",
		juez,
		secretaria,
		domicilio: ciudad ? `${domicilio}, ${ciudad}` : domicilio,
		email,
	};
}

/* ==========================================
   Fetch helpers
========================================== */
export async function fetchJSON(path) {
	const base = typeof window !== "undefined" ? window.location.origin : "";
	const res = await fetch(`${base}${path}`, {
		cache: "no-store",
		next: { revalidate: 0 },
	});
	if (!res.ok) throw new Error(`Error al obtener ${path}: ${res.status}`);
	return res.json();
}

export async function fetchClientesToArray() {
	try {
		const j = await fetchJSON("/api/clientes");
		return Array.isArray(j?.clientes)
			? j.clientes
			: j && typeof j === "object"
			? Object.entries(j).map(([id, c]) => ({ id, ...c }))
			: [];
	} catch {
		return [];
	}
}

export async function fetchJuzgadosToArray() {
	try {
		const j = await fetchJSON("/api/juzgados");
		return Array.isArray(j?.juzgados)
			? j.juzgados
			: j && typeof j === "object"
			? Object.entries(j).map(([id, z]) => ({ id, ...z }))
			: [];
	} catch {
		return [];
	}
}
