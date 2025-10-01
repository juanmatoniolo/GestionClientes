"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaFileAlt, FaCheck } from "react-icons/fa";
import styles from "./page.module.css";
import { buildOficio } from "@/lib/oficios/templates";

/** Tipos disponibles */
const OFICIOS = [
    { id: "azopardo", nombre: "Azopardo (Policía Federal)" },
    { id: "migraciones", nombre: "Migraciones" },
    { id: "interpol", nombre: "Interpol" },
    { id: "rnr", nombre: "Registro Nacional de Reincidencia" },
    { id: "renaper", nombre: "RENAPER" },
];

/* ===================== Utils ===================== */
const stripAccents = (s = "") =>
    s.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const norm = (s = "") => stripAccents(s).trim().toLowerCase();
const onlyDigits = (s = "") => (s.match(/\d+/g) || []).join("");

/** "JUZGADO CIVIL Y COMERCIAL FEDERAL 2- SECRETARIA Nº 3" → { titulo, secretariaNumero } */
function parseDependencia(dep = "") {
    if (!dep) return { titulo: "", secretariaNumero: "" };
    const parts = dep.split(/\s*-\s*/); // ["JUZGADO ... 2", "SECRETARIA Nº 3"]
    const juzgadoParte = parts[0] || "";
    const secretariaParte = parts[1] || "";

    const titulo = juzgadoParte.trim();
    const m = secretariaParte?.match(/(secretar[íi]a|sec\.?)\s*(n[º°ro\.]*)?\s*(\d+)/i);
    const secretariaNumero = m?.[3] || onlyDigits(secretariaParte);
    return { titulo, secretariaNumero };
}

function pickNonEmpty(...vals) {
    for (const v of vals) if (v && String(v).trim()) return v;
    return "";
}

/** Secretarías: normalizar a array */
function normalizeSecretarias(secretarias) {
    if (Array.isArray(secretarias)) return secretarias;
    if (secretarias && typeof secretarias === "object") return Object.values(secretarias);
    return [];
}

/** Match flexible entre “dependencia.titulo” y el título/nombre del juzgado */
function matchJuzgado(depTitulo = "", jzTitulo = "") {
    const dep = norm(depTitulo);
    const jz = norm(jzTitulo);
    const nDep = onlyDigits(dep);
    const nJz = onlyDigits(jz);
    if (nDep && nJz && nDep !== nJz) return false;

    const drop = new Set([
        "juzgado",
        "nacional",
        "de",
        "del",
        "en",
        "primera",
        "instancia",
        "nro",
        "n°",
        "nº",
        "numero",
        "n",
    ]);
    const tokens = dep.split(/\s+/).filter((t) => t && !drop.has(t));
    return tokens.every((t) => jz.includes(t));
}

/** Arma los campos esperados por los templates */
function buildJuzgadoFromLookup(jz = {}, sec = {}, secNum = "") {
    const juez = pickNonEmpty(jz.juez, jz.juezTitular, jz.titular, jz.aCargo) || "";
    const domicilio = pickNonEmpty(jz.domicilio, jz.direccion) || "";
    const ciudad = pickNonEmpty(jz.ciudad, jz.localidad) || "";
    const secretariaLabel =
        sec?.titulo || sec?.rotulo || (secNum ? `Secretaría Nro. ${secNum}` : "Secretaría");

    const secTitular = pickNonEmpty(sec?.titular, sec?.aCargo, sec?.jefe, sec?.titularNombre);
    const secretaria = secTitular ? `${secretariaLabel} a cargo de ${secTitular}` : secretariaLabel;

    const email =
        (Array.isArray(sec?.emails) && sec.emails[0]) ||
        (Array.isArray(jz?.emails) && jz.emails[0]) ||
        jz?.email ||
        "";

    return {
        nombre: jz.titulo || jz.nombre || "",
        juez,
        secretaria,
        domicilio: ciudad ? `${domicilio}, ${ciudad}` : domicilio,
        email,
    };
}

/** Busca juzgado por título/nombre y secretaría por número */
function findJuzgadoAndSecretaria(juzgados = [], tituloDep = "", secNum = "") {
    const jz =
        juzgados.find((z) => matchJuzgado(tituloDep, z.titulo || z.nombre)) || null;

    if (!jz) return { jz: null, sec: null };

    const secArr = normalizeSecretarias(jz.secretarias);
    if (!secArr.length || !secNum) return { jz, sec: null };

    const sec =
        secArr.find((s) => String(s.numero ?? "") === String(secNum)) ||
        secArr.find((s) => onlyDigits(s.numero || s.rotulo || s.titulo || "").includes(secNum)) ||
        null;

    return { jz, sec };
}

/* ===================== Fetch helpers ===================== */
async function fetchJSON(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error("fetch error " + path);
    return r.json();
}

