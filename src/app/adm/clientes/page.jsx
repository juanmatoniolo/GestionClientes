"use client";

import { useEffect, useMemo, useState } from "react";

export default function ClientesList() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");

    useEffect(() => {
        fetch("/api/clientes", { cache: "no-store" })
            .then(r => r.json())
            .then(j => { setData(j || {}); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const rows = useMemo(() => {
        const arr = Object.entries(data).map(([id, c]) => ({ id, ...c }));
        if (!q.trim()) return arr;
        const s = q.toLowerCase();
        return arr.filter(c =>
            [c.apellido, c.nombre, c.dni, c.mail, c.telefono, c.pasaporteNumero, c.pasaporteOrigen]
                .filter(Boolean)
                .some(v => String(v).toLowerCase().includes(s))
        );
    }, [data, q]);

    if (loading) return <main className="container py-4">Cargando…</main>;

    return (
        <main className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="m-0">Clientes</h1>
                <a className="btn btn-primary" href="/adm/clientes/nuevo">Agregar</a>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-6">
                    <input
                        className="form-control"
                        placeholder="Buscar por apellido, nombre, DNI, email…"
                        value={q}
                        onChange={e => setQ(e.target.value)}
                    />
                </div>
            </div>

            {!rows.length ? (
                <div className="alert alert-info">No hay clientes (o la búsqueda no encontró resultados).</div>
            ) : (
                <div className="table-responsive">
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
                            {rows.map(c => (
                                <tr key={c.id}>
                                    <td>{c.apellido}</td>
                                    <td>{c.nombre}</td>
                                    <td>{c.dni}</td>
                                    <td>{c.nacionalidad}</td>
                                    <td>{c.telefono}</td>
                                    <td>{c.mail}</td>
                                    <td>
                                        <a className="btn btn-sm btn-outline-secondary" href={`/adm/clientes/${c.id}`}>Editar</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-3">
                <a className="btn btn-outline-secondary" href="/adm">← Volver al panel</a>
            </div>
        </main>
    );
}
