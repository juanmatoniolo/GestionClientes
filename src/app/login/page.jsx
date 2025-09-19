// app/login/page.jsx
import Link from "next/link";

export const metadata = {
    title: "Iniciar sesión",
    description: "Acceso al sistema",
};

export default function LoginPage() {
    return (
        <main className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-5">
                    <div className="text-center mb-4">
                        <h1 className="h3">Iniciar sesión</h1>
                        <p className="text-muted m-0">Acceso restringido — uso interno.</p>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-body">
                            {/* Importante: method="post" + action="/api/login" evita que email/pass vayan en la URL */}
                            <form method="post" action="/api/login" autoComplete="off" noValidate>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input className="form-control" type="email" name="email" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <input className="form-control" type="password" name="password" required />
                                </div>
                                <button className="btn btn-primary w-100" type="submit">Entrar</button>
                            </form>
                        </div>
                    </div>

                    <div className="text-center mt-3">
                        <Link href="/" className="small">← Volver al inicio</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