/** Clientes: /api/clientes devuelve objeto o {clientes:[...]}; normalizo a array */
async function fetchClientesToArray() {
    try {
        const j = await fetchJSON("/api/clientes");
        return Array.isArray(j?.clientes)
            ? j.clientes
            : j && typeof j === "object"
                ? Object.entries(j).map(([id, c]) => ({ id, ...c }))
                : [];
    } catch {
        return [];
    }
}

/** Juzgados: tu /api/juzgados devuelve objeto; normalizo a array */
async function fetchJuzgadosToArray() {
    try {
        const j = await fetchJSON("/api/juzgados");
        return Array.isArray(j?.juzgados)
            ? j.juzgados
            : j && typeof j === "object" && !j.error
                ? Object.entries(j).map(([id, z]) => ({ id, ...z }))
                : [];
    } catch {
        return [];
    }
}

/* ===================== UI ===================== */
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

export default function Page() {
    // selección de oficios
    const [selectedOficios, setSelectedOficios] = useState([]);

    // clientes
    const [clientes, setClientes] = useState([]);
    const [q, setQ] = useState("");
    const [selectedClienteId, setSelectedClienteId] = useState("");
    const searchInputRef = useRef(null);

    // juzgados
    const [juzgados, setJuzgados] = useState([]);

    // fecha del auto
    const [fechaAutoTexto, setFechaAutoTexto] = useState("");

    // previews
    const [generatedOficios, setGeneratedOficios] = useState([]);

    // cargar clientes y juzgados
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

    // filtro: no listar hasta que escriba 2+ chars; al seleccionar, se oculta
    const rows = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (selectedClienteId) return []; // ya seleccionado → oculto lista
        if (s.length < 2) return [];
        return clientes
            .filter((c) =>
                [
                    c.apellido,
                    c.nombre,
                    c.dni,
                    c.mail,
                    c.telefono,
                    c.pasaporteNumero,
                    c.pasaporteOrigen,
                    c.expediente,
                ]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(s))
            )
            .slice(0, 20);
    }, [clientes, q, selectedClienteId]);

    const selectedCliente = useMemo(
        () => clientes.find((c) => c.id === selectedClienteId),
        [clientes, selectedClienteId]
    );

    const toggleOficio = (id) => {
        setSelectedOficios((prev) =>
            prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
        );
    };

    const allIds = useMemo(() => OFICIOS.map((o) => o.id), []);
    const allSelected = selectedOficios.length === allIds.length;
    const selectAll = () => setSelectedOficios(allIds);
    const clearAll = () => setSelectedOficios([]);

    // mapea cliente → placeholders del template
    function mapClienteToTemplate(c) {
        if (!c) return {};
        return {
            apellido: (c.apellido || "").trim(),
            nombre: (c.nombre || "").trim(),
            sexo: c.sexo || c.genero || "",
            domicilio: c.domicilioReal || c.domicilio || c.direccion || "",
            pasaporte: c.pasaporteNumero || c.pasaporte || "",
            dni: (c.dni || "").toString(),
            estadoCivil: c.estadoCivil || "",
            fechaNacimiento: c.fechaNacimiento || "",
            lugarNacimiento: c.lugarNacimiento || "",
            padre: c.padre || "",
            madre: c.madre || "",
            fechaIngreso: c.fechaLlegada || c.fechaIngreso || "",
            medioIngreso: c.medioTransporte || c.medioIngreso || "",
        };
    }

    const onChooseCliente = (id) => {
        setSelectedClienteId(id); // solo uno
        setQ(""); // oculta resultados
        searchInputRef.current?.blur();
    };

    const resetCliente = () => {
        setSelectedClienteId("");
        setTimeout(() => searchInputRef.current?.focus(), 0);
    };

    async function resolverJuzgadoDesdeCliente(cliente) {
        const dep = (cliente?.dependencia || "").trim();
        if (!dep) return null;

        const { titulo, secretariaNumero } = parseDependencia(dep);
        const { jz, sec } = findJuzgadoAndSecretaria(juzgados, titulo, secretariaNumero);
        if (!jz) return null;

        return buildJuzgadoFromLookup(jz, sec, secretariaNumero);
    }

    const generarOficios = async () => {
        if (!selectedCliente) return alert("Elegí un cliente.");
        if (selectedOficios.length === 0) return alert("Seleccioná al menos un oficio.");
        if (!fechaAutoTexto.trim())
            return alert("Ingresá la fecha del auto (ej: 11 de NOVIEMBRE de 2024).");

        // Resolver juez/secretaría/domicilio/email según dependencia
        const juzgadoTpl = await resolverJuzgadoDesdeCliente(selectedCliente);
        if (!juzgadoTpl) {
            return alert(
                "No puedo completar Juzgado/Secretaría porque este cliente no tiene 'dependencia' válida.\n" +
                "Ejemplo esperado: 'JUZGADO CIVIL Y COMERCIAL FEDERAL 2- SECRETARIA Nº 3'."
            );
        }

        const payloadBase = {
            expediente: (selectedCliente.expediente || "").trim(),
            caratula: `${(selectedCliente.apellido || "").toUpperCase()}, ${(selectedCliente.nombre || "").toUpperCase()} s/ CIUDADANÍA`.trim(),
            juzgado: juzgadoTpl,
            estudio: { email: "abogado.santiagoroncero@gmail.com" },
            cliente: mapClienteToTemplate(selectedCliente),
            auto: {
                fechaTexto: fechaAutoTexto.trim(),
                textoComplementario:
                    "… recábese informes … del Registro Nacional de Personas …",
                firmante: "",
            },
        };

        const previews = selectedOficios.map((id) => {
            const def = OFICIOS.find((o) => o.id === id);
            const texto = buildOficio(id, payloadBase);
            return {
                id,
                titulo: def?.nombre ?? id,
                cliente: `${selectedCliente.apellido ?? ""} ${selectedCliente.nombre ?? ""}`.trim(),
                texto,
            };
        });

        setGeneratedOficios(previews);
    };

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>Dashboard de Oficios</h2>
                <span className={styles.counterBadge}>
                    Seleccionados: <strong>{selectedOficios.length}</strong>
                </span>
            </div>

            <div className={styles.grid}>
                {/* Selección de oficios */}
                <section className={styles.leftCol}>
                    <div className={styles.sectionHeader}>
                        <h5 className={styles.sectionTitle}>Oficios</h5>
                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={clearAll}
                                disabled={selectedOficios.length === 0}
                            >
                                Limpiar
                            </button>
                            <button
                                type="button"
                                className={styles.btnPrimaryOutline}
                                onClick={allSelected ? clearAll : selectAll}
                            >
                                {allSelected ? "Deseleccionar" : "Seleccionar todos"}
                            </button>
                        </div>
                    </div>

                    <div className={styles.cardsGrid}>
                        {OFICIOS.map((oficio) => (
                            <SelectableCard
                                key={oficio.id}
                                id={oficio.id}
                                label={oficio.nombre}
                                selected={selectedOficios.includes(oficio.id)}
                                onToggle={toggleOficio}
                            />
                        ))}
                    </div>
                </section>

                {/* Búsqueda de cliente + fecha del auto */}
                <aside className={styles.rightCol}>
                    <h5 className={styles.sectionTitle}>Cliente</h5>

                    {selectedCliente ? (
                        <div style={{ marginBottom: ".5rem" }}>
                            <div className={styles.resultItemActive}>
                                <strong>
                                    {(selectedCliente.apellido || "").trim()},{" "}
                                    {(selectedCliente.nombre || "").trim()}
                                </strong>
                                {selectedCliente.dni ? ` · DNI ${selectedCliente.dni}` : ""}
                                {selectedCliente.expediente ? ` · Exp. ${selectedCliente.expediente}` : ""}
                            </div>
                            <button
                                type="button"
                                className={styles.btnPrimaryOutline}
                                style={{ marginTop: ".4rem" }}
                                onClick={resetCliente}
                            >
                                Cambiar cliente
                            </button>
                        </div>
                    ) : (
                        <>
                            <input
                                ref={searchInputRef}
                                className={`${styles.input} ${styles.searchInput}`}
                                placeholder="Buscar por apellido, nombre, DNI, email…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />

                            {q.trim().length >= 2 && (
                                <div className={styles.searchResults}>
                                    {rows.map((c) => {
                                        const label = `${(c.apellido || "").trim()} ${(c.nombre || "").trim()}${c.dni ? ` · DNI ${c.dni}` : ""
                                            }${c.expediente ? ` · Exp. ${c.expediente}` : ""}`;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className={styles.resultItem}
                                                onClick={() => onChooseCliente(c.id)}
                                                title={label}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                    {!rows.length && (
                                        <div className={styles.resultEmpty}>Sin resultados…</div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    <label className={styles.label} style={{ marginTop: "1rem" }}>
                        Fecha del auto (solo: 11 de NOVIEMBRE de 2024)
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
                        disabled={!selectedClienteId || selectedOficios.length === 0 || !fechaAutoTexto.trim()}
                    >
                        Generar oficios
                    </button>
                </aside>
            </div>

            {/* PREVIEW DE OFICIOS */}
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
                                    <div className={styles.previewBtns} style={{ marginBottom: ".5rem" }}>
                                        <button
                                            className={styles.btnPrimaryOutline}
                                            onClick={() => navigator.clipboard.writeText(oficio.texto)}
                                        >
                                            Copiar texto
                                        </button>
                                    </div>
                                    <textarea
                                        readOnly
                                        className={styles.input}
                                        style={{ minHeight: 220, whiteSpace: "pre-wrap" }}
                                        value={oficio.texto}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
