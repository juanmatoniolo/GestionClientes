"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.modules.css"; // 👈 corregido (antes .modules)
import Loading from "../loading";

const ESTADO_BASE = ["Soltero", "Casado", "Divorciado", "Viudo"];
const genderize = (base, sexo) => {
	if (sexo === "Femenino") return base.replace(/o$/i, "a");
	if (sexo === "Masculino") return base;
	return base.replace(/o$/i, "e"); // No binario / Otro
};
const toBase = (val) => val.replace(/(a|e)$/i, "o");

const normalize = (c = {}) => ({
	expediente: c.expediente || "",
	dependencia: c.dependencia || "",
	apellido: c.apellido || "",
	nombre: c.nombre || "",
	sexo: c.sexo || "",
	estadoCivil: c.estadoCivil || "",
	fechaNacimiento: c.fechaNacimiento || "",
	domicilioReal: c.domicilioReal || "",
	dni: c.dni || "",
	pasaporteNumero: c.pasaporteNumero || "",
	pasaporteOrigen: c.pasaporteOrigen || "",
	lugarNacimiento: c.lugarNacimiento || "",
	telefono: c.telefono || "",
	mail: c.mail || "",
	ocupacion: c.ocupacion || "",
	padre: c.padre || "",
	madre: c.madre || "",
	fechaLlegada: c.fechaLlegada || "",
	medioTransporte: c.medioTransporte || "",
	nacionalidad: c.nacionalidad || "",
});

