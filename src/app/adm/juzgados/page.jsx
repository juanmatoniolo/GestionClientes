"use client";

import { useEffect, useState } from "react";

export default function JuzgadosList() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/juzgados")
            .then((r) => r.json())
            .then((j) => {
                setData(j || {});
                setLoading(false);
            });
    }, []);

    if (loading) return <main className="container py-4">Cargando...</main>;

    const rows = Object.entries(data).map(([id, j]) => ({ id, ...j }));

    return (
        <main className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="m-0">Juzgados</h1>
                <a className="btn btn-primary" href="/adm/juzgados/nuevo">Agregar</a>
            </div>

            {!rows.length ? (
                <div className="alert alert-info">No hay registros.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-sm table-striped">
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
                                        <a className="btn btn-sm btn-outline-secondary" href={`/adm/juzgados/${r.id}`}>Editar</a>
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
