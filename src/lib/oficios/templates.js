// src/lib/oficios/templates.js

// ===== Utilidades =====

// Interpola {{placeholders}} con datos
export function interpolate(template, data = {}) {
	return template.replace(/\{\{(\s*[^}]+\s*)\}\}/g, (_, key) => {
		const path = key.trim().split(".");
		let val = data;
		for (const k of path) val = val?.[k];
		// Mayúsculas siempre en datos dinámicos
		return (val ?? "").toString().toUpperCase();
	});
}

// Quita HTML para texto plano
function stripHtml(html = "") {
	return html
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/p>/gi, "\n\n")
		.replace(/<[^>]+>/g, "")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

// ===== Bloques comunes =====
const BLOQUE_RECAUDOS_HTML = `
<p style="font-family:'Times New Roman',serif; font-size:8pt; margin:0 0 6px 0;">
<strong><u>RECAUDOS. PLAZOS PARA LA CONTESTACIÓN (Art. 398 CPCC):</u></strong>
Las oficinas públicas y las entidades privadas deberán contestar el pedido de informes o remitir el expediente dentro de los diez días hábiles, salvo que la providencia que lo haya ordenado hubiere fijado otro plazo. No podrán establecer recaudos no autorizados por ley. Los oficios librados deberán ser recibidos obligatoriamente a su presentación.
</p>
<p style="font-family:'Times New Roman',serif; font-size:8pt; margin:0 0 6px 0;">
El juez podrá aplicar sanciones conminatorias progresivas ante atraso injustificado. La apelación tramita por separado.
</p>
`.trim();

const BLOQUE_ATRIBUCIONES_HTML = `
<p style="font-family:'Times New Roman',serif; font-size:8pt; margin:0 0 6px 0;">
<strong><u>ATRIBUCIONES DE LOS LETRADOS PATROCINANTES (Art. 400 CPCC):</u></strong>
Los informes, testimonios y certificados ordenados en el juicio serán requeridos por oficios firmados, sellados y diligenciados por el letrado patrocinante, con transcripción de la resolución que los ordena y su plazo. Las respuestas deben remitirse directamente a la secretaría con transcripción o copia del oficio.
</p>
`.trim();

// Datos del interesado
function datosInteresadoHTML() {
	const R = (k, label) =>
		`<p style="font-family:'Times New Roman',serif; font-size:12pt; margin:0 0 4px 0;">
      <span style="text-decoration:underline;">${label}:</span> <strong>{{cliente.${k}}}</strong>
    </p>`;
	return `
<p style="margin:8px 0 6px 0; font-family:'Times New Roman',serif; font-size:12pt;">LOS DATOS DEL INTERESADO SON:</p>
${R("apellido", "APELLIDO")}
${R("nombre", "NOMBRE")}
${R("sexo", "SEXO")}
${R("domicilio", "DOMICILIO")}
${R("pasaporte", "PASAPORTE")}
${R("dni", "DNI")}
${R("estadoCivil", "ESTADO CIVIL")}
${R("fechaNacimiento", "F. NACIMIENTO")}
${R("lugarNacimiento", "LUGAR DE NACIMIENTO")}
${R("padre", "NOMBRE Y APELLIDO DEL PADRE")}
${R("madre", "NOMBRE Y APELLIDO DE LA MADRE")}
${R("fechaIngreso", "FECHA DE INGRESO AL PAÍS")}
${R("medioIngreso", "MEDIO DE INGRESO AL PAÍS")}
`.trim();
}

// Párrafo del auto
function parrafoAutoHTML() {
	return `
<p style="font-family:'Times New Roman',serif; font-size:12pt; margin:8px 0 6px 0;">
El auto que ordena la medida en su parte pertinente reza: <em>“Buenos Aires,{{auto.fechaTexto}}. {{auto.textoComplementario}}”</em>
<span style="text-transform:uppercase;">FIRMADO:</span>,
<strong>{{auto.firmante}}</strong>, <span style="text-transform:uppercase;">JUEZ FEDERAL.-</span>
</p>
`.trim();
}

// Encabezado común
function encabezadoHTML(tituloDest, direccionDest) {
	const dirLine = direccionDest ? `<div>${direccionDest}</div>` : "";
	return `
<p style="text-align:center; font-family:'Times New Roman',serif; font-size:12pt; margin:0 0 12px 0;">
<strong><u>OFICIO JUDICIAL.-</u></strong>
</p>
<p style="font-family:'Times New Roman',serif; font-size:12pt; margin:0 0 6px 0;">
<strong>${tituloDest}</strong><br/>${dirLine}
</p>
<p style="font-family:'Times New Roman',serif; font-size:12pt; margin:4px 0 10px 0;"><strong>S / D</strong></p>
<p style="font-family:'Times New Roman',serif; font-size:12pt; text-align:justify; margin:0 0 8px 0;">
Me dirijo a usted en carácter de letrado patrocinante de la parte peticionante en relación a los autos caratulados
<strong>“{{expediente}}”</strong>
que tramita ante el <strong>{{juzgado.nombre}}</strong>, a cargo de <strong>{{juzgado.juez}}</strong>,
<strong>{{juzgado.secretaria}}</strong>, sito en <strong>{{juzgado.domicilio}}</strong>, a fin de <u>{{finalidad}}</u>.
</p>
`.trim();
}

