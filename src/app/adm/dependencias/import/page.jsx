// app/adm/dependencias/import/page.jsx
"use client";

import { useState } from "react";

export default function ImportDependenciasPage() {
    const [raw, setRaw] = useState("");
    const [preview, setPreview] = useState([]);
    const [msg, setMsg] = useState("");

    const parse = () => {
        setMsg("");
        const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length);
        const items = [];
        let current = null;
        let ciudadGlobal = "";
        let domicilioTemp = "";

        // Helpers
        const flush = () => { if (current) { items.push(current); current = null; } };
        const startJuzgado = (titulo, juez) => {
            current = {
                titulo,
                numero: extraerNumeroJuzgado(titulo),
                fuero: extraerFuero(titulo),
                ciudad: ciudadGlobal || "",
                juez: juez || "",
                domicilio: "",
                secretarias: []
            };
            domicilioTemp = "";
        };
        const pushSecretaria = (rotulo, numero) => {
            if (!current) return;
            current.secretarias.push({
                rotulo,
                numero: numero || null,
                telefonos: [],
                emails: []
            });
        };
        const addTelefono = (t) => {
            const sec = current?.secretarias?.[current.secretarias.length - 1];
            if (sec) {
                // separar por / y comas
                const parts = t.replace(/[()]/g, "").split(/[\/,]/).map(s => s.trim()).filter(Boolean);
                sec.telefonos.push(...parts);
            }
        };
        const addEmail = (l) => {
            const sec = current?.secretarias?.[current.secretarias.length - 1];
            if (!sec) return;
            const emails = l.split(/[\/\s]/).map(s => s.trim()).filter(s => s.includes("@"));
            sec.emails.push(...emails);
        };

        for (let i = 0; i < lines.length; i++) {
            const L = lines[i];

            // Detectar inicio de juzgado
            if (/^Juzgado/i.test(L)) {
                // Siguiente línea suele ser juez
                const juezLine = lines[i + 1] && !/^Secretar/i.test(lines[i + 1]) ? lines[i + 1] : "";
                flush();
                startJuzgado(L, juezLine);
                i += juezLine ? 1 : 0;
                continue;
            }

            // Detección de ciudad (CABA / Bahía Blanca / etc.)
            if (/Ciudad Autónoma de Buenos Aires/i.test(L)) {
                ciudadGlobal = "Ciudad Autónoma de Buenos Aires";
                if (current) current.ciudad = ciudadGlobal;
                continue;
            }
            if (/Bahia Blanca|Bahía Blanca/i.test(L)) {
                ciudadGlobal = "Bahía Blanca";
                if (current) current.ciudad = ciudadGlobal;
                continue;
            }
            if (/Santa Rosa/i.test(L)) {
                ciudadGlobal = "Santa Rosa";
                if (current) current.ciudad = ciudadGlobal;
                continue;
            }
            if (/Mar del Plata/i.test(L)) {
                ciudadGlobal = "Mar del Plata";
                if (current) current.ciudad = ciudadGlobal;
                continue;
            }
            if (/Azul/i.test(L) && !/Profesor/.test(L)) { // evita la calle larga
                ciudadGlobal = "Azul";
                if (current) current.ciudad = ciudadGlobal;
                continue;
            }
            if (/Necochea/i.test(L)) {
                ciudadGlobal = "Necochea";
                if (current) current.ciudad = ciudadGlobal;
                continue;
            }

            // Dirección: si parece domicilio (tiene calle / altura / piso / código)
            if (/[A-Za-zÁÉÍÓÚáéíóúñÑ]\s+\d+/.test(L) || /\(C\d{4}/i.test(L) || /Piso/i.test(L)) {
                domicilioTemp = L;
                if (current && !current.domicilio) current.domicilio = L;
                continue;
            }

            // Secretaría: “Secretaría Nro. X” o “Secretaría Civil Nro. X”, etc.
            if (/^Secretar(ía|ia)/i.test(L)) {
                const numero = extraerNumeroSecretaria(L);
                pushSecretaria(L, numero);
                continue;
            }

            // Teléfonos (líneas con números y guiones/espacios)
            if (/(\d{3,}[-\s]?\d{2,})|\(0\d{2,}\)/.test(L)) {
                addTelefono(L);
                continue;
            }

            // Emails
            if (/@pjn\.gov\.ar/i.test(L)) {
                addEmail(L);
                continue;
            }

            // Juez (si llega después por formato)
            if (/^(Dr\.|Dra\.)/i.test(L) && current && !current.juez) {
                current.juez = L;
                continue;
            }
        }
        flush();

        setPreview(items);
        setMsg(`Se detectaron ${items.length} juzgados. Revisá la vista previa y luego “Subir a Firebase”.`);
    };

    const upload = async () => {
        setMsg("Subiendo...");
        const res = await fetch("/api/juzgados/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: preview })
        });
        if (res.ok) setMsg("¡Listo! Dependencias subidas.");
        else {
            const j = await res.json().catch(() => ({}));
            setMsg(`Error al subir: ${j.error || res.statusText}`);
        }
    };

    return (
        <main className="container py-4">
            <h1 className="mb-3">Importar Dependencias</h1>
            <p className="text-muted">Pegá el texto completo y parseamos automáticamente a “juzgados” con sus secretarías.</p>

            <div className="mb-3">
                <label className="form-label">Texto de dependencias</label>
                <textarea className="form-control" rows={14} value={raw} onChange={e => setRaw(e.target.value)} placeholder="Pegá aquí el texto..." />
            </div>

            <div className="d-flex gap-2 mb-3">
                <button className="btn btn-outline-primary" onClick={parse} disabled={!raw.trim()}>Previsualizar</button>
                <button className="btn btn-success" onClick={upload} disabled={!preview.length}>Subir a Firebase</button>
            </div>

            {msg && <div className="alert alert-info">{msg}</div>}

            {!!preview.length && (
                <div className="table-responsive">
                    <table className="table table-sm table-striped align-middle">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Juez</th>
                                <th>Ciudad</th>
                                <th>Domicilio</th>
                                <th>Secretarías</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preview.map((j, idx) => (
                                <tr key={idx}>
                                    <td>{j.titulo}</td>
                                    <td>{j.juez}</td>
                                    <td>{j.ciudad}</td>
                                    <td>{j.domicilio}</td>
                                    <td>
                                        {j.secretarias?.map((s, k) => (
                                            <div key={k} className="mb-2">
                                                <div><strong>{s.rotulo}</strong> {s.numero ? `(Nro. ${s.numero})` : ""}</div>
                                                {s.telefonos?.length ? <div className="small">Tel: {s.telefonos.join(" / ")}</div> : null}
                                                {s.emails?.length ? <div className="small">Email: {s.emails.join(" / ")}</div> : null}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}

// ====== helpers de parsing ======
function extraerNumeroJuzgado(titulo) {
    const m = titulo.match(/Nro\.?\s*(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
}
function extraerFuero(titulo) {
    // "Juzgado Civil y Comercial Federal Nro. 1" -> "Civil y Comercial Federal"
    const m = titulo.match(/^Juzgado\s+(.+?)\s+Nro\./i);
    return m ? m[1].trim() : "";
}
function extraerNumeroSecretaria(line) {
    const m = line.match(/Nro\.?\s*(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
}
