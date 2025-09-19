// app/adm/layout.jsx

import NavAdm from "../../components/NavAdm";


export const metadata = {
    title: "Panel de administración",
    description: "Gestión de clientes, dependencias y oficios",
};

export default function AdmLayout({ children }) {
    return (
        <>
            <NavAdm />
            <main className="container py-4">{children}</main>

        </>
    );
}