// Footer
const FOOTER_ENVIO_HTML = `
<p style="font-family:'Times New Roman',serif; font-size:12pt; margin:8px 0 8px 0;">
El presente oficio deberá ser contestado a la casilla de email del juzgado <strong>{{juzgado.email}}</strong>
CC a <strong>{{estudio.email}}</strong>.
</p>
<p style="font-family:'Times New Roman',serif; font-size:12pt; margin:6px 0 0 0;">Sin otro particular, saludo a Ud. atentamente.-</p>
`.trim();

// ===== TEMPLATES POR ORGANISMO =====
const TEMPLATE_AZOPARDO_HTML = `
${encabezadoHTML(
	"SR. JEFE DE LA POLICÍA FEDERAL (División Antecedentes)",
	"Azopardo 660, C.A.B.A."
)}
${datosInteresadoHTML()}
${parrafoAutoHTML()}
${BLOQUE_RECAUDOS_HTML}
${BLOQUE_ATRIBUCIONES_HTML}
${FOOTER_ENVIO_HTML}
`.trim();

const TEMPLATE_INTERPOL_HTML = `
${encabezadoHTML(
	"SEÑOR JEFE DE LA POLICÍA FEDERAL (División Interpol)",
	"Cavia 3320, C.A.B.A."
)}
${datosInteresadoHTML()}
${parrafoAutoHTML()}
${BLOQUE_RECAUDOS_HTML}
${BLOQUE_ATRIBUCIONES_HTML}
${FOOTER_ENVIO_HTML}
`.trim();

const TEMPLATE_MIGRACIONES_HTML = `
${encabezadoHTML("DIRECCIÓN NACIONAL DE MIGRACIONES", "")}
${datosInteresadoHTML()}
${parrafoAutoHTML()}
${BLOQUE_RECAUDOS_HTML}
${BLOQUE_ATRIBUCIONES_HTML}
${FOOTER_ENVIO_HTML}
`.trim();

const TEMPLATE_REINCIDENCIA_HTML = `
${encabezadoHTML(
	"SEÑOR DIRECTOR DEL REGISTRO NACIONAL DE REINCIDENCIA",
	"Tucumán 1363, C.A.B.A."
)}
${datosInteresadoHTML()}
${parrafoAutoHTML()}
${BLOQUE_RECAUDOS_HTML}
${BLOQUE_ATRIBUCIONES_HTML}
${FOOTER_ENVIO_HTML}
`.trim();

const TEMPLATE_RENAPER_HTML = `
${encabezadoHTML(
	"SEÑOR DIRECTOR DEL REGISTRO NACIONAL DE LAS PERSONAS",
	"Presidente Juan Domingo Perón 664, C.A.B.A."
)}
${datosInteresadoHTML()}
${parrafoAutoHTML()}
${BLOQUE_RECAUDOS_HTML}
${BLOQUE_ATRIBUCIONES_HTML}
${FOOTER_ENVIO_HTML}
`.trim();

// Finalidades
const FINALIDADES = {
	azopardo:
		"que se sirva confeccionar ficha dactiloscópica de la parte y luego informar si registra antecedentes",
	interpol:
		"que se sirva confeccionar ficha dactiloscópica de la parte y luego informar si registra antecedentes en la División Interpol",
	migraciones:
		"informar fehacientemente la situación de residencia del/la peticionante sobre la base de datos actualizados y documentación obrante",
	reincidencia:
		"informar si el/la peticionante registra antecedentes en ese Registro",
	renaper:
		"informar si el DNI del interesado es auténtico y expedirse sobre la regularidad y validez del trámite administrativo",
};

// Export
export const OFICIO_TEMPLATES_HTML = {
	azopardo: TEMPLATE_AZOPARDO_HTML,
	interpol: TEMPLATE_INTERPOL_HTML,
	migraciones: TEMPLATE_MIGRACIONES_HTML,
	reincidencia: TEMPLATE_REINCIDENCIA_HTML,
	renaper: TEMPLATE_RENAPER_HTML,
};

export const OFICIO_TEMPLATES_TEXT = Object.fromEntries(
	Object.entries(OFICIO_TEMPLATES_HTML).map(([k, html]) => [
		k,
		stripHtml(html),
	])
);

export function buildOficio(tipo, payload, opts = { format: "html" }) {
	const format = opts?.format || "html";
	const dict =
		format === "text" ? OFICIO_TEMPLATES_TEXT : OFICIO_TEMPLATES_HTML;
	const tpl = dict[tipo];
	if (!tpl) throw new Error(`Tipo de oficio inválido: ${tipo}`);
	const data = { finalidad: FINALIDADES[tipo], ...payload };
	return interpolate(tpl, data);
}
