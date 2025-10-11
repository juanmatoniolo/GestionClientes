/************************************************************
 * 🧩 PARSEAR DEPENDENCIA DEL CLIENTE
 * Ejemplo de dependencia: "Juzgado Federal de Bahía Blanca N° 1 Sec. 1"
 ************************************************************/
export function parseDependencia(dep = "") {
	if (!dep) return {};

	const regex = /(\d+)/g;
	const nums = dep.match(regex) || [];
	const titulo = dep
		.replace(/nro?\.?\s*\d+/gi, "")
		.replace(/sec(t|ción|retaría)?\.?\s*\d+/gi, "")
		.trim();

	return {
		titulo: titulo.trim(),
		juzgadoNumero: nums[0] ? parseInt(nums[0]) : null,
		secretariaNumero: nums[1] ? parseInt(nums[1]) : null,
	};
}

/************************************************************
 * 🧩 BUSCAR JUZGADO Y SECRETARÍA EN LOS DATOS CARGADOS
 ************************************************************/
export function findJuzgadoAndSecretaria(juzgados, titulo, secretariaNumero) {
	if (!Array.isArray(juzgados)) return { jz: null, sec: null };
	const normalized = titulo.toLowerCase().replace(/\s+/g, " ").trim();

	const jz = juzgados.find((j) => {
		const n = `${j.fuero ?? ""} ${j.ciudad ?? ""}`.toLowerCase();
		return n.includes(normalized) || (j.nombre ?? "").toLowerCase().includes(normalized);
	});

	if (!jz) return { jz: null, sec: null };

	const sec =
		jz.secretarias?.find(
			(s) =>
				s.numero === secretariaNumero ||
				s.rotulo?.toLowerCase().includes(`secretaría ${secretariaNumero}`) ||
				s.rotulo?.toLowerCase().includes(`sec. ${secretariaNumero}`)
		) || jz.secretarias?.[0];

	return { jz, sec };
}

/************************************************************
 * 🧩 CONSTRUYE OBJETO JUZGADO PARA TEMPLATE.JS
 ************************************************************/
export function buildJuzgadoFromLookup(jz, sec, secretariaNumero) {
	if (!jz) return null;

	const secretarioNombre =
		(sec?.secretario ??
			((sec?.rotulo?.match(/dra?\.?\s+[a-záéíóúüñ\s]+/i)?.[0] ?? "").trim())) ||
		"";

	const email =
		sec?.emails?.[0] ??
		jz.email ??
		(jz.secretarias?.[0]?.emails?.[0] ?? "");

	return {
		// --- Campos principales
		nombre: `JUZGADO ${jz.fuero ?? ""} N° ${jz.numero ?? ""}`.trim(),
		fuero: jz.fuero ?? "",
		numero: jz.numero ?? "",
		juez: jz.juez ?? "",
		domicilio: jz.domicilio ?? "",
		ciudad: jz.ciudad ?? "",

		// --- Secretaría (normalizada)
		secretariaNumero: secretariaNumero ?? sec?.numero ?? "",
		secretario: secretarioNombre,
		secretariaRotulo: sec?.rotulo ?? "",
		email: email,

		// --- Datos de respaldo
		rawSecretaria: sec,
	};
}


/************************************************************
 * 🧩 FETCH CLIENTES Y JUZGADOS
 * Convierte la data Firebase en array estándar
 ************************************************************/
export async function fetchClientesToArray() {
	try {
		const res = await fetch("/api/clientes");
		if (!res.ok) throw new Error("Error al cargar clientes");
		const data = await res.json();
		return Object.entries(data || {}).map(([id, v]) => ({ id, ...v }));
	} catch (err) {
		console.error("❌ Error cargando clientes:", err);
		return [];
	}
}

export async function fetchJuzgadosToArray() {
	try {
		const res = await fetch("/api/juzgados");
		if (!res.ok) throw new Error("Error al cargar juzgados");
		const data = await res.json();
		return Object.entries(data || {}).map(([id, v]) => ({ id, ...v }));
	} catch (err) {
		console.error("❌ Error cargando juzgados:", err);
		return [];
	}
}
