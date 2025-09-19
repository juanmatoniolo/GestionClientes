// app/juzgados/nuevo/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NuevoJuzgado() {
    const router = useRouter();

    const [data, setData] = useState({
        titulo: "",
        numero: "",
        fuero: "",
        ciudad: "",
        juez: "",
        domicilio: "",
        secretarias: [
            { rotulo: "Secretaría Nro. 1", numero: 1, telefonos: [], emails: [] },
        ],
    });

    const addSec = () =>
        setData({
            ...data,
            secretarias: [
                ...(data.secretarias || []),
                { rotulo: "", numero: null, telefonos: [], emails: [] },
            ],
        });

    const updSec = (i, patch) => {
        const arr = [...data.secretarias];
        arr[i] = { ...arr[i], ...patch };
        setData({ ...data, secretarias: arr });
    };

    const save = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/juzgados", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) router.push("/adm/juzgados");
    };

    return (
        <main className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="m-0">Nuevo juzgado</h1>
                <Link className="btn btn-outline-secondary" href="/adm/juzgados">
                    Volver
                </Link>
            </div>

            <form onSubmit={save} className="card card-body">
                <div className="row g-2">
                    <div className="col-md-6">
                        <label className="form-label">Título</label>
                        <input
                            className="form-control"
                            value={data.titulo}
                            onChange={(e) => setData({ ...data, titulo: e.target.value })}
                            placeholder="Juzgado Civil y Comercial Federal Nro. X"
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Número</label>
                        <input
                            className="form-control"
                            value={data.numero}
                            onChange={(e) => setData({ ...data, numero: e.target.value })}
                            placeholder="Ej.: 6"
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Fuero</label>
                        <input
                            className="form-control"
                            value={data.fuero}
                            onChange={(e) => setData({ ...data, fuero: e.target.value })}
                            placeholder="Civil y Comercial Federal"
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Ciudad</label>
                        <input
                            className="form-control"
                            value={data.ciudad}
                            onChange={(e) => setData({ ...data, ciudad: e.target.value })}
                            placeholder="Ciudad Autónoma de Buenos Aires"
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Juez/a</label>
                        <input
                            className="form-control"
                            value={data.juez}
                            onChange={(e) => setData({ ...data, juez: e.target.value })}
                            placeholder="Dr./Dra. Nombre Apellido"
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Domicilio (único)</label>
                        <input
                            className="form-control"
                            value={data.domicilio}
                            onChange={(e) => setData({ ...data, domicilio: e.target.value })}
                            placeholder='Libertad 731, Piso 5° (C1012AAO)'
                        />
                    </div>
                </div>

                <hr />
                <h5>Secretarías</h5>
                {(data.secretarias || []).map((s, i) => (
                    <div key={i} className="border rounded p-2 mb-2">
                        <div className="row g-2">
                            <div className="col-md-6">
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
                                    value={s.numero || ""}
                                    onChange={(e) => updSec(i, { numero: e.target.value })}
                                    placeholder="1"
                                />
                            </div>
                            <div className="col-md-4">
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
                    <button className="btn btn-primary ms-auto" type="submit">
                        Guardar
                    </button>
                </div>
            </form>
        </main>
    );
}
