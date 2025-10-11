/************************************************************
 * 📘 UTILIDADES
 ************************************************************/

// Interpola {{placeholders}} con datos reales del payload
export function interpolate(template, data = {}) {
	return template.replace(/\{\{(\s*[^}]+\s*)\}\}/g, (_, key) => {
		const path = key.trim().split(".");
		let val = data;
		for (const k of path) val = val?.[k];
		return (val ?? "").toString().toUpperCase();
	});
}

// Quita HTML → útil si querés texto plano
function stripHtml(html = "") {
	return html
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/p>/gi, "\n\n")
		.replace(/<[^>]+>/g, "")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

/************************************************************
 * 📘 BLOQUES COMUNES
 ************************************************************/

const BLOQUE_RECAUDOS_HTML = `
<p style="font-family:'Times New Roman',serif; font-size:8pt;">
<strong>RECAUDOS. PLAZOS PARA LA CONTESTACION. Art. 398. -</strong> Las oficinas públicas y las entidades privadas deberán contestar el pedido de informes o remitir el expediente dentro de los diez días hábiles, salvo que la providencia que lo haya ordenado hubiere fijado otro plazo en razón de la naturaleza del juicio o de circunstancias especiales. No podrán establecer recaudos que no estuvieran autorizados por ley. Los oficios librados deberán ser recibidos obligatoriamente a su presentación.
</p>
<p style="font-family:'Times New Roman',serif; font-size:8pt;">
El juez deberá aplicar sanciones conminatorias progresivas en el supuesto de atraso injustificado en las contestaciones de informes. La apelación que se dedujera contra la resolución que impone sanciones conminatorias tramita en expediente separado.
</p>
`.trim();

/************************************************************
 * 📘 BLOQUE ATRIBUCIONES (Art. 400)
 ************************************************************/
const BLOQUE_ATRIBUCIONES_HTML = `
<p style="font-family:'Times New Roman',serif; font-size:8pt;">
<strong><u>ATRIBUCIONES DE LOS LETRADOS PATROCINANTES (Art. 400 CPCC):</u></strong>
Los pedidos de informes, testimonios y certificados ordenados en el juicio serán requeridos por medio de oficios firmados, sellados y diligenciados por el letrado patrocinante con transcripción de la resolución que los ordena y que fija el plazo en que deberán remitirse. Las respuestas deben remitirse directamente a la secretaría con transcripción o copia del oficio.
</p>
<p style="font-family:'Times New Roman',serif; font-size:8pt;">
Cuando en la redacción de los oficios los profesionales se apartaren de lo establecido en la providencia que los ordena o de las formas legales, su responsabilidad disciplinaria se hará efectiva de oficio o a petición de parte.
</p>
`.trim();

/************************************************************
 * 📘 DATOS DEL INTERESADO
 ************************************************************/
function datosInteresadoHTML() {
	const R = (k, label) => `
	<p style="font-family:'Times New Roman',serif;font-size:12pt;margin:0 0 4px 0;">
		${label}: <strong>{{cliente.${k}}}</strong>
	</p>`;

	return `
<div style="text-align:center; margin:12px 0;">
	<p style="font-family:'Times New Roman',serif;font-size:12pt;font-weight:bold;">
		LOS DATOS DEL INTERESADO SON:
	</p>
	<div style="display:inline-block; text-align:justify;">
		${R("apellido", "APELLIDO")}
		${R("nombre", "NOMBRE")}
		${R("sexo", "SEXO")}
		${R("domicilio", "DOMICILIO")}
		${R("dni", "DNI")}
		${R("estadoCivil", "ESTADO CIVIL")}
		${R("fechaNacimiento", "FECHA DE NACIMIENTO")}
		${R("lugarNacimiento", "LUGAR DE NACIMIENTO")}
		${R("padre", "PADRE")}
		${R("madre", "MADRE")}
		${R("fechaIngreso", "FECHA DE INGRESO AL PAÍS")}
		${R("medioIngreso", "MEDIO DE INGRESO AL PAÍS")}
	</div>
</div>
`.trim();
}

/************************************************************
 * 📘 PÁRRAFO DEL AUTO NORMAL
 ************************************************************/
