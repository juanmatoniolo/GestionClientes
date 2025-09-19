// app/adm/juzgados/page.client.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import Loading from "../loading";

function ListSkeleton() {
    return (
        <div className={styles.cardsMobile}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className={`${styles.cardItem} ${styles.skelCard}`}
                    role="status"
                    aria-busy="true"
                >
                    <div className={styles.cardHeader}>
                        <div className={`${styles.skel} ${styles.skelAvatar}`} />
                        <div className={styles.titleBlock}>
                            <div className={`${styles.skel} ${styles.skelTitle}`} />
                            <div className={`${styles.skel} ${styles.skelSub}`} />
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={`${styles.skel} ${styles.skelLine}`} />
                        <div className={`${styles.skel} ${styles.skelLine}`} />
                    </div>
                    <div className={styles.cardActions}>
                        <div className={`${styles.skel} ${styles.skelBtn}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Props:
 *   initialData?: object  (opcional: para SSR con datos iniciales)
 */
export default function JuzgadosList({ initialData = null }) {
    const [data, setData] = useState(initialData || {});
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        if (initialData) return; // ya vino del servidor
        fetch("/api/juzgados", { cache: "no-store" })
            .then((r) => r.json())
            .then((j) => {
                setData(j || {});
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [initialData]);

    const rows = useMemo(
        () => Object.entries(data).map(([id, j]) => ({ id, ...j })),
        [data]
    );

    return (
        <main className={`container py-4 ${styles.page}`}>
            <div
                className={`d-flex justify-content-between align-items-center mb-3 ${styles.header}`}
            >
                <h1 className="m-0">Juzgados</h1>
                <Link className={`btn btn-primary ${styles.addBtn}`} href="/adm/juzgados/nuevo">
                    Agregar
                </Link>
            </div>

            {loading ? (
                <>
                    {/* Skeleton para mobile */}
                    <Loading />

                    {/* Skeleton para desktop */}
                    <div className={`table-responsive ${styles.tableWrap}`}>
                        <table className="table table-sm table-striped align-middle">
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Juez</th>
                                    <th>Ciudad</th>
                                    <th>Secretarías</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className={`${styles.skel} ${styles.skelTd}`} />
                                        </td>
                                        <td>
                                            <div className={`${styles.skel} ${styles.skelTd}`} />
                                        </td>
                                        <td>
                                            <div className={`${styles.skel} ${styles.skelTd}`} />
                                        </td>
                                        <td>
                                            <div className={`${styles.skel} ${styles.skelTdSm}`} />
                                        </td>
                                        <td>
                                            <div className={`${styles.skel} ${styles.skelBtnSm}`} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : !rows.length ? (
                <div className={`alert alert-info ${styles.alert}`}>No hay registros.</div>
            ) : (
                <>
                    {/* Tabla (desktop/tablet) */}
                    <div className={`table-responsive ${styles.tableWrap}`}>
                        <table className="table table-sm table-striped align-middle">
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Juez</th>
                                    <th>Ciudad</th>
                                    <th>Secretarías</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.titulo}</td>
                                        <td>{r.juez}</td>
                                        <td>{r.ciudad}</td>
                                        <td>{r.secretarias?.length || 0}</td>
                                        <td>
                                            <Link
                                                className="btn btn-sm btn-outline-secondary"
                                                href={`/adm/juzgados/${r.id}`}
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
                        {rows.map((r) => (
                            <div key={r.id} className={styles.cardItem}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatar}>
                                        {(r.numero ?? "").toString().slice(0, 3) || "#"}
                                    </div>
                                    <div className={styles.titleBlock}>
                                        <div className={styles.title}>{r.titulo || "—"}</div>
                                        <div className={styles.subtle}>{r.juez || "Juez/a no informado"}</div>
                                    </div>
                                </div>

                                <div className={styles.cardBody}>
                                    <div className={styles.rowLine}>
                                        <span className={styles.k}>Ciudad</span>
                                        <span className={styles.v}>{r.ciudad || "—"}</span>
                                    </div>
                                    <div className={styles.rowLine}>
                                        <span className={styles.k}>Secretarías</span>
                                        <span className={styles.v}>{r.secretarias?.length || 0}</span>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <Link
                                        className="btn btn-sm btn-outline-secondary"
                                        href={`/adm/juzgados/${r.id}`}
                                    >
                                        Editar
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}
