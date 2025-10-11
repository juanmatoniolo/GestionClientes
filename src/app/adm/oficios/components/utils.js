/************************************************************
 * 🧩 PARSEAR DEPENDENCIA DEL CLIENTE (tolerante a variaciones)
 ************************************************************/
export function parseDependencia(dep = "") {
	if (!dep) return {};

	// Normalizamos el texto
	let clean = dep
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // elimina acentos
		.toLowerCase()
		.replace(/juzgado\s*/gi, "juzgado ")
		.replace(/civil y comercial federal/gi, "civil y comercial federal")
		.replace(/federal/gi, "federal")
		.replace(/secretaria|secreteria|secc?ion|sec\.?|secr\.?/gi, "secretaria")
		.replace(/[º°]/g, "nº")
		.replace(/n\s*[º°o]/g, "nº")
		.replace(/\s*-\s*/g, " ") // elimina guiones
		.replace(/\s+/g, " ")
		.trim();

	// Extrae números (1º = juzgado, 2º = secretaría)
	const nums = clean.match(/\d+/g) || [];
	const juzgadoNumero = nums[0] ? parseInt(nums[0]) : null;
	const secretariaNumero = nums[1] ? parseInt(nums[1]) : null;

	// El título textual del fuero
	const titulo = clean
		.replace(/juzgado|federal|civil|comercial|secretaria|nº|\d+/g, "")
		.replace(/\s+/g, " ")
		.trim();

	return { titulo, juzgadoNumero, secretariaNumero };
}

/************************************************************
 * 🧩 RESOLVER DATOS DEL JUZGADO Y SECRETARÍA
 * (Extrae juez, secretario, domicilio, email, etc.)
 ************************************************************/
export function resolverDatosJuzgadoYSecretaria(dependencia, juzgados) {
	if (!dependencia || !juzgados?.length) return null;

	// Parseo tolerante (números y nombre)
	const { titulo, juzgadoNumero, secretariaNumero } = parseDependencia(dependencia);

	// Busco coincidencia de juzgado
	let jz = null;
	if (juzgadoNumero) {
		jz = juzgados.find((j) => parseInt(j.numero) === juzgadoNumero);
	}
	if (!jz && titulo) {
		const norm = titulo.toLowerCase();
		jz = juzgados.find((j) =>
			(`${j.fuero ?? ""} ${j.ciudad ?? ""} ${j.titulo ?? ""}`)
				.toLowerCase()
				.includes(norm)
		);
	}
	if (!jz) return null;

	// Busco secretaría específica o la primera
	let sec =
		jz.secretarias?.find(
			(s) =>
				parseInt(s.numero) === secretariaNumero ||
				s.rotulo?.toLowerCase().includes(`secretaria ${secretariaNumero}`) ||
				s.rotulo?.toLowerCase().includes(`nº ${secretariaNumero}`) ||
				s.rotulo?.toLowerCase().includes(`nro ${secretariaNumero}`)
		) || jz.secretarias?.[0];

	return {
		juez: jz.juez ?? "",
		fuero: jz.fuero ?? "",
		domicilio: jz.domicilio ?? "",
		ciudad: jz.ciudad ?? "",
		numero: jz.numero ?? "",
		secretariaNumero: sec?.numero ?? secretariaNumero ?? "",
		secretario: sec?.secretario ?? "",
		email: sec?.emails?.[0] ?? "",
	};
}

/************************************************************
 * 🧩 BUSCAR JUZGADO Y SECRETARÍA CLÁSICO (compatibilidad)
 ************************************************************/
export function findJuzgadoAndSecretaria(juzgados, titulo, secretariaNumero) {
	if (!Array.isArray(juzgados)) return { jz: null, sec: null };

	const normalized = titulo.toLowerCase().replace(/\s+/g, " ").trim();

	const jz =
		juzgados.find((j) => {
			const full = `${j.fuero ?? ""} ${j.ciudad ?? ""} ${
				j.nombre ?? ""
			}`.toLowerCase();
			return (
				full.includes(normalized) ||
				(j.titulo ?? "").toLowerCase().includes(normalized)
			);
		}) ||
		juzgados.find((j) => j.numero && titulo.includes(j.numero.toString()));

	if (!jz) return { jz: null, sec: null };

	const sec =
		jz.secretarias?.find(
			(s) =>
				s.numero === secretariaNumero ||
				s.rotulo
					?.toLowerCase()
					.includes(`secretaria ${secretariaNumero}`) ||
				s.rotulo?.toLowerCase().includes(`sec ${secretariaNumero}`) ||
				s.rotulo?.toLowerCase().includes(`nº ${secretariaNumero}`) ||
				s.rotulo?.toLowerCase().includes(`nro ${secretariaNumero}`)
		) || jz.secretarias?.[0];

	return { jz, sec };
}

/************************************************************
 * 🧩 CONSTRUYE OBJETO JUZGADO PARA TEMPLATE.JS
 ************************************************************/
export function buildJuzgadoFromLookup(jz, sec, secretariaNumero) {
	if (!jz) return null;

	const secretarioNombre =
		sec?.secretario ??
		((sec?.rotulo?.match(/dra?\.?\s+[a-záéíóúüñ\s]+/i)?.[0] ?? "").trim() || "");

	const email =
		sec?.emails?.[0] ||
		jz.email ||
		(jz.secretarias?.[0]?.emails?.[0] ?? "");

	return {
		nombre: `JUZGADO ${jz.fuero ?? ""} N° ${jz.numero ?? ""}`.trim(),
		fuero: jz.fuero ?? "",
		numero: jz.numero ?? "",
		juez: jz.juez ?? "",
		domicilio: jz.domicilio ?? "",
		ciudad: jz.ciudad ?? "",
		secretariaNumero: secretariaNumero ?? sec?.numero ?? "",
		secretario: secretarioNombre,
		secretariaRotulo: sec?.rotulo ?? "",
		email,
		rawSecretaria: sec,
	};
}

/************************************************************
 * 🧩 FETCH CLIENTES Y JUZGADOS (Firebase)
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
