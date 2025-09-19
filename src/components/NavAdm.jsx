// components/NavAdm.jsx
"use client";

import { usePathname } from "next/navigation";

export default function NavAdm() {
    const pathname = usePathname();
    const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <a className={`navbar-brand ${isActive("/adm") ? "active" : ""}`} href="/adm">Admin</a>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#admNav" aria-controls="admNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="admNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className={`nav-link ${pathname === "/adm" ? "active" : ""}`} href="/adm">Panel</a>
                        </li>

                        {/* Dependencias */}
                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${isActive("/adm/juzgados") ? "active" : ""}`} href="#" id="depDrop" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Dependencias
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="depDrop">
                                <li><a className={`dropdown-item ${isActive("/adm/juzgados") ? "active" : ""}`} href="/adm/juzgados">Ver / Editar</a></li>
                                <li><a className={`dropdown-item ${pathname === "/adm/juzgados/nuevo" ? "active" : ""}`} href="/adm/juzgados/nuevo">Agregar juzgado</a></li>
                                <li><a className={`dropdown-item ${pathname === "/adm/dependencias/import" ? "active" : ""}`} href="/adm/dependencias/import">Importar desde texto</a></li>
                            </ul>
                        </li>

                        {/* Clientes */}
                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${isActive("/adm/clientes") ? "active" : ""}`} href="#" id="cliDrop" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Clientes
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="cliDrop">
                                <li><a className={`dropdown-item ${isActive("/adm/clientes") ? "active" : ""}`} href="/adm/clientes">Ver / Editar</a></li>
                                <li><a className={`dropdown-item ${pathname === "/adm/clientes/nuevo" ? "active" : ""}`} href="/adm/clientes/nuevo">Agregar cliente</a></li>
                            </ul>
                        </li>

                        {/* Oficios */}
                        <li className="nav-item">
                            <a className={`nav-link ${isActive("/oficios/generar") ? "active" : ""}`} href="/oficios/generar">Oficios</a>
                        </li>
                    </ul>

                    <form className="d-flex" method="post" action="/api/logout">
                        <button className="btn btn-outline-light btn-sm" type="submit">Cerrar sesión</button>
                    </form>
                </div>
            </div>
        </nav>
    );
}
