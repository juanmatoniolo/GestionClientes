"use client";

import { useState } from "react";

export default function LoginPage() {
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            window.location.href = "/adm";
        } else {
            const data = await res.json();
            setError(data.message || "Error al iniciar sesión");
        }
    };

    return (
        <main className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="h4 mb-3">Iniciar sesión</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input type="text" name="email" className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <input type="password" name="password" className="form-control" required />
                                </div>
                                <button className="btn btn-primary w-100" type="submit">
                                    Entrar
                                </button>
                                {error && <div className="alert alert-danger mt-3">{error}</div>}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