function parrafoAutoHTML() {
	return `
<p style="font-family:'Times New Roman',serif;font-size:12pt;text-align:justify;">
El auto que ordena la medida en su parte pertinente reza:
<em>“Buenos Aires, {{auto.fechaTexto}}. {{auto.textoComplementario}}”</em>
FIRMADO: <strong>{{auto.firmante}}</strong>, JUEZ FEDERAL.-
</p>
`.trim();
}

/************************************************************
 * 📘 TEXTO DINÁMICO DEL ART. 400
 ************************************************************/
function textoArt400HTML(juzgado) {
	const jnum = juzgado?.numero || "X";
	const snum = juzgado?.secretariaNumero || "Y";

	const mail1 = `jncivcomfed${jnum}.sec${snum}.ciudadania@pjn.gov.ar`;
	const mail2 = `jncivcomfed${jnum}.sec${parseInt(snum) + 1 || snum}.ciudadania@pjn.gov.ar`;

	return `
<p style="font-family:'Times New Roman',serif;font-size:12pt;text-align:justify;">
El auto que ordena la medida en su parte pertinente reza:
“Buenos Aires, {{auto.fechaTexto}}. Hábida cuenta lo solicitado por la representación letrada y el cúmulo de tareas que pesa actualmente por el tribunal, cúmplase con los informes indicados en el auto inaugural en los términos del art. 400 del CPCC, cuya confección y envío correrán a cargo de su asistencia letrada bajo la responsabilidad que la norma citada impone y que, las respuestas podrán ser remitidas al correo electrónico institucional de ${mail1} o ${mail2}, a la Policía Federal Argentina – División Interpol mediante correo electrónico a la dirección ‘ciudadania@interpol.gov.ar’, al Registro Nacional de las Personas mediante correo electrónico a la dirección cartasdeciudadania@renaper.gob.ar, a la Dirección Nacional de Migraciones, a la Policía Federal Argentina – División Dactiloscopia y al Registro Nacional de Reincidencia, a fin de que se sirvan informar a este Tribunal si registra antecedentes ante el organismo a su cargo conforme lo establecido por el ap. 3°, 2° párrafo del artículo 51 del Código Penal (conf. art. 3° ap. 3°, incs. b) y c) del Dec. 3213/84). En tales requerimientos deberán consignarse los datos del tribunal y personales que se detallan a continuación tal como surgen consignados en la documentación aportada: APELLIDOS y NOMBRES, SEXO, LUGAR DE NACIMIENTO, FECHA DE NACIMIENTO, DOCUMENTO (tipo y número), PADRE (Nombre y Apellido), MADRE (Nombre y Apellido), ESTADO CIVIL, DOMICILIO, FECHA DE INGRESO AL PAÍS, RADICACIÓN y MEDIO DE TRANSPORTE UTILIZADO. En caso de no encontrarse contestados los pedidos de informes mencionados, reitérense dichos instrumentos a los mismos fines y efectos que los anteriores.”
FIRMADO: <strong>{{auto.firmante}}</strong>, JUEZ FEDERAL.-
</p>
`.trim();
}

/************************************************************
 * 📘 ENCABEZADO DEL OFICIO
 ************************************************************/
function encabezadoHTML(tituloDest, direccionDest) {
	const dirLine = direccionDest ? `<div>${direccionDest}</div>` : "";
	return `
<p style="text-align:center;font-family:'Times New Roman',serif;font-size:12pt;">
<strong><u>OFICIO JUDICIAL.-</u></strong>
</p>
<p style="font-family:'Times New Roman',serif;font-size:12pt;text-align:start;">
<strong>${tituloDest}</strong><br/>${dirLine}
</p>
<p style="font-family:'Times New Roman',serif;font-size:12pt;text-align:start;">
<strong>S______/______D </strong>
</p>
<p style="font-family:'Times New Roman',serif;font-size:12pt;text-align:justify;">
&emsp;&emsp;&emsp;&emsp;Me dirijo a usted en carácter de letrado patrocinante de la parte peticionante en relación a los autos caratulados
<strong>“{{expediente}}”</strong>, que tramita ante el JUZGADO
{{juzgado.fuero}} N° {{juzgado.numero}},
a cargo del Dr. {{juzgado.juez}},
Secretaría N° {{juzgado.secretariaNumero}} a cargo de la Dra. {{juzgado.secretario}},
sito en {{juzgado.domicilio}},
a fin de solicitarle tenga a bien <u>{{finalidad}}</u>.
</p>
`.trim();
}

