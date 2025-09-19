"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./cliente.module.css"; // ⬅️ asegurate que el archivo exista en el mismo folder
import Loading from "./loading";

export default function ClientesList() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");

    useEffect(() => {
        fetch("/api/clientes", { cache: "no-store" })
            .then((r) => r.json())
            .then((j) => {
                setData(j || {});
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const rows = useMemo(() => {
        const arr = Object.entries(data).map(([id, c]) => ({ id, ...c }));
        if (!q.trim()) return arr;
        const s = q.toLowerCase();
        return arr.filter((c) =>
            [
                c.apellido,
                c.nombre,
                c.dni,
                c.mail,
                c.telefono,
                c.pasaporteNumero,
                c.pasaporteOrigen,
            ]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(s))
        );
    }, [data, q]);

    if (loading) return <> <Loading /> </>;

    return (
        <main className={`container py-4 ${styles.page}`}>
            <div
                className={`d-flex justify-content-between align-items-center mb-3 ${styles.header}`}
            >
                <h1 className="m-0">Clientes</h1>
                <Link prefetch className={`btn btn-primary ${styles.addBtn}`} href="/adm/clientes/nuevo">
                    Agregar
                </Link>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-12 col-md-6">
                    <input
                        className={`form-control ${styles.search}`}
                        placeholder="Buscar por apellido, nombre, DNI, email…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
            </div>

            {!rows.length ? (
                <div className={`alert alert-info ${styles.alert}`}>
                    No hay clientes (o la búsqueda no encontró resultados).
                </div>
            ) : (
                <>
                    {/* Tabla para desktop/tablet */}
                    <div className={`table-responsive ${styles.tableWrap}`}>
                        <table className="table table-sm table-striped align-middle">
                            <thead>
                                <tr>
                                    <th>Apellido</th>
                                    <th>Nombre</th>
                                    <th>DNI</th>
                                    <th>Nacionalidad</th>
                                    <th>Teléfono</th>
                                    <th>Mail</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.apellido}</td>
                                        <td>{c.nombre}</td>
                                        <td>{c.dni}</td>
                                        <td>{c.nacionalidad}</td>
                                        <td>{c.telefono}</td>
                                        <td className={styles.emailCell}>{c.mail}</td>
                                        <td>
                                            <Link
                                                prefetch
                                                className="btn btn-sm btn-outline-secondary"
                                                href={`/adm/clientes/${c.id}`}
                                            >
                                                Editar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Cards móviles */}
                    <div className={styles.cardsMobile}>
                        {rows.map((c) => (
                            <div key={c.id} className={styles.cardItem}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatar}>
                                        {String(c.apellido || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.titleBlock}>
                                        <div className={styles.title}>
                                            {c.apellido || "-"}, {c.nombre || "-"}
                                        </div>
                                        {c.dni ? (
                                            <div className={styles.subtle}>DNI: {c.dni}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className={styles.cardBody}>
                                    <div className={styles.rowLine}>
                                        <span className={styles.k}>Nacionalidad</span>
                                        <span className={styles.v}>{c.nacionalidad || "-"}</span>
                                    </div>
                                    <div className={styles.rowLine}>
                                        <span className={styles.k}>Teléfono</span>
                                        <span className={styles.v}>{c.telefono || "-"}</span>
                                    </div>
                                    <div className={styles.rowLine}>
                                        <span className={styles.k}>Mail</span>
                                        <span className={styles.v}>{c.mail || "-"}</span>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <Link
                                        prefetch
                                        className="btn btn-sm btn-outline-secondary"
                                        href={`/adm/clientes/${c.id}`}
                                    >
                                        Editar
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className={styles.footerGap} />
        </main>
    );
}
