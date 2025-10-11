// app/adm/layout.jsx

import NavAdm from "../../components/NavAdm";


export default function AdmLayout({ children }) {
    return (
        <>
            <NavAdm />
            <main className="container py-4">{children}</main>

        </>
    );
}
