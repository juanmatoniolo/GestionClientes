"use client";

import Fuse from "fuse.js";
import { useMemo, useRef } from "react";
import styles from "../page.module.css";

export default function ClienteSelector({
    clientes,
    q,
    setQ,
    selectedClienteId,
    setSelectedClienteId,
}) {
    const inputRef = useRef(null);

    // Prepara los clientes con campo expedienteDigits para búsqueda exacta
    const preprocessed = useMemo(() => {
        return clientes.map((c) => ({
            ...c,
            expedienteDigits: c.expediente ? (c.expediente.match(/\d+/g) || []).join(" ") : "",
        }));
    }, [clientes]);

    // Fuse.js search con prioridad a números de expediente o DNI
    const rows = useMemo(() => {
        if (!preprocessed.length || q.trim().length < 2) return [];
        const fuse = new Fuse(preprocessed, {
            keys: ["apellido", "nombre", "dni", "expedienteDigits", "expediente"],
            threshold: 0.35,
            distance: 100,
        });
        return fuse.search(q).map((r) => r.item).slice(0, 20);
    }, [preprocessed, q]);

    const selectedCliente = useMemo(
        () => preprocessed.find((c) => c.id === selectedClienteId),
        [preprocessed, selectedClienteId]
    );

    return (
        <div className={styles.selectorContainer}>
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
                        onClick={() => {
                            setSelectedClienteId("");
                            setQ("");
                            inputRef.current?.focus();
                        }}
                    >
                        Cambiar cliente
                    </button>
                </div>
            ) : (
                <>
                    <input
                        ref={inputRef}
                        className={`${styles.input} ${styles.searchInput}`}
                        placeholder="Buscar cliente por nombre, DNI o expediente (ej: 025817)…"
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
        </div>
    );
}
