"use client";
import { useState } from "react";

const initial = {
    numero: "", tipo: "comun", domicilio: "Libertad 731, piso __, CABA",
    juez: "",
    secretaria1: { encargado: "" },
    secretaria2: { encargado: "" },
    ultimoAutoPorSecretaria: { "1": { ciudadYFecha: "", texto: "" }, "2": { ciudadYFecha: "", texto: "" } }
};

export default function JuzgadoForm({ id, initialData, onSaved }) {
    const [data, setData] = useState(initialData || initial);
    const s = (n, field, val) => setData({ ...data, [n]: { ...(data[n] || {}), [field]: val } });
    const ua = (sec, field, val) => setData({
        ...data,
        ultimoAutoPorSecretaria: { ...(data.ultimoAutoPorSecretaria || {}), [sec]: { ...(data.ultimoAutoPorSecretaria?.[sec] || {}), [field]: val } }
    });

    const save = async (e) => {
        e.preventDefault();
        const method = id ? "PATCH" : "POST";
        const url = id ? `/api/juzgados/${id}` : "/api/juzgados";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (res.ok) onSaved?.();
    };

    return (
        <form onSubmit={save} className="card card-body">
            <div className="row">
                <div className="col-md-3 mb-2">
                    <label className="form-label">N° Juzgado</label>
                    <input className="form-control" value={data.numero} onChange={e => setData({ ...data, numero: e.target.value })} />
                </div>
                <div className="col-md-3 mb-2">
                    <label className="form-label">Tipo</label>
                    <select className="form-select" value={data.tipo} onChange={e => setData({ ...data, tipo: e.target.value })}>
                        <option value="comun">Común</option>
                        <option value="especial">Especial</option>
                    </select>
                </div>
                <div className="col-md-6 mb-2">
                    <label className="form-label">Domicilio</label>
                    <input className="form-control" value={data.domicilio} onChange={e => setData({ ...data, domicilio: e.target.value })} />
                </div>
                <div className="col-md-6 mb-2">
                    <label className="form-label">Juez/a</label>
                    <input className="form-control" value={data.juez} onChange={e => setData({ ...data, juez: e.target.value })} />
                </div>

                <div className="col-md-6 mb-2">
                    <label className="form-label">Secretaría 1 – Encargado/a</label>
                    <input className="form-control" value={data.secretaria1?.encargado || ""} onChange={e => s("secretaria1", "encargado", e.target.value)} />
                </div>
                <div className="col-md-6 mb-2">
                    <label className="form-label">Secretaría 2 – Encargado/a</label>
                    <input className="form-control" value={data.secretaria2?.encargado || ""} onChange={e => s("secretaria2", "encargado", e.target.value)} />
                </div>

                <div className="col-12"><hr /></div>
                <div className="col-md-6 mb-2">
                    <label className="form-label">Último auto S1 – Ciudad y fecha</label>
                    <input className="form-control" value={data.ultimoAutoPorSecretaria?.["1"]?.ciudadYFecha || ""} onChange={e => ua("1", "ciudadYFecha", e.target.value)} />
                    <label className="form-label mt-2">Texto</label>
                    <textarea className="form-control" rows={4} value={data.ultimoAutoPorSecretaria?.["1"]?.texto || ""} onChange={e => ua("1", "texto", e.target.value)} />
                </div>

                <div className="col-md-6 mb-2">
                    <label className="form-label">Último auto S2 – Ciudad y fecha</label>
                    <input className="form-control" value={data.ultimoAutoPorSecretaria?.["2"]?.ciudadYFecha || ""} onChange={e => ua("2", "ciudadYFecha", e.target.value)} />
                    <label className="form-label mt-2">Texto</label>
                    <textarea className="form-control" rows={4} value={data.ultimoAutoPorSecretaria?.["2"]?.texto || ""} onChange={e => ua("2", "texto", e.target.value)} />
                </div>
            </div>

            <button className="btn btn-primary mt-2">{id ? "Guardar cambios" : "Crear juzgado"}</button>
        </form>
    );
}
