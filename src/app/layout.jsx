// app/layout.jsx
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Ciudadanías – Oficios",
  description: "Generador de oficios legales y gestión de clientes para abogados.",
  metadataBase: new URL("https://gestion-clientes-delta.vercel.app/"), // 🔹 reemplazá por tu dominio real
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

  // 🔹 Configuración Open Graph (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    title: "Ciudadanías – Oficios",
    description: "Generá, gestioná y descargá oficios legales en segundos. Ideal para abogados y estudios jurídicos.",
    url: "https://tusitio.com",
    siteName: "Ciudadanías – Oficios",
    images: [
      {
        url: "/og-image.webp", // imagen de vista previa (mínimo 1200x630)
        width: 1200,
        height: 630,
        alt: "Vista previa del Generador de Oficios",
      }
    ],
    locale: "es_AR",
    type: "website"
  },

  // 🔹 Configuración para Twitter (X)
  twitter: {
    card: "summary_large_image",
    title: "Ciudadanías – Oficios",
    description: "Generador inteligente de oficios legales para abogados.",
    images: ["/og-image.webp"]
  },

  // 🔹 Colores del navegador y app PWA
  themeColor: "#0d6efd"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-light">
        <div>
          <SpeedInsights />
          {children}
        </div>

        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          defer
        />
      </body>
    </html>
  );
}
