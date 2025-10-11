import { NextResponse } from "next/server";
import { buildOficio } from "@/lib/oficios/templates";

let puppeteer;
let chromium;

/**
 * Carga dinámica de librerías según entorno (local o Vercel)
 */
async function getPuppeteerConfig() {
	const isLocal =
		process.env.NODE_ENV === "development" ||
		process.platform === "win32" ||
		process.platform === "darwin";

	if (isLocal) {
		// 🖥️ Entorno local: usar Puppeteer completo
		const localPuppeteer = (await import("puppeteer")).default;
		return {
			isLocal: true,
			puppeteer: localPuppeteer,
		};
	} else {
		// ☁️ Entorno serverless (Vercel, AWS, etc): usar Chromium + Core
		const core = (await import("puppeteer-core")).default;
		const chrome = (await import("@sparticuz/chromium")).default;
		return {
			isLocal: false,
			puppeteer: core,
			chromium: chrome,
		};
	}
}

/**
 * Genera un PDF a partir del HTML de un oficio judicial.
 * Si se pasa `tipo` y no `html`, puede reconstruir el oficio en el backend.
 */
export async function POST(req) {
	try {
		const {
			tipo,
			html,
			filename = "oficio.pdf",
			payload,
		} = await req.json();

		if (!tipo && !html) {
			return NextResponse.json(
				{ error: "Faltan parámetros obligatorios (tipo o html)." },
				{ status: 400 }
			);
		}

		// Si el HTML no se envía, pero sí el tipo + payload → se reconstruye
		let finalHtml = html;
		if (!finalHtml && tipo && payload) {
			try {
				finalHtml = buildOficio(tipo, payload, { format: "html" });
			} catch (e) {
				console.error("❌ Error reconstruyendo HTML:", e);
				return NextResponse.json(
					{ error: `No se pudo construir el oficio (${tipo}).` },
					{ status: 400 }
				);
			}
		}

		if (!finalHtml || !finalHtml.trim()) {
			return NextResponse.json(
				{ error: "HTML vacío o no válido recibido." },
				{ status: 400 }
			);
		}

		// ===========================
		// Detectar entorno y configurar Puppeteer
		// ===========================
		const { isLocal, puppeteer, chromium } = await getPuppeteerConfig();

		let browser;
		if (isLocal) {
			console.log("🚀 Usando Puppeteer local (modo desarrollo)");
			browser = await puppeteer.launch({
				headless: true,
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
			});
		} else {
			console.log(
				"☁️ Usando Puppeteer-Core + Chromium (Vercel/Serverless)"
			);
			const executablePath =
				(await chromium.executablePath()) ||
				puppeteer.executablePath?.() ||
				null;

			browser = await puppeteer.launch({
				args: [
					...chromium.args,
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-dev-shm-usage",
					"--disable-gpu",
					"--single-process",
				],
				defaultViewport: chromium.defaultViewport,
				executablePath,
				headless: chromium.headless,
			});
		}

		// ===========================
		// Generación del PDF
		// ===========================
		const page = await browser.newPage();

		try {
			await page.setContent(finalHtml, {
				waitUntil: ["load", "domcontentloaded", "networkidle0"],
				timeout: 30000,
			});
		} catch (err) {
			console.error("⚠️ Error al setear contenido HTML:", err);
			await browser.close();
			return NextResponse.json(
				{ error: "HTML inválido o con errores de carga." },
				{ status: 400 }
			);
		}

		const pdfBuffer = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: {
				top: "25mm",
				bottom: "25mm",
				left: "20mm",
				right: "20mm",
			},
			preferCSSPageSize: true,
		});

		await browser.close();

		return new NextResponse(pdfBuffer, {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (err) {
		console.error("❌ Error interno generando PDF:", err);
		return NextResponse.json(
			{ error: err.message || "Error interno al generar PDF." },
			{ status: 500 }
		);
	}
}
