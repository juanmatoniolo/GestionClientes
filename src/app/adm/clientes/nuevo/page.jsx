"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

// ---------- helpers de estado civil ----------
const ESTADO_BASE = ["Soltero", "Casado", "Divorciado", "Viudo"];
const genderize = (base, sexo) => {
    if (sexo === "Femenino") return base.replace(/o$/i, "a");
    if (sexo === "Masculino") return base; // queda en "o"
    // No binario / Otro → inclusivo en "e"
    return base.replace(/o$/i, "e");
};
const toBase = (val) => val.replace(/(a|e)$/i, "o"); // "Soltera/Soltere" → "Soltero"

// ------------------------------------------------

const empty = {
    expediente: "",                    // obligatorio
    dependencia: "",                   // obligatorio
    apellido: "", nombre: "", sexo: "", fechaNacimiento: "",
    domicilioReal: "", dni: "", pasaporteNumero: "", pasaporteOrigen: "",
    lugarNacimiento: "", telefono: "", mail: "",
    padre: "", madre: "",
    fechaLlegada: "", medioTransporte: "",
    nacionalidad: "",
    estadoCivil: "",                   // obligatorio
    ocupacion: ""                      // opcional
};

// Campos obligatorios (incluye estadoCivil)
const REQUIRED_KEYS = [
    "expediente",
    "dependencia",
    "apellido",
    "nombre",
    "sexo",
    "fechaNacimiento",
    "domicilioReal",
    "pasaporteNumero",
    "pasaporteOrigen",
    "lugarNacimiento",
    "padre",
    "madre",
    "fechaLlegada",
    "estadoCivil"
];

