"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import ClienteSelector from "./components/ClienteSelector";
import OficioPreview from "./components/OficioPreview";
import {
    fetchClientesToArray,
    fetchJuzgadosToArray,
    parseDependencia,
} from "./components/utils";
import { buildOficio } from "@/lib/oficios/templates";

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

export default function OficiosPage() {
    const [clientes, setClientes] = useState([]);
    const [juzgados, setJuzgados] = useState([]);
    const [selectedClienteId, setSelectedClienteId] = useState("");
    const [q, setQ] = useState("");
    const [selectedOficios, setSelectedOficios] = useState([]);
    const [fechaAutoTexto, setFechaAutoTexto] = useState("");
    const [generatedOficios, setGeneratedOficios] = useState([]);

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

    const selectedCliente = clientes.find((c) => c.id === selectedClienteId);

    function toggleOficio(id) {
        setSelectedOficios((prev) =>
            prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
        );
    }

    async function generarOficios() {
        if (!selectedCliente) return alert("Seleccioná un cliente");
        if (!fechaAutoTexto.trim()) return alert("Ingresá la fecha del auto");
        if (!selectedOficios.length) return alert("Seleccioná al menos un oficio");

        const dep = selectedCliente.dependencia || "";
        const { titulo, secretariaNumero } = parseDependencia(dep);

        const payload = {
            expediente: selectedCliente.expediente,
            caratula: `${selectedCliente.apellido}, ${selectedCliente.nombre} s/ CIUDADANÍA`,
            juzgado: { nombre: titulo, secretaria: secretariaNumero },
            cliente: selectedCliente,
            auto: { fechaTexto: fechaAutoTexto },
        };

        const previews = selectedOficios.map((id) => ({
            id,
            titulo: OFICIOS.find((o) => o.id === id)?.nombre || id,
            orgCode: ORG_CODE[id],
            cliente: `${selectedCliente.apellido} ${selectedCliente.nombre}`,
            html: buildOficio(id, payload, { format: "html" }),
        }));

        setGeneratedOficios(previews);
    }

    return (
        <main className={styles.page}>
            <header className={styles.headerRow}>
                <h2 className={styles.title}>Panel de Oficios Judiciales</h2>
            </header>

            <div className={styles.grid}>
                <section className={styles.leftCol}>
                    <h5 className={styles.sectionTitle}>Oficios disponibles</h5>
                    {OFICIOS.map((o) => (
                        <button
                            key={o.id}
                            type="button"
                            className={`${styles.card} ${selectedOficios.includes(o.id) ? styles.active : ""
                                }`}
                            onClick={() => toggleOficio(o.id)}
                        >
                            {o.nombre}
                        </button>
                    ))}
                </section>

                <aside className={styles.rightCol}>
                    <h5 className={styles.sectionTitle}>Cliente</h5>
                    <ClienteSelector
                        clientes={clientes}
                        q={q}
                        setQ={setQ}
                        selectedClienteId={selectedClienteId}
                        setSelectedClienteId={setSelectedClienteId}
                    />

                    <label className={styles.label}>Fecha del auto</label>
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
                        disabled={!selectedClienteId || !fechaAutoTexto || !selectedOficios.length}
                    >
                        Generar oficios
                    </button>
                </aside>
            </div>

            {generatedOficios.length > 0 && (
                <section className={styles.previewSection}>
                    <h4>Oficios generados</h4>
                    {generatedOficios.map((oficio) => (
                        <OficioPreview key={oficio.id} oficio={oficio} />
                    ))}
                </section>
            )}
        </main>
    );
}
