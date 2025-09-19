// app/adm/juzgados/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Loading from "../../loading";

export default function EditarJuzgadoPage() {
    const { id } = useParams(); // /adm/juzgados/[id]
    const router = useRouter();

    // state machine simple
    const [data, setData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return; // todavía no hay id
        const ctrl = new AbortController();

        async function load() {
            setLoading(true);
            setErr("");
            try {
                const res = await fetch(`/api/juzgados/${id}`, {
                    method: "GET",
                    cache: "no-store",
                    signal: ctrl.signal,
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) {
                    // No intentes parsear JSON sí o sí en error (algunas rutas devuelven HTML)
                    let msg = `Error ${res.status}`;
                    try {
                        const t = await res.text();
                        // si el server devolvió JSON, intentamos leerlo sin romper
                        try {
                            const j = JSON.parse(t);
                            if (j?.error) msg = j.error;
                        } catch {
                            // texto plano; dejamos msg por defecto
                        }
                    } catch { }
                    throw new Error(msg);
                }

                const j = await res.json();
                // Validamos mínimamente
                if (!j || typeof j !== "object") throw new Error("Datos vacíos.");

                setData({
                    titulo: j.titulo || "",
                    numero: j.numero ?? "",
                    fuero: j.fuero || "",
                    ciudad: j.ciudad || "",
                    juez: j.juez || "",
                    domicilio: j.domicilio || "",
                    secretarias: Array.isArray(j.secretarias) ? j.secretarias : [],
                });
            } catch (e) {
                // Ignorar el ciclo abortado del Strict Mode
                if (e.name === "AbortError") return;
                setErr(e.message || "Error cargando el juzgado.");
                // Importante: no pises `data` aquí. Mantenelo en null para que
                // el render de error sea limpio y no “parpadee”.
                setData(null);
            } finally {
                setLoading(false);
            }
        }

        load();
        return () => ctrl.abort();
    }, [id]);

    const upd = (patch) => setData((prev) => ({ ...prev, ...patch }));

    const updSec = (i, patch) => {
        setData((prev) => {
            const arr = [...(prev.secretarias || [])];
            arr[i] = { ...(arr[i] || {}), ...patch };
            return { ...prev, secretarias: arr };
        });
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
        setData((d) => {
            const arr = [...(d.secretarias || [])];
            arr.splice(i, 1);
            return { ...d, secretarias: arr };
        });
    };

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

    // ---------- Render ----------
    if (loading) {
        return (
            <main className="container py-4" aria-busy="true">
                <Loading />
            </main>
        );
    }

    if (err && !data) {
        return (
            <main className="container py-4">
                <div className="alert alert-danger mb-3">{err}</div>
                <Link className="btn btn-outline-secondary" href="/adm/juzgados">
                    Volver
                </Link>
            </main>
        );
    }

    if (!data) {
        // fallback ultra defensivo
        return (
            <main className="container py-4">
                <div className=" mb-3">
                    cargando...
                </div>
                <Link className="btn btn-outline-secondary" href="/adm/juzgados">
                    Volver
                </Link>
            </main>
        );
    }

    return (
        <main className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="m-0">Editar juzgado</h1>
                <div className="d-flex gap-2">
                    <Link className="btn btn-outline-secondary" href="/adm/juzgados">
                        Volver
                    </Link>
                </div>
            </div>

            {err && <div className="alert alert-danger">{err}</div>}

            <form onSubmit={save} className="card card-body">
                <div className="row g-2">
                    <div className="col-md-6">
                        <label className="form-label">Título</label>
                        <input
                            className="form-control"
                            value={data.titulo || ""}
                            onChange={(e) => upd({ titulo: e.target.value })}
                            placeholder="Juzgado Civil y Comercial Federal Nro. X"
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Número</label>
                        <input
                            className="form-control"
                            value={data.numero || ""}
                            onChange={(e) => upd({ numero: e.target.value })}
                            placeholder="Ej.: 6"
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Fuero</label>
                        <input
                            className="form-control"
                            value={data.fuero || ""}
                            onChange={(e) => upd({ fuero: e.target.value })}
                            placeholder="Civil y Comercial Federal"
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Ciudad</label>
                        <input
                            className="form-control"
                            value={data.ciudad || ""}
                            onChange={(e) => upd({ ciudad: e.target.value })}
                            placeholder="Ciudad Autónoma de Buenos Aires"
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Juez/a</label>
                        <input
                            className="form-control"
                            value={data.juez || ""}
                            onChange={(e) => upd({ juez: e.target.value })}
                            placeholder="Dr./Dra. Nombre Apellido"
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Domicilio</label>
                        <input
                            className="form-control"
                            value={data.domicilio || ""}
                            onChange={(e) => upd({ domicilio: e.target.value })}
                            placeholder='Libertad 731, Piso 5° (C1012AAO)'
                        />
                    </div>
                </div>

                <hr />
                <h5>Secretarías</h5>
                {(data.secretarias || []).map((s, i) => (
                    <div key={i} className="border rounded p-2 mb-2">
                        <div className="row g-2">
                            <div className="col-md-5">
                                <label className="form-label">Rótulo</label>
                                <input
                                    className="form-control"
                                    value={s.rotulo || ""}
                                    onChange={(e) => updSec(i, { rotulo: e.target.value })}
                                    placeholder="Secretaría Nro. 1"
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Número</label>
                                <input
                                    className="form-control"
                                    value={s.numero ?? ""}
                                    onChange={(e) => updSec(i, { numero: e.target.value })}
                                    placeholder="1"
                                />
                            </div>
                            <div className="col-md-5">
                                <label className="form-label">Teléfonos (separar por /)</label>
                                <input
                                    className="form-control"
                                    value={(s.telefonos || []).join(" / ")}
                                    onChange={(e) =>
                                        updSec(i, {
                                            telefonos: e.target.value
                                                .split("/")
                                                .map((x) => x.trim())
                                                .filter(Boolean),
                                        })
                                    }
                                    placeholder="4124-5212 / 4124-5213"
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Emails (separar por /)</label>
                                <input
                                    className="form-control"
                                    value={(s.emails || []).join(" / ")}
                                    onChange={(e) =>
                                        updSec(i, {
                                            emails: e.target.value
                                                .split("/")
                                                .map((x) => x.trim())
                                                .filter(Boolean),
                                        })
                                    }
                                    placeholder="jncivcomfedX.secY@pjn.gov.ar / ...ciudadania@pjn.gov.ar"
                                />
                            </div>
                        </div>
                        <div className="mt-2 text-end">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => delSec(i)}
                            >
                                Quitar secretaría
                            </button>
                        </div>
                    </div>
                ))}

                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={addSec}
                    >
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
