import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.APP_SESSION_SECRET);

export async function middleware(req) {
  const token = req.cookies.get("session")?.value;

  // Si no hay cookie, redirigir al login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verifica el token
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    // Si el token es inválido o expiró → login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Proteger solo las rutas /admin y todo lo que esté adentro
export const config = {
  matcher: ["/adm/:path*"],
};
