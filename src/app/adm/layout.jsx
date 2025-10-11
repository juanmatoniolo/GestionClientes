// app/adm/layout.jsx

import NavAdm from "../../components/NavAdm";

export const metadata = {
    title: "Gestor Legal – Clientes",
    description: "Aplicación web para gestión integral de clientes jurídicos",
    icons: {
        icon: [
            { url: "/favicon-32x32.webp", media: "(prefers-color-scheme: light)" },
            { url: "/favicon-32x32-dark.webp", media: "(prefers-color-scheme: dark)" }
        ],
        apple: [
            { url: "/apple-touch-icon.webp", media: "(prefers-color-scheme: light)" },
            { url: "/apple-touch-icon-dark.webp", media: "(prefers-color-scheme: dark)" }
        ]
    },
    manifest: "/site.webmanifest",
    openGraph: {
        title: "Gestor Legal – Clientes",
        description: "Gestor digital para abogados: centralizá expedientes, contactos y documentos.",
        images: ["/og-image.webp"]
    },
    twitter: {
        card: "summary_large_image",
        images: ["/og-image.webp"]
    },
    themeColor: "#0d6efd",
};
export default function AdmLayout({ children }) {
    return (
        <>
            <NavAdm />
            <main className="container py-4">{children}</main>

        </>
    );
}
