"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavAdm.module.css";

const links = [
    { href: "/adm", label: "Panel" },
    {
        label: "Dependencias",
        activePath: "/adm/juzgados",
        items: [
            { href: "/adm/juzgados", label: "Ver / Editar" },
            { href: "/adm/juzgados/nuevo", label: "Agregar juzgado" },
            { href: "/adm/dependencias/import", label: "Importar desde texto", prefetch: false },
        ],
    },
    {
        label: "Clientes",
        activePath: "/adm/clientes",
        items: [
            { href: "/adm/clientes", label: "Ver / Editar" },
            { href: "/adm/clientes/nuevo", label: "Agregar cliente" },
        ],
    },
    { href: "/adm/oficios/generar", label: "Oficios" },
];

export default function NavAdm() {
    const pathname = usePathname();

    const isActive = (href) =>
        pathname === href || pathname.startsWith(href + "/");

    return (
        <nav className={`navbar navbar-expand-lg navbar-dark bg-dark ${styles.navbar}`}>
            <div className="container">
                <Link href="/adm" className="navbar-brand fw-bold">
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
                        {links.map((link, i) =>
                            link.items ? (
                                <li key={i} className="nav-item dropdown">
                                    <button
                                        className={`nav-link dropdown-toggle ${isActive(link.activePath) ? styles.activeDropdown : ""}`}
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        type="button"
                                    >
                                        {link.label}
                                    </button>
                                    <ul className="dropdown-menu">
                                        {link.items.map((item, j) => (
                                            <li key={j}>
                                                <Link
                                                    href={item.href}
                                                    prefetch={item.prefetch ?? true}
                                                    className={`dropdown-item ${isActive(item.href) ? "active" : ""}`}
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ) : (
                                <li key={i} className="nav-item">
                                    <Link
                                        href={link.href}
                                        className={`nav-link ${isActive(link.href) ? "active" : ""}`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            )
                        )}
                    </ul>

                    <form className="d-flex" method="post" action="/api/logout">
                        <button
                            className={`btn btn-outline-light btn-sm ${styles.logoutBtn}`}
                            type="submit"
                        >
                            Cerrar sesión
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
}