/************************************************************
 * 📘 FOOTER FINAL
 ************************************************************/
const FOOTER_ENVIO_HTML = `
<p style="font-family:'Times New Roman',serif;font-size:12pt;text-align:justify;">
El presente oficio deberá ser contestado a la casilla de email del juzgado
<strong>{{juzgado.email}}</strong>, con copia a <strong>{{estudio.email}}</strong>.
</p>
<p style="font-family:'Times New Roman',serif;font-size:12pt;text-align:end;">
Sin otro particular, saludo a Ud. atentamente.-
</p>
`.trim();

/************************************************************
 * 📘 FINALIDADES POR ORGANISMO
 ************************************************************/
const FINALIDADES = {
	azopardo: "que se sirva confeccionar ficha dactiloscópica de la parte y luego informar si registra antecedentes",
	interpol: "que se sirva confeccionar ficha dactiloscópica de la parte y luego informar si registra antecedentes en la División Interpol",
	migraciones: "informar fehacientemente la situación de residencia del/la peticionante sobre la base de datos actualizados y documentación obrante",
	reincidencia: "informar si el/la peticionante registra antecedentes en ese Registro",
	renaper: "informar si el DNI del interesado es auténtico y expedirse sobre la regularidad y validez del trámite administrativo (conf. Art. 6º inc. 3º Res. 38/92 de la Procuración General de la Nación).",
};

/************************************************************
 * 📘 ENCABEZADOS (EDITABLES POR ORGANISMO)
 ************************************************************/
const TEMPLATE_BASES = {
	azopardo: encabezadoHTML("SR. JEFE DE LA POLICÍA FEDERAL ARGENTINA", "(División Antecedentes), Azopardo 620/660, C.A.B.A."),
	interpol: encabezadoHTML("SEÑOR JEFE DE LA POLICÍA FEDERAL ARGENTINA", "(División INTERPOL), Cavia 3320, C.A.B.A."),
	migraciones: encabezadoHTML("SEÑOR DIRECTOR NACIONAL DE MIGRACIONES", "Av. Antártida Argentina 1355, C.A.B.A."),
	reincidencia: encabezadoHTML("AL SEÑOR DIRECTOR DEL REGISTRO NACIONAL DE REINCIDENCIA ESTADISTICA CRIMINAL Y CARCELARIA", "Tucumán 1363, C.A.B.A."),
	renaper: encabezadoHTML("SEÑOR DIRECTOR DEL REGISTRO NACIONAL DE LAS PERSONAS", "Pres. Juan D. Perón 664, C.A.B.A."),
};

/************************************************************
 * 📘 CONSTRUCCIÓN FINAL DEL OFICIO
 ************************************************************/
export function buildOficio(tipo, payload, opts = { format: "html" }) {
	const format = opts?.format || "html";
	const tipoBase = tipo.replace(/-art400$/, "");
	const isArt400 = tipo.endsWith("-art400");

	const base = TEMPLATE_BASES[tipoBase];
	if (!base) throw new Error(`Tipo de oficio inválido: ${tipo}`);

	let cuerpo = `
${base}
${datosInteresadoHTML()}
${isArt400 ? textoArt400HTML(payload.juzgado) : parrafoAutoHTML()}
${BLOQUE_RECAUDOS_HTML}
${BLOQUE_ATRIBUCIONES_HTML}
${FOOTER_ENVIO_HTML}
`.trim();

	const data = { finalidad: FINALIDADES[tipoBase], ...payload };
	const html = interpolate(cuerpo, data);
	return format === "text" ? stripHtml(html) : html;
}

export const OFICIO_TEMPLATES_HTML = {};
export const OFICIO_TEMPLATES_TEXT = {};
