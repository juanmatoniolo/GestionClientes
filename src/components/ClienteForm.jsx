"use client";
import { useState, useEffect } from "react";

const initial = {
    apellido: "", nombre: "", sexo: "", fechaNacimiento: "", domicilioReal: "",
    dni: "", pasaporteNumero: "", pasaporteOrigen: "", lugarNacimiento: "",
    telefono: "", mail: "", padre: "", madre: "", fechaLlegada: "", medioTransporte: "",
    nacionalidad: ""
};

export default function ClienteForm({ id, initialData, onSaved }) {
    const [data, setData] = useState(initialData || initial);

    const save = async (e) => {
        e.preventDefault();
        const method = id ? "PATCH" : "POST";
        const url = id ? `/api/clientes/${id}` : "/api/clientes";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (res.ok) onSaved?.();
    };

    const C = ({ name, label, type = "text" }) => (
        <div className="col-md-6 mb-2">
            <label className="form-label">{label}</label>
            <input className="form-control" type={type} value={data[name] || ""} onChange={e => setData({ ...data, [name]: e.target.value })} />
        </div>
    );

    return (
        <form onSubmit={save} className="card card-body">
            <div className="row">
                <C name="apellido" label="Apellido" />
                <C name="nombre" label="Nombre" />
                <C name="sexo" label="Sexo" />
                <C name="fechaNacimiento" label="Fecha de nacimiento (dd-mm-aaaa)" />
                <C name="domicilioReal" label="Domicilio real" />
                <C name="dni" label="DNI" />
                <C name="pasaporteNumero" label="N° Pasaporte" />
                <C name="pasaporteOrigen" label="Origen Pasaporte" />
                <C name="lugarNacimiento" label="Lugar de nacimiento" />
                <C name="telefono" label="Teléfono" />
                <C name="mail" label="Email" />
                <C name="padre" label="Padre" />
                <C name="madre" label="Madre" />
                <C name="fechaLlegada" label="Fecha de llegada (dd-mm-aaaa)" />
                <C name="medioTransporte" label="Medio de transporte" />
                <C name="nacionalidad" label="Nacionalidad" />
            </div>
            <button className="btn btn-primary mt-2">{id ? "Guardar cambios" : "Crear cliente"}</button>
        </form>
    );
}
