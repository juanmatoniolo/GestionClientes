// Reemplazo simple de {{placeholders}}
export function interpolate(template, data = {}) {
	return template.replace(/\{\{(\s*[^}]+\s*)\}\}/g, (_, key) => {
		const path = key.trim().split(".");
		let val = data;
		for (const k of path) val = val?.[k];
		return (val ?? "").toString();
	});
}

/** Bloques comunes */
const BLOQUE_RECAUDOS = `
RECAUDOS. PLAZOS PARA LA CONTESTACIÓN (Art. 398 CPCC): Las oficinas públicas y las entidades privadas deberán contestar el pedido de informes o remitir el expediente dentro de los diez días hábiles, salvo que la providencia que lo haya ordenado hubiere fijado otro plazo. No podrán establecer recaudos no autorizados por ley. Los oficios librados deberán ser recibidos obligatoriamente a su presentación.

El juez podrá aplicar sanciones conminatorias progresivas ante atraso injustificado. La apelación tramita por separado.`;

const BLOQUE_ATRIBUCIONES = `
ATRIBUCIONES DE LOS LETRADOS PATROCINANTES (Art. 400 CPCC): Los informes, testimonios y certificados ordenados en el juicio serán requeridos por oficios firmados, sellados y diligenciados por el letrado patrocinante, con transcripción de la resolución que los ordena y su plazo. Las respuestas deben remitirse directamente a la secretaría con transcripción o copia del oficio.`;

/** Helper para la sección de datos del interesado (cliente) */
function datosInteresado() {
	return `
Los datos del interesado son:

APELLIDO: {{cliente.apellido}}
NOMBRE: {{cliente.nombre}}
SEXO: {{cliente.sexo}}
DOMICILIO: {{cliente.domicilio}}
PASAPORTE: {{cliente.pasaporte}}
DNI: {{cliente.dni}}
ESTADO CIVIL: {{cliente.estadoCivil}}
F. NACIMIENTO: {{cliente.fechaNacimiento}}
LUGAR DE NACIMIENTO: {{cliente.lugarNacimiento}}
NOMBRE Y APELLIDO DEL PADRE: {{cliente.padre}}
NOMBRE Y APELLIDO DE LA MADRE: {{cliente.madre}}
FECHA DE INGRESO AL PAÍS: {{cliente.fechaIngreso}}
MEDIO DE INGRESO AL PAÍS: {{cliente.medioIngreso}}
`.trim();
}

/** Helper para el párrafo del auto con fecha editable */
function parrafoAuto() {
	return `
El auto que ordena la medida en su parte pertinente reza:
“Buenos Aires, {{auto.fechaTexto}}. {{auto.textoComplementario}}” FIRMADO: {{auto.firmante}}, JUEZ FEDERAL.-`.trim();
}

/** Cabecera común */
function encabezado(tituloDest, direccionDest) {
	return `
OFICIO JUDICIAL.-

AL ${tituloDest}
${direccionDest}

S / D

Me dirijo a usted en carácter de letrado patrocinante de la parte peticionante en relación a los autos caratulados “{{expediente}} - {{caratula}}” que tramita ante el {{juzgado.nombre}}, a cargo de {{juzgado.juez}}, {{juzgado.secretaria}}, sito en {{juzgado.domicilio}}, a fin de {{finalidad}}.
`.trim();
}

/** Footer emails */
const FOOTER_ENVIO = `
El presente oficio deberá ser contestado a la casilla de email del juzgado {{juzgado.email}} CC a {{estudio.email}}.

Sin otro particular, saludo a Ud. atentamente.-`;

/** ===================== TEMPLATES POR ORGANISMO ===================== */

// AZOPARDO (Div. Dactiloscopia / Antecedentes)
const TEMPLATE_AZOPARDO = `
${encabezado(
	"SR. JEFE DE LA POLICÍA FEDERAL (División Antecedentes)",
	"Azopardo 660, C.A.B.A."
)}
${datosInteresado()}

${parrafoAuto()}

${BLOQUE_RECAUDOS}

${BLOQUE_ATRIBUCIONES}

${FOOTER_ENVIO}
`.trim();

// INTERPOL
const TEMPLATE_INTERPOL = `
${encabezado(
	"SEÑOR JEFE DE LA POLICÍA FEDERAL (División Interpol)",
	"Cavia 3320, C.A.B.A."
)}
${datosInteresado()}

${parrafoAuto()}

${BLOQUE_RECAUDOS}

${BLOQUE_ATRIBUCIONES}

${FOOTER_ENVIO}
`.trim();

// MIGRACIONES
const TEMPLATE_MIGRACIONES = `
${encabezado("DIRECCIÓN NACIONAL DE MIGRACIONES", "")}
${datosInteresado()}

${parrafoAuto()}

${BLOQUE_RECAUDOS}

${BLOQUE_ATRIBUCIONES}

${FOOTER_ENVIO}
`.trim();

// REINCIDENCIA
const TEMPLATE_REINCIDENCIA = `
${encabezado(
	"SEÑOR DIRECTOR DEL REGISTRO NACIONAL DE REINCIDENCIA ESTADÍSTICA CRIMINAL Y CARCELARIA",
	"Tucumán 1363, C.A.B.A."
)}
${datosInteresado()}

${parrafoAuto()}

${BLOQUE_RECAUDOS}

${BLOQUE_ATRIBUCIONES}

${FOOTER_ENVIO}
`.trim();

// RENAPER
const TEMPLATE_RENAPER = `
${encabezado(
	"SEÑOR DIRECTOR DEL REGISTRO NACIONAL DE LAS PERSONAS",
	"Presidente Juan Domingo Perón 664, C.A.B.A."
)}
${datosInteresado()}

${parrafoAuto()}

${BLOQUE_RECAUDOS}

${BLOQUE_ATRIBUCIONES}

${FOOTER_ENVIO}
`.trim();

/** Finalidades específicas por organismo */
const FINALIDADES = {
	azopardo:
		"que se sirva confeccionar ficha dactiloscópica de la parte y, luego, informar si registra antecedentes en esa Repartición",
	interpol:
		"que se sirva confeccionar ficha dactiloscópica de la parte y luego informar si registra antecedentes en la División Interpol",
	migraciones:
		"informar fehacientemente la situación de residencia del/la peticionante sobre la base de datos actualizados y documentación obrante en esa repartición",
	reincidencia:
		"informar si el/la peticionante registra antecedentes en ese Registro",
	renaper:
		"informar si el DNI del interesado es auténtico y expedirse sobre la regularidad y validez del trámite administrativo",
};

export const OFICIO_TEMPLATES = {
	azopardo: TEMPLATE_AZOPARDO,
	interpol: TEMPLATE_INTERPOL,
	migraciones: TEMPLATE_MIGRACIONES,
	rnr: TEMPLATE_REINCIDENCIA,
	renaper: TEMPLATE_RENAPER,
};

export function buildOficio(tipo, payload) {
	const tpl = OFICIO_TEMPLATES[tipo];
	if (!tpl) throw new Error(`Tipo de oficio inválido: ${tipo}`);
	// inyectamos la finalidad por tipo si no vino en payload
	const data = {
		finalidad: FINALIDADES[tipo],
		...payload,
	};
	return interpolate(tpl, data);
}
