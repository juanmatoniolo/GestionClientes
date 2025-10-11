"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaFileAlt, FaCheck, FaDownload } from "react-icons/fa";
import styles from "./page.module.css";
import Fuse from "fuse.js";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import {
    fetchClientesToArray,
    fetchJuzgadosToArray,
    resolverDatosJuzgadoYSecretaria,
} from "./components/utils";

import { buildOficio } from "@/lib/oficios/templates";

/* ===================== Tipos de oficios disponibles ===================== */
const OFICIOS = [
    { id: "azopardo", nombre: "Azopardo (Policía Federal)" },
    { id: "interpol", nombre: "Interpol" },
    { id: "renaper", nombre: "RENAPER" },
    { id: "reincidencia", nombre: "Registro Nacional de Reincidencia" },
    { id: "migraciones", nombre: "Migraciones" },

    // Art. 400
    { id: "azopardo-art400", nombre: "Azopardo (Art. 400 CPCC)" },
    { id: "interpol-art400", nombre: "Interpol (Art. 400 CPCC)" },
    { id: "renaper-art400", nombre: "RENAPER (Art. 400 CPCC)" },
    { id: "reincidencia-art400", nombre: "RNR (Art. 400 CPCC)" },
    { id: "migraciones-art400", nombre: "Migraciones (Art. 400 CPCC)" },
];

const ORG_CODE = {
    azopardo: "AZOPARDO",
    interpol: "INTERPOL",
    renaper: "RENAPER",
    reincidencia: "RNR",
    migraciones: "MIGRACIONES",
    "azopardo-art400": "AZOPARDO-ART400",
    "interpol-art400": "INTERPOL-ART400",
    "renaper-art400": "RENAPER-ART400",
    "reincidencia-art400": "RNR-ART400",
    "migraciones-art400": "MIGRACIONES-ART400",
};

/* ===================== Tarjetas de selección ===================== */
function SelectableCard({ id, label, selected, onToggle }) {
    return (
        <button
            type="button"
            className={`${styles.card} ${selected ? styles.active : ""}`}
            onClick={() => onToggle(id)}
            onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    onToggle(id);
                }
            }}
            role="checkbox"
            aria-checked={selected}
            aria-pressed={selected}
        >
            <FaFileAlt className={styles.icon} aria-hidden="true" />
            <span className={styles.cardTitle}>{label}</span>
            {selected && (
                <span className={styles.checkedPill} aria-hidden="true">
                    <FaCheck />
                </span>
            )}
        </button>
    );
}