export default function NuevoCliente() {
    const router = useRouter();

    const [data, setData] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");
    const [touchedSubmit, setTouchedSubmit] = useState(false);

    const upd = (patch) => setData((prev) => ({ ...prev, ...patch }));

    // Opciones de estado civil derivadas del sexo
    const estadoCivilOptions = useMemo(
        () => ESTADO_BASE.map((b) => genderize(b, data.sexo || "")),
        [data.sexo]
    );

    // Si cambian el sexo, adaptamos el estado civil elegido
    useEffect(() => {
        if (!data.estadoCivil) return;
        const base = toBase(data.estadoCivil);
        const adjusted = genderize(base, data.sexo || "");
        if (adjusted !== data.estadoCivil) {
            setData((prev) => ({ ...prev, estadoCivil: adjusted }));
        }
    }, [data.sexo]); // eslint-disable-line react-hooks/exhaustive-deps

    const missing = useMemo(() => {
        const m = {};
        for (const k of REQUIRED_KEYS) {
            const v = (data[k] ?? "").toString().trim();
            if (!v) m[k] = true;
        }
        return m;
    }, [data]);

    const hasMissing = useMemo(() => Object.keys(missing).length > 0, [missing]);

    const save = async (e) => {
        e.preventDefault();
        setTouchedSubmit(true);
        setErr("");

        if (hasMissing) {
            setErr("Completá todos los campos obligatorios marcados en rojo.");
            return;
        }

        try {
            setSaving(true);
            const res = await fetch("/api/clientes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("No se pudo guardar.");
            router.push("/adm/clientes"); // navegación client-side
        } catch (e) {
            setErr(e.message || "Error guardando.");
        } finally {
            setSaving(false);
        }
    };

    // Helper para Bootstrap invalid
    const inv = (key) => (touchedSubmit && missing[key] ? "is-invalid" : "");

    return (
        <main className={`container py-4 ${styles.page}`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="m-0">Nuevo cliente</h1>
                <Link prefetch className="btn btn-outline-secondary" href="/adm/clientes">
                    Volver
                </Link>
            </div>

            {err && <div className="alert alert-danger">{err}</div>}

            <form onSubmit={save} className={`card card-body ${styles.formCard}`}>
                <div className="row g-2">
                    {/* Expediente / Dependencia primero (obligatorios) */}
                    <div className="col-md-4">
                        <label className="form-label">Expediente *</label>
                        <input
                            className={`form-control ${inv("expediente")}`}
                            placeholder="Ej.: CCF 013110/2024"
                            value={data.expediente}
                            onChange={(e) => upd({ expediente: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-8">
                        <label className="form-label">Dependencia (Juzgado y Secretaría) *</label>
                        <input
                            className={`form-control ${inv("dependencia")}`}
                            placeholder="Ej.: JUZGADO CIVIL Y COMERCIAL FEDERAL 6 - SECRETARÍA Nº 11"
                            value={data.dependencia}
                            onChange={(e) => upd({ dependencia: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <span className="pb-4"></span>
                    <hr className={styles.hr} />

                    <div className="col-md-4">
                        <label className="form-label">Apellido *</label>
                        <input
                            className={`form-control ${inv("apellido")}`}
                            value={data.apellido}
                            onChange={(e) => upd({ apellido: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Nombre *</label>
                        <input
                            className={`form-control ${inv("nombre")}`}
                            value={data.nombre}
                            onChange={(e) => upd({ nombre: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">DNI</label>
                        <input
                            className="form-control"
                            value={data.dni}
                            onChange={(e) => upd({ dni: e.target.value })}
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Sexo *</label>
                        <select
                            className={`form-select ${inv("sexo")}`}
                            value={data.sexo}
                            onChange={(e) => upd({ sexo: e.target.value })}
                        >
                            <option value="">Seleccionar…</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="No binario">No binario</option>
                            <option value="Otro">Otro</option>
                        </select>
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Estado civil *</label>
                        <select
                            className={`form-select ${inv("estadoCivil")}`}
                            value={data.estadoCivil}
                            onChange={(e) => upd({ estadoCivil: e.target.value })}
                        >
                            <option value="">Seleccionar…</option>
                            {estadoCivilOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Fecha de nacimiento *</label>
                        <input
                            type="date"
                            className={`form-control ${inv("fechaNacimiento")}`}
                            value={data.fechaNacimiento}
                            onChange={(e) => upd({ fechaNacimiento: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-8">
                        <label className="form-label">Domicilio real *</label>
                        <input
                            className={`form-control ${inv("domicilioReal")}`}
                            value={data.domicilioReal}
                            onChange={(e) => upd({ domicilioReal: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Pasaporte (número) *</label>
                        <input
                            className={`form-control ${inv("pasaporteNumero")}`}
                            value={data.pasaporteNumero}
                            onChange={(e) => upd({ pasaporteNumero: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Pasaporte (origen) *</label>
                        <input
                            className={`form-control ${inv("pasaporteOrigen")}`}
                            value={data.pasaporteOrigen}
                            onChange={(e) => upd({ pasaporteOrigen: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Lugar de nacimiento *</label>
                        <input
                            className={`form-control ${inv("lugarNacimiento")}`}
                            value={data.lugarNacimiento}
                            onChange={(e) => upd({ lugarNacimiento: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Teléfono</label>
                        <input
                            className="form-control"
                            value={data.telefono}
                            onChange={(e) => upd({ telefono: e.target.value })}
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Mail</label>
                        <input
                            type="email"
                            className="form-control"
                            value={data.mail}
                            onChange={(e) => upd({ mail: e.target.value })}
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Ocupación</label>
                        <input
                            className="form-control"
                            placeholder="Ej.: Informático"
                            value={data.ocupacion}
                            onChange={(e) => upd({ ocupacion: e.target.value })}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Padre (nombre y apellido) *</label>
                        <input
                            className={`form-control ${inv("padre")}`}
                            value={data.padre}
                            onChange={(e) => upd({ padre: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Madre (nombre y apellido) *</label>
                        <input
                            className={`form-control ${inv("madre")}`}
                            value={data.madre}
                            onChange={(e) => upd({ madre: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Fecha de llegada al país *</label>
                        <input
                            type="date"
                            className={`form-control ${inv("fechaLlegada")}`}
                            value={data.fechaLlegada}
                            onChange={(e) => upd({ fechaLlegada: e.target.value })}
                        />
                        <div className="invalid-feedback">Obligatorio.</div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Medio de transporte</label>
                        <input
                            className="form-control"
                            value={data.medioTransporte}
                            onChange={(e) => upd({ medioTransporte: e.target.value })}
                        />
                    </div>
                </div>

                {/* Acciones sticky en mobile */}
                <div className={`d-flex mt-3 ${styles.stickyActions}`}>
                    <button className="btn btn-primary ms-auto" disabled={saving} type="submit" aria-disabled={saving}>
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </form>
        </main>
    );
}
