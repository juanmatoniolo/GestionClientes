import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

/**
 * Genera un PDF a partir de HTML usando Puppeteer + Chromium sin sandbox.
 */
export async function POST(req) {
	try {
		const { html, filename = "oficio.pdf" } = await req.json();

		if (!html || !html.trim()) {
			return NextResponse.json(
				{ error: "HTML vacío recibido" },
				{ status: 400 }
			);
		}

		// Configuración del navegador
		const executablePath =
			(await chromium.executablePath()) ||
			puppeteer.executablePath?.() ||
			null;

		const browser = await puppeteer.launch({
			args: [
				...chromium.args,
				"--no-sandbox",
				"--disable-setuid-sandbox",
			],
			defaultViewport: chromium.defaultViewport,
			executablePath,
			headless: chromium.headless,
		});

		const page = await browser.newPage();

		// Si el HTML no es válido, Puppeteer lanza error. Envolvemos con try/catch interno.
		try {
			await page.setContent(html, {
				waitUntil: ["load", "domcontentloaded", "networkidle0"],
				timeout: 30000,
			});
		} catch (err) {
			console.error("⚠️ Error al setear contenido HTML:", err);
			await browser.close();
			return NextResponse.json(
				{ error: "HTML inválido o incompleto" },
				{ status: 400 }
			);
		}

		const pdfBuffer = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: {
				top: "20mm",
				bottom: "20mm",
				left: "20mm",
				right: "20mm",
			},
		});

		await browser.close();

		// Devuelve el PDF correctamente como binario
		return new NextResponse(pdfBuffer, {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (err) {
		console.error("❌ Error interno generando PDF:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
