// app/adm/page.jsx
export const metadata = {
    title: "Panel de administración",
    description: "Gestión de clientes, dependencias y oficios",
};

export default function AdmPage() {
    return (
        <>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="m-0">Panel de administración</h1>
            </div>

            <div className="row g-3">
                {/* Dependencias (Juzgados y Secretarías) */}
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title">Dependencias</h5>
                            <p className="card-text small text-muted">
                                Juzgados (CABA e interior) y sus Secretarías.
                            </p>
                            <div className="mt-auto d-grid gap-2">
                                <a className="btn btn-primary" href="/adm/juzgados">Ver / Editar juzgados</a>
                                <a className="btn btn-outline-primary" href="/adm/juzgados/nuevo">Agregar juzgado</a>
                                <a className="btn btn-outline-success" href="/adm/dependencias/import">Importar desde texto</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clientes */}
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title">Clientes</h5>
                            <p className="card-text small text-muted">
                                Alta, edición y búsqueda de clientes.
                            </p>
                            <div className="mt-auto d-grid gap-2">
                                <a className="btn btn-primary" href="/adm/clientes">Ver / Editar clientes</a>
                                <a className="btn btn-outline-primary" href="/adm/clientes/nuevo">Agregar cliente</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Oficios */}
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title">Oficios</h5>
                            <p className="card-text small text-muted">
                                Generación de oficios RENAPER, Migraciones, Interpol, RNR y Azopardo (PDF).
                            </p>
                            <div className="mt-auto d-grid">
                                <a className="btn btn-success" href="/oficios/generar">Generar oficios</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
