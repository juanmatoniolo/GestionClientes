// components/NavAdm.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavAdm() {
    const pathname = usePathname() || "/";

    const isActive = (href) =>
        pathname === href || pathname.startsWith(href + "/");

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link
                    href="/adm"
                    className={`navbar-brand ${isActive("/adm") ? "active" : ""}`}
                >
                    Admin
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#admNav"
                    aria-controls="admNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div className="collapse navbar-collapse" id="admNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {/* Panel */}
                        <li className="nav-item">
                            <Link
                                href="/adm"
                                className={`nav-link ${pathname === "/adm" ? "active" : ""}`}
                            >
                                Panel
                            </Link>
                        </li>

                        {/* Dependencias */}
                        <li className="nav-item dropdown">
                            <button
                                className={`nav-link dropdown-toggle btn btn-link p-0 ${isActive("/adm/juzgados") ? "active" : ""
                                    }`}
                                id="depDrop"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                type="button"
                            >
                                Dependencias
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="depDrop">
                                <li>
                                    <Link
                                        href="/adm/juzgados"
                                        className={`dropdown-item ${isActive("/adm/juzgados") ? "active" : ""
                                            }`}
                                    >
                                        Ver / Editar
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/adm/juzgados/nuevo"
                                        className={`dropdown-item ${pathname === "/adm/juzgados/nuevo" ? "active" : ""
                                            }`}
                                    >
                                        Agregar juzgado
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/adm/dependencias/import"
                                        prefetch={false}
                                        className={`dropdown-item ${pathname === "/adm/dependencias/import" ? "active" : ""
                                            }`}
                                    >
                                        Importar desde texto
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* Clientes */}
                        <li className="nav-item dropdown">
                            <button
                                className={`nav-link dropdown-toggle btn btn-link p-0 ${isActive("/adm/clientes") ? "active" : ""
                                    }`}
                                id="cliDrop"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                type="button"
                            >
                                Clientes
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="cliDrop">
                                <li>
                                    <Link
                                        href="/adm/clientes"
                                        className={`dropdown-item ${isActive("/adm/clientes") ? "active" : ""
                                            }`}
                                    >
                                        Ver / Editar
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/adm/clientes/nuevo"
                                        className={`dropdown-item ${pathname === "/adm/clientes/nuevo" ? "active" : ""
                                            }`}
                                    >
                                        Agregar cliente
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* Oficios */}
                        <li className="nav-item">
                            <Link
                                href="adm/oficios/generar"
                                className={`nav-link ${isActive("adm/oficios/generar") ? "active" : ""
                                    }`}
                            >
                                Oficios
                            </Link>
                        </li>
                    </ul>

                    <form className="d-flex" method="post" action="/api/logout">
                        <button className="btn btn-outline-light btn-sm" type="submit">
                            Cerrar sesión
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
}