export default function EditarCliente() {
	const { id } = useParams();
	const router = useRouter();

	const [data, setData] = useState(null);
	const [saving, setSaving] = useState(false);
	const [err, setErr] = useState("");
	const [loading, setLoading] = useState(true);

	const upd = (patch) => setData((prev) => ({ ...prev, ...patch }));

	const estadoCivilOptions = useMemo(
		() => ESTADO_BASE.map((b) => genderize(b, data?.sexo || "")),
		[data?.sexo]
	);

	useEffect(() => {
		if (!data?.estadoCivil) return;
		const base = toBase(data.estadoCivil);
		const adjusted = genderize(base, data.sexo || "");
		if (adjusted !== data.estadoCivil) {
			setData((prev) => ({ ...prev, estadoCivil: adjusted }));
		}
	}, [data?.sexo]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!id) return;
		const ctrl = new AbortController();

		(async () => {
			setLoading(true);
			setErr("");
			try {
				const res = await fetch(`/api/clientes/${id}`, {
					cache: "no-store",
					signal: ctrl.signal,
					headers: { Accept: "application/json" },
				});
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const j = await res.json();
				if (!j) throw new Error("No se encontró el cliente.");
				setData(normalize(j));
			} catch (e) {
				if (e.name !== "AbortError") setErr(e.message || "Error cargando.");
			} finally {
				setLoading(false);
			}
		})();

		return () => ctrl.abort();
	}, [id]);

	const save = async (e) => {
		e.preventDefault();
		setSaving(true);
		setErr("");
		try {
			const res = await fetch(`/api/clientes/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error("No se pudo guardar.");
			router.push("/adm/clientes");
		} catch (e) {
			setErr(e.message || "Error guardando.");
		} finally {
			setSaving(false);
		}
	};

	const remove = async () => {
		if (!confirm("¿Eliminar este cliente?")) return;
		try {
			const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error("No se pudo eliminar.");
			router.push("/adm/clientes");
		} catch (e) {
			setErr(e.message || "Error eliminando.");
		}
	};

	if (loading)
		return (
			<main className="container py-4" aria-busy="true">
				<Loading />
			</main>
		);

	if (!data)
		return (
			<main className="container py-4">
				
					<Loading />
				
				<Link className="btn btn-outline-secondary" href="/adm/clientes">
					Volver
				</Link>
			</main>
		);

	return (
		<main className={`container py-4 ${styles.page}`}>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h1 className="m-0">Editar cliente</h1>
				<div className="d-flex gap-2">
					<button className="btn btn-danger" onClick={remove}>
						Eliminar
					</button>
					<Link className="btn btn-outline-secondary" href="/adm/clientes" prefetch>
						Volver
					</Link>
				</div>
			</div>

			{err && <div className="alert alert-danger">{err}</div>}

			<form onSubmit={save} className={`card card-body ${styles.formCard}`}>
				<div className="row g-2">
					{/* Expediente / Dependencia */}
					<div className="col-md-4">
						<label className="form-label">Expediente</label>
						<input
							className="form-control"
							placeholder="Ej.: CCF 013110/2024"
							value={data.expediente}
							onChange={(e) => upd({ expediente: e.target.value })}
						/>
					</div>
					<div className="col-md-8">
						<label className="form-label">Dependencia (Juzgado y Secretaría)</label>
						<input
							className="form-control"
							placeholder="Ej.: JUZGADO CIVIL Y COMERCIAL FEDERAL 6 - SECRETARÍA Nº 11"
							value={data.dependencia}
							onChange={(e) => upd({ dependencia: e.target.value })}
						/>
					</div>

					<span className="pb-4" />
					<hr className={styles.hr} />

					<div className="col-md-4">
						<label className="form-label">Apellido</label>
						<input
							className="form-control"
							value={data.apellido}
							onChange={(e) => upd({ apellido: e.target.value })}
						/>
					</div>
					<div className="col-md-4">
						<label className="form-label">Nombre</label>
						<input
							className="form-control"
							value={data.nombre}
							onChange={(e) => upd({ nombre: e.target.value })}
						/>
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
						<label className="form-label">Sexo</label>
						<select
							className="form-select"
							value={data.sexo}
							onChange={(e) => upd({ sexo: e.target.value })}
						>
							<option value="">Seleccionar…</option>
							<option value="Masculino">Masculino</option>
							<option value="Femenino">Femenino</option>
							<option value="No binario">No binario</option>
							<option value="Otro">Otro</option>
						</select>
					</div>

					<div className="col-md-4">
						<label className="form-label">Estado civil</label>
						<select
							className="form-select"
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
					</div>

					<div className="col-md-3">
						<label className="form-label">Fecha de nacimiento</label>
						<input
							type="date"
							className="form-control"
							value={data.fechaNacimiento}
							onChange={(e) => upd({ fechaNacimiento: e.target.value })}
						/>
					</div>

					<div className="col-md-8">
						<label className="form-label">Domicilio real</label>
						<input
							className="form-control"
							value={data.domicilioReal}
							onChange={(e) => upd({ domicilioReal: e.target.value })}
						/>
					</div>

					<div className="col-md-4">
						<label className="form-label">Pasaporte (número)</label>
						<input
							className="form-control"
							value={data.pasaporteNumero}
							onChange={(e) => upd({ pasaporteNumero: e.target.value })}
						/>
					</div>
					<div className="col-md-4">
						<label className="form-label">Pasaporte (origen)</label>
						<input
							className="form-control"
							value={data.pasaporteOrigen}
							onChange={(e) => upd({ pasaporteOrigen: e.target.value })}
						/>
					</div>

					<div className="col-md-6">
						<label className="form-label">Lugar de nacimiento</label>
						<input
							className="form-control"
							value={data.lugarNacimiento}
							onChange={(e) => upd({ lugarNacimiento: e.target.value })}
						/>
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
						<label className="form-label">Padre (nombre y apellido)</label>
						<input
							className="form-control"
							value={data.padre}
							onChange={(e) => upd({ padre: e.target.value })}
						/>
					</div>
					<div className="col-md-6">
						<label className="form-label">Madre (nombre y apellido)</label>
						<input
							className="form-control"
							value={data.madre}
							onChange={(e) => upd({ madre: e.target.value })}
						/>
					</div>

					<div className="col-md-4">
						<label className="form-label">Fecha de llegada al país</label>
						<input
							type="date"
							className="form-control"
							value={data.fechaLlegada}
							onChange={(e) => upd({ fechaLlegada: e.target.value })}
						/>
					</div>

					<div className="col-md-4">
						<label className="form-label">Medio de transporte</label>
						<input
							className="form-control"
							value={data.medioTransporte}
							onChange={(e) => upd({ medioTransporte: e.target.value })}
						/>
					</div>

					<div className="col-md-4">
						<label className="form-label">Nacionalidad</label>
						<input
							className="form-control"
							value={data.nacionalidad}
							onChange={(e) => upd({ nacionalidad: e.target.value })}
						/>
					</div>
				</div>

				<div className={`d-flex mt-3 ${styles.stickyActions}`}>
					<button className="btn btn-primary ms-auto" disabled={saving} type="submit" aria-disabled={saving}>
						{saving ? "Guardando..." : "Guardar"}
					</button>
				</div>
			</form>
		</main>
	);
}