/* ===================== Página principal ===================== */
export default function OficiosPage() {
    const [selectedOficios, setSelectedOficios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [juzgados, setJuzgados] = useState([]);
    const [q, setQ] = useState("");
    const [selectedClienteId, setSelectedClienteId] = useState("");
    const [fechaAutoTexto, setFechaAutoTexto] = useState("");
    const [generatedOficios, setGeneratedOficios] = useState([]);
    const htmlRefs = useRef({});

    /* === Persistencia local === */
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("oficiosState") || "{}");
        if (saved.selectedOficios) setSelectedOficios(saved.selectedOficios);
        if (saved.selectedClienteId) setSelectedClienteId(saved.selectedClienteId);
        if (saved.fechaAutoTexto) setFechaAutoTexto(saved.fechaAutoTexto);
        if (saved.generatedOficios) setGeneratedOficios(saved.generatedOficios);
    }, []);

    useEffect(() => {
        const data = {
            selectedOficios,
            selectedClienteId,
            fechaAutoTexto,
            generatedOficios,
        };
        localStorage.setItem("oficiosState", JSON.stringify(data));
    }, [selectedOficios, selectedClienteId, fechaAutoTexto, generatedOficios]);

    /* === Carga de datos === */
    useEffect(() => {
        (async () => {
            const [cli, juz] = await Promise.all([
                fetchClientesToArray(),
                fetchJuzgadosToArray(),
            ]);
            setClientes(cli);
            setJuzgados(juz);
        })();
    }, []);

    /* === Buscador === */
    const clientesPreprocesados = useMemo(() => {
        return clientes.map((c) => ({
            ...c,
            expedienteDigits: c.expediente
                ? (c.expediente.match(/\d+/g) || []).join(" ")
                : "",
        }));
    }, [clientes]);

    const rows = useMemo(() => {
        if (!q.trim() || q.trim().length < 2) return [];
        const fuse = new Fuse(clientesPreprocesados, {
            keys: ["apellido", "nombre", "dni", "expediente", "expedienteDigits", "mail", "telefono"],
            threshold: 0.35,
            distance: 100,
        });
        return fuse.search(q).map((r) => r.item).slice(0, 25);
    }, [clientesPreprocesados, q]);

    const selectedCliente = useMemo(
        () => clientes.find((c) => c.id === selectedClienteId),
        [clientes, selectedClienteId]
    );

    const toggleOficio = (id) =>
        setSelectedOficios((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const clearSelection = () => setSelectedOficios([]);

    /* === Resolver juzgado === */
    async function resolverJuzgadoDesdeCliente(cliente) {
        const dep = (cliente?.dependencia || "").trim();
        if (!dep) return null;
        const juzgadoTpl = resolverDatosJuzgadoYSecretaria(dep, juzgados);
        return juzgadoTpl;
    }

    /* === Generar oficios === */
    const generarOficios = async () => {
        if (!selectedCliente) return alert("Elegí un cliente.");
        if (selectedOficios.length === 0)
            return alert("Seleccioná al menos un oficio.");
        if (!fechaAutoTexto.trim())
            return alert("Ingresá la fecha del auto.");

        const juzgadoTpl = await resolverJuzgadoDesdeCliente(selectedCliente);
        if (!juzgadoTpl)
            return alert("No se pudo determinar el juzgado del cliente.");

        const payloadBase = {
            expediente: selectedCliente.expediente || "",
            caratula: `${(selectedCliente.apellido || "").toUpperCase()}, ${(selectedCliente.nombre || "").toUpperCase()} s/ CIUDADANÍA`,
            juzgado: juzgadoTpl,
            estudio: { email: "abogado.santiagoroncero@gmail.com" },
            cliente: selectedCliente,
            auto: {
                fechaTexto: fechaAutoTexto.trim(),
                textoComplementario: "… recábese informes …",
                firmante: juzgadoTpl.juez,
            },
        };

        const previews = selectedOficios.map((id) => {
            const def = OFICIOS.find((o) => o.id === id);
            const html = buildOficio(id, payloadBase, { format: "html" });
            const text = buildOficio(id, payloadBase, { format: "text" });
            return {
                id,
                titulo: def?.nombre ?? id,
                orgCode: ORG_CODE[id] || id.toUpperCase(),
                cliente: `${selectedCliente.apellido ?? ""} ${selectedCliente.nombre ?? ""}`.trim(),
                html,
                text,
            };
        });

        setGeneratedOficios(previews);
    };

    /* === Descargar PDF individual === */
    const downloadPdf = async (oficio) => {
        try {
            const fileName = `${oficio.orgCode} - ${oficio.cliente}.pdf`;
            const res = await fetch("/api/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: oficio.id, html: oficio.html, filename: fileName }),
            });
            const blob = await res.blob();
            saveAs(blob, fileName);
        } catch (err) {
            console.error("❌ Error descargando PDF:", err);
        }
    };

    /* === Descargar todos (ZIP) === */
    const downloadAllPdfs = async () => {
        if (generatedOficios.length === 0) return;
        const zip = new JSZip();

        for (const oficio of generatedOficios) {
            try {
                const fileName = `${oficio.orgCode} - ${oficio.cliente}.pdf`;
                const res = await fetch("/api/pdf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tipo: oficio.id, html: oficio.html, filename: fileName }),
                });
                const blob = await res.blob();
                zip.file(fileName, blob);
            } catch (e) {
                console.error(`⚠️ Error con ${oficio.id}:`, e);
            }
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "oficios_generados.zip");
    };

    /* === Render === */
    return (
        <main className={styles.page}>
            <header className={styles.headerRow}>
                <h2 className={styles.title}>Dashboard de Oficios Judiciales</h2>
                <span className={styles.counterBadge}>
                    Seleccionados: <strong>{selectedOficios.length}</strong>
                </span>
            </header>

            <div className={styles.grid}>
                <section className={styles.leftCol}>
                    <h5 className={styles.sectionTitle}>Oficios disponibles</h5>
                    <button className={styles.btnSecondary} onClick={clearSelection}>
                        Limpiar selección
                    </button>

                    <div className={styles.cardsGrid}>
                        {OFICIOS.map((o) => (
                            <SelectableCard
                                key={o.id}
                                id={o.id}
                                label={o.nombre}
                                selected={selectedOficios.includes(o.id)}
                                onToggle={toggleOficio}
                            />
                        ))}
                    </div>
                </section>

                <aside className={styles.rightCol}>
                    <h5 className={styles.sectionTitle}>Datos del cliente</h5>

                    {selectedCliente ? (
                        <div className={styles.resultItemActive}>
                            <strong>
                                {selectedCliente.apellido}, {selectedCliente.nombre}
                            </strong>
                            {selectedCliente.dni && <span> · DNI {selectedCliente.dni}</span>}
                            {selectedCliente.expediente && (
                                <span> · Exp. {selectedCliente.expediente}</span>
                            )}
                            <button
                                type="button"
                                className={styles.btnPrimaryOutline}
                                onClick={() => setSelectedClienteId("")}
                                style={{ marginTop: ".5rem" }}
                            >
                                Cambiar cliente
                            </button>
                        </div>
                    ) : (
                        <>
                            <input
                                className={`${styles.input} ${styles.searchInput}`}
                                placeholder="Buscar cliente..."
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                            {q.trim().length >= 2 && (
                                <div className={styles.searchResults}>
                                    {rows.length > 0 ? (
                                        rows.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className={styles.resultItem}
                                                onClick={() => {
                                                    setSelectedClienteId(c.id);
                                                    setQ("");
                                                }}
                                            >
                                                {(c.apellido || "")} {(c.nombre || "")}
                                            </button>
                                        ))
                                    ) : (
                                        <div className={styles.resultEmpty}>Sin resultados…</div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    <label className={styles.label} style={{ marginTop: "1rem" }}>
                        Fecha del auto
                    </label>
                    <input
                        className={styles.input}
                        value={fechaAutoTexto}
                        onChange={(e) => setFechaAutoTexto(e.target.value)}
                        placeholder="11 de NOVIEMBRE de 2024"
                    />

                    <button className={styles.btnPrimary} onClick={generarOficios}>
                        Generar oficios
                    </button>
                </aside>
            </div>

            {/* === Previsualización === */}
            {generatedOficios.length > 0 && (
                <section className={styles.previewSection}>
                    <h4 className={styles.previewTitle}>Oficios generados</h4>

                    {/* Botonera unificada */}
                    <div className={styles.previewBtnsGroup}>
                        <button
                            className={styles.btnSuccess}
                            onClick={downloadAllPdfs}
                        >
                            <FaDownload /> Descargar todos (ZIP)
                        </button>
                        {generatedOficios.map((oficio) => (
                            <button
                                key={oficio.id}
                                className={styles.btnSuccessOutline}
                                onClick={() => downloadPdf(oficio)}
                            >
                                <FaDownload /> {oficio.titulo}
                            </button>
                        ))}
                    </div>

                    <div className={styles.previewGrid}>
                        {generatedOficios.map((oficio) => (
                            <div key={oficio.id} className={styles.cardPreview}>
                                <div
                                    className={styles.oficioDoc}
                                    dangerouslySetInnerHTML={{ __html: oficio.html }}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
