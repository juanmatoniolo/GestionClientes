"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditarJuzgadoPage() {
    const { id } = useParams(); // ruta: /adm/juzgados/[id]
    const router = useRouter();

    const [data, setData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    // Cargar datos del juzgado
    useEffect(() => {
        if (!id) return; // aún no hay id (primera render)
        const ctrl = new AbortController();

        (async () => {
            setLoading(true);
            setErr("");
            try {
                const res = await fetch(`/api/juzgados/${id}`, {
                    method: "GET",
                    cache: "no-store",        // evita cache
                    signal: ctrl.signal,
                    headers: { "Accept": "application/json" },
                });

                if (!res.ok) {
                    // 404/500: mostramos mensaje y salimos
                    const j = await res.json().catch(() => ({}));
                    throw new Error(j?.error || `Error ${res.status}`);
                }

                const j = await res.json();
                if (!j) {
                    setErr("No se encontró el juzgado.");
                    setData({ secretarias: [] });
                } else {
                    // normalizamos estructura
                    setData({
                        titulo: j.titulo || "",
                        numero: j.numero ?? "",
                        fuero: j.fuero || "",
                        ciudad: j.ciudad || "",
                        juez: j.juez || "",
                        domicilio: j.domicilio || "",
                        secretarias: Array.isArray(j.secretarias) ? j.secretarias : [],
                    });
                }
            } catch (e) {
                if (e.name !== "AbortError") {
                    setErr(e.message || "Error cargando el juzgado.");
                    setData({ secretarias: [] });
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => ctrl.abort();
    }, [id]);

    // Helpers de edición
    const upd = (patch) => setData((prev) => ({ ...prev, ...patch }));

    const updSec = (i, patch) => {
        const arr = [...(data.secretarias || [])];
        arr[i] = { ...(arr[i] || {}), ...patch };
        setData({ ...data, secretarias: arr });
    };

    const addSec = () => {
        setData((d) => ({
            ...d,
            secretarias: [
                ...(d.secretarias || []),
                { rotulo: "", numero: null, telefonos: [], emails: [] },
            ],
        }));
    };

    const delSec = (i) => {
        const arr = [...(data.secretarias || [])];
        arr.splice(i, 1);
        setData({ ...data, secretarias: arr });
    };

    // Guardar cambios
    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErr("");
        try {
            const res = await fetch(`/api/juzgados/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("No se pudo guardar.");
            router.push("/adm/juzgados");
        } catch (e) {
            setErr(e.message || "No se pudo guardar.");
        } finally {
            setSaving(false);
        }
    };

    // Eliminar
/*     const remove = async () => {
        if (!confirm("¿Eliminar este juzgado?")) return;
        try {
            const res = await fetch(`/api/juzgados/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("No se pudo eliminar.");
            router.push("/adm/juzgados");
        } catch (e) {
            setErr(e.message || "No se pudo eliminar.");
        }
    };
 */
    // UI
    if (loading) {
        return (
            <main className="container py-4">
                <div className="alert alert-secondary">Cargando…</div>
            </main>
        );
    }

    if (!data) {
        return (
            <main className="container py-4">
                <div className="alert alert-danger mb-3">{err || "No se pudo cargar el juzgado."}</div>
                <a className="btn btn-outline-secondary" href="/adm/juzgados">Volver</a>
            </main>
        );
    }

    return (
        <main className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="m-0">Editar juzgado</h1>
                <div className="d-flex gap-2">
                {/*     <button className="btn btn-danger" onClick={remove}>Eliminar</button> */}
                    <a className="btn btn-outline-secondary" href="/adm/juzgados">Volver</a>
                </div>
            </div>

            {err && <div className="alert alert-danger">{err}</div>}

            <form onSubmit={save} className="card card-body">
                <div className="row g-2">
                    <div className="col-md-6">
                        <label className="form-label">Título</label>
                        <input className="form-control" value={data.titulo || ""} onChange={(e) => upd({ titulo: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Número</label>
                        <input className="form-control" value={data.numero || ""} onChange={(e) => upd({ numero: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Fuero</label>
                        <input className="form-control" value={data.fuero || ""} onChange={(e) => upd({ fuero: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Ciudad</label>
                        <input className="form-control" value={data.ciudad || ""} onChange={(e) => upd({ ciudad: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Juez/a</label>
                        <input className="form-control" value={data.juez || ""} onChange={(e) => upd({ juez: e.target.value })} />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Domicilio</label>
                        <input className="form-control" value={data.domicilio || ""} onChange={(e) => upd({ domicilio: e.target.value })} />
                    </div>
                </div>

                <hr />
                <h5>Secretarías</h5>
                {(data.secretarias || []).map((s, i) => (
                    <div key={i} className="border rounded p-2 mb-2">
                        <div className="row g-2">
                            <div className="col-md-5">
                                <label className="form-label">Rótulo</label>
                                <input className="form-control" value={s.rotulo || ""} onChange={(e) => updSec(i, { rotulo: e.target.value })} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Número</label>
                                <input className="form-control" value={s.numero ?? ""} onChange={(e) => updSec(i, { numero: e.target.value })} />
                            </div>
                            <div className="col-md-5">
                                <label className="form-label">Teléfonos (separar por /)</label>
                                <input
                                    className="form-control"
                                    value={(s.telefonos || []).join(" / ")}
                                    onChange={(e) =>
                                        updSec(i, {
                                            telefonos: e.target.value.split("/").map((x) => x.trim()).filter(Boolean),
                                        })
                                    }
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Emails (separar por /)</label>
                                <input
                                    className="form-control"
                                    value={(s.emails || []).join(" / ")}
                                    onChange={(e) =>
                                        updSec(i, {
                                            emails: e.target.value.split("/").map((x) => x.trim()).filter(Boolean),
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-2 text-end">
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => delSec(i)}>
                                Quitar secretaría
                            </button>
                        </div>
                    </div>
                ))}

                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-secondary" onClick={addSec}>
                        Agregar secretaría
                    </button>
                    <button className="btn btn-primary ms-auto" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </form>
        </main>
    );
}
