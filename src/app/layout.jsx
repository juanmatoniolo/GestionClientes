
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { SpeedInsights } from "@vercel/speed-insights/next"
export const metadata = { title: "Ciudadanías – Oficios", description: "Generador de oficios" };

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-light" cz-shortcut-listen="true">
        <div>
          <SpeedInsights />
          {children}
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer />
      </body>
    </html>
  );
}
