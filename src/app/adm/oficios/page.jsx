"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaFileAlt, FaCheck } from "react-icons/fa";
import styles from "./page.module.css";
import Fuse from "fuse.js";

import {
    fetchClientesToArray,
    fetchJuzgadosToArray,
    parseDependencia,
    findJuzgadoAndSecretaria,
    buildJuzgadoFromLookup,
} from "./components/utils";

import { buildOficio } from "@/lib/oficios/templates";

/* ===================== Tipos disponibles ===================== */
const OFICIOS = [
    { id: "azopardo", nombre: "Azopardo (Policía Federal)" },
    { id: "migraciones", nombre: "Migraciones" },
    { id: "interpol", nombre: "Interpol" },
    { id: "reincidencia", nombre: "Registro Nacional de Reincidencia" },
    { id: "renaper", nombre: "RENAPER" },
];

const ORG_CODE = {
    azopardo: "AZOPARDO",
    migraciones: "MIGRACIONES",
    interpol: "INTERPOL",
    reincidencia: "RNR",
    renaper: "RENAPER",
};

/* ===================== UI: tarjetas ===================== */
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
            <span className={styles.cardMarker} aria-hidden="true" />
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

/* ===================== PAGE (UI) ===================== */
export default function OficiosPage() {
    const [selectedOficios, setSelectedOficios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [juzgados, setJuzgados] = useState([]);
    const [q, setQ] = useState("");
    const [selectedClienteId, setSelectedClienteId] = useState("");
    const [fechaAutoTexto, setFechaAutoTexto] = useState("");
    const [generatedOficios, setGeneratedOficios] = useState([]);
    const htmlRefs = useRef({});

    /* --- Cargar datos iniciales --- */
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

    /* ===================== Buscador de clientes ===================== */
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
            keys: [
                "apellido",
                "nombre",
                "dni",
                "expediente",
                "expedienteDigits",
                "mail",
                "telefono",
            ],
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

    /* --- Resolver juzgado --- */
    async function resolverJuzgadoDesdeCliente(cliente) {
        const dep = (cliente?.dependencia || "").trim();
        if (!dep) return null;
        const { titulo, secretariaNumero } = parseDependencia(dep);
        const { jz, sec } = findJuzgadoAndSecretaria(juzgados, titulo, secretariaNumero);
        if (!jz) return null;
        return buildJuzgadoFromLookup(jz, sec, secretariaNumero);
    }

    /* ===================== Generar oficios ===================== */
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

    /* ===================== Descargar PDF ===================== */
    const downloadPdf = async (oficio) => {
        try {
            const fileName = `${oficio.orgCode} - ${oficio.cliente}.pdf`;

            const res = await fetch("/api/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    html: oficio.html,
                    filename: fileName,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                console.error("Error generando PDF:", msg);
                alert("Error al generar el PDF (ver consola)");
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("❌ Error descargando PDF:", err);
            alert("No se pudo descargar el PDF.");
        }
    };

    /* ===================== Render ===================== */
    return (
        <main className={styles.page}>
            <header className={styles.headerRow}>
                <h2 className={styles.title}>Dashboard de Oficios</h2>
                <span className={styles.counterBadge}>
                    Seleccionados: <strong>{selectedOficios.length}</strong>
                </span>
            </header>

            <div className={styles.grid}>
                {/* ----------------- Columna izquierda ----------------- */}
                <section className={styles.leftCol}>
                    <div className={styles.sectionHeader}>
                        <h5 className={styles.sectionTitle}>Oficios</h5>
                        <button
                            className={styles.btnSecondary}
                            type="button"
                            onClick={clearSelection}
                        >
                            Limpiar
                        </button>
                    </div>

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

                {/* ----------------- Columna derecha ----------------- */}
                <aside className={styles.rightCol}>
                    <h5 className={styles.sectionTitle}>Cliente</h5>

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
                                placeholder="Buscar por apellido, nombre, DNI o N° de expediente (ej: 025817)…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />

                            {q.trim().length >= 2 && (
                                <div className={styles.searchResults}>
                                    {rows.length > 0 ? (
                                        rows.map((c) => {
                                            const label = `${(c.apellido || "").trim()} ${(c.nombre || "").trim()}${c.dni ? ` · DNI ${c.dni}` : ""}${c.expediente ? ` · Exp. ${c.expediente}` : ""}`;
                                            return (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    className={styles.resultItem}
                                                    onClick={() => {
                                                        setSelectedClienteId(c.id);
                                                        setQ("");
                                                    }}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className={styles.resultEmpty}>Sin resultados…</div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    <label className={styles.label} style={{ marginTop: "1rem" }}>
                        Fecha del auto (ej: 11 de NOVIEMBRE de 2024)
                    </label>
                    <input
                        className={styles.input}
                        value={fechaAutoTexto}
                        onChange={(e) => setFechaAutoTexto(e.target.value)}
                        placeholder="11 de NOVIEMBRE de 2024"
                    />

                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={generarOficios}
                    >
                        Generar oficios
                    </button>
                </aside>
            </div>

            {/* ----------------- Sección de previews ----------------- */}
            {generatedOficios.length > 0 && (
                <section className={styles.previewSection}>
                    <h4 className={styles.previewTitle}>Oficios generados</h4>
                    <div className={styles.previewGrid}>
                        {generatedOficios.map((oficio) => (
                            <div key={oficio.id} className={styles.cardPreview}>
                                <div className={styles.cardPreviewBody}>
                                    <h5 className={styles.cardPreviewTitle}>{oficio.titulo}</h5>
                                    <p className={styles.cardPreviewText}>
                                        Cliente: <strong>{oficio.cliente}</strong>
                                    </p>
                                    <div className={styles.previewBtns}>
                                        <button
                                            className={styles.btnSuccessOutline}
                                            onClick={() => downloadPdf(oficio)}
                                        >
                                            Descargar PDF (Judicial A4)
                                        </button>
                                    </div>
                                    <div
                                        className={styles.oficioDoc}
                                        ref={(el) => (htmlRefs.current[oficio.id] = el)}
                                        dangerouslySetInnerHTML={{ __html: oficio.html }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
