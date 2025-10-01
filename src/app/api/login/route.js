import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.APP_SESSION_SECRET);

export async function POST(req) {
    const { email, password } = await req.json();

    const users = [
        { email: process.env.APP_USER_1_EMAIL, pass: process.env.APP_USER_1_PASS },
        { email: process.env.APP_USER_2_EMAIL, pass: process.env.APP_USER_2_PASS },
    ];

    const user = users.find((u) => u.email === email && u.pass === password);

    if (!user) {
        return NextResponse.json({ success: false, message: "❌ Credenciales inválidas" }, { status: 401 });
    }

    // Generar token JWT
    const token = await new SignJWT({ email })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("2h")
        .sign(secret);

    const res = NextResponse.json({ success: true });

    // Guardar cookie HttpOnly
    res.cookies.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 2, // 2 horas
    });

    return res;
}
