// app/page.jsx
import Link from "next/link";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Gestor de Ciudadanías | Inicio",
  description:
    "App interna para gestionar clientes, dependencias y generar oficios en PDF",
};

export default function HomePage() {
  return (
    <main className="container py-5">
      <section className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="text-center mb-4">
            <h1 className="display-6">Gestor de Ciudadanías</h1>
            <p className="text-muted m-0">
              App interna para cargar <strong>Clientes</strong>, administrar{" "}
              <strong>Dependencias</strong> (Juzgados y Secretarías) y generar{" "}
              <strong>Oficios</strong> (RENAPER, Migraciones, Interpol, RNR y
              Azopardo) en PDF listos para presentar.
            </p>
          </div>

          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="card-title mb-3">¿Qué podés hacer?</h5>
              <ul className="list-unstyled mb-4">
                <li className="mb-2">
                  • Alta, edición y búsqueda de <strong>Clientes</strong> con
                  todos los datos necesarios.
                </li>
                <li className="mb-2">
                  • Carga y edición de <strong>Dependencias</strong>: 11
                  juzgados comunes + 5 especiales, cada uno con Secretaría 1 y
                  2.
                </li>
                <li className="mb-2">
                  • Generación de <strong>Oficios en PDF</strong> por
                  organismo, con opción de Art. 400 y firma.
                </li>
              </ul>

              <div className="alert alert-info small">
                <strong>Nota:</strong> la app usa Next.js 15, Bootstrap y
                Firebase Realtime Database.
              </div>

              <div className="d-grid">
                <Link href="/login" className="btn btn-primary btn-lg">
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-muted mt-3 small">
            Acceso restringido — uso interno del estudio.
          </p>
        </div>
      </section>

      {/* Métricas de rendimiento de Vercel */}
      <SpeedInsights />
    </main>
  );
}
