// app/page.jsx
import { cookies } from "next/headers";

export const metadata = {
  title: "Ciudadanías – Panel",
  description: "Login + Dashboard",
};

export default function Home() {
  const isAuthed = !!cookies().get("app_session")?.value;

  if (!isAuthed) {
    // ===========================
    // VISTA LOGIN (POST SEGURO)
    // ===========================
    return (
      <main className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            <h1 className="mb-3 text-center">Ingresar</h1>
            <div className="card shadow-sm">
              <div className="card-body">
                <form
                  id="loginForm"
                  method="post"
                  action="/api/login"
                  className="needs-validation"
                  noValidate
                  autoComplete="off"
                >
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input className="form-control" type="email" name="email" required />
                    <div className="invalid-feedback">Ingresá un email válido.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input className="form-control" type="password" name="password" required />
                    <div className="invalid-feedback">Ingresá la contraseña.</div>
                  </div>
                  <div id="loginError" className="alert alert-danger py-2 d-none"></div>
                  <button className="btn btn-primary w-100" type="submit">Entrar</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Script: intenta fetch POST; si falla, envía POST nativo (sin exponer credenciales en URL) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  const form = document.getElementById('loginForm');
  const err = document.getElementById('loginError');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.classList.add('d-none');
    if (!form.checkValidity()) { e.stopPropagation(); form.classList.add('was-validated'); return; }
    const fd = new FormData(form);
    try {
      const res = await fetch('/api/login', { method: 'POST', body: fd });
      if (res.ok) window.location.href = '/';
      else {
        const j = await res.json().catch(()=>({}));
        err.textContent = j.error || 'Credenciales inválidas';
        err.classList.remove('d-none');
      }
    } catch {
      form.submit(); // fallback: POST clásico (no pone datos en la URL)
    }
  });
})();`,
          }}
        />
      </main>
    );
  }

  // ===========================
  // VISTA DASHBOARD (logueado)
  // ===========================
  return (
    <main className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="m-0">Dashboard</h1>

        {/* Cerrar sesión */}
        <form id="logoutForm" method="post" action="/api/logout">
          <button type="submit" className="btn btn-outline-danger">Cerrar sesión</button>
        </form>
      </div>

      {/* 1) ALTAS / EDICIONES */}
      <section className="mb-4">
        <h4 className="mb-3">1) Altas y Ediciones</h4>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Clientes</h5>
                <p className="card-text small text-muted">Cargá un nuevo cliente o gestioná los existentes.</p>
                <div className="mt-auto d-grid gap-2">
                  <a href="/clientes/nuevo" className="btn btn-primary">Agregar cliente</a>
                  <a href="/clientes" className="btn btn-outline-secondary">Ver / Editar clientes</a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Dependencias</h5>
                <p className="card-text small text-muted">Juzgados (11 comunes + 5 especiales) y Secretarías.</p>
                <div className="mt-auto d-grid gap-2">
                  <a href="/juzgados/nuevo" className="btn btn-primary">Agregar dependencia</a>
                  <a href="/juzgados" className="btn btn-outline-secondary">Ver / Editar dependencias</a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Oficios</h5>
                <p className="card-text small text-muted">RENAPER, Migraciones, Interpol, RNR, Azopardo.</p>
                <div className="mt-auto d-grid">
                  <a href="/oficios/generar" className="btn btn-success">Generar oficios</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) BUSCAR / LISTAR CLIENTES */}
      <section className="mb-4">
        <h4 className="mb-3">2) Buscar o listar clientes</h4>
        <div className="card shadow-sm">
          <div className="card-body">
            <form id="searchForm" className="row g-2 align-items-center">
              <div className="col-12 col-md-8">
                <input id="q" className="form-control" placeholder="Buscar por apellido, nombre, DNI o pasaporte..." />
              </div>
              <div className="col-12 col-md-4 d-grid d-md-flex gap-2">
                <button className="btn btn-outline-primary" type="submit">Buscar</button>
                <a className="btn btn-outline-secondary" href="/clientes">Ver todos</a>
              </div>
            </form>
            <div id="searchResults" className="mt-3"></div>
          </div>
        </div>

        {/* Script: busca /api/clientes y filtra en cliente */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  const f = document.getElementById('searchForm');
  const q = document.getElementById('q');
  const out = document.getElementById('searchResults');

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    out.innerHTML = '<div class="text-muted">Buscando...</div>';
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      const term = (q.value || '').toLowerCase().trim();
      const rows = Object.entries(data||{})
        .map(([id,c])=>({ id, ...c }))
        .filter(c => {
          const hay = [c.apellido, c.nombre, c.dni, c.pasaporteNumero, c.pasaporteOrigen]
            .filter(Boolean).join(' ').toLowerCase();
          return !term || hay.includes(term);
        });

      if (!rows.length) { out.innerHTML = '<div class="text-muted">Sin resultados.</div>'; return; }

      const html = [
        '<div class="table-responsive"><table class="table table-sm table-striped">',
        '<thead><tr><th>Apellido</th><th>Nombre</th><th>DNI</th><th>Pasaporte</th><th></th></tr></thead><tbody>',
        ...rows.map(r => (
          '<tr>' +
            '<td>'+ (r.apellido||'') +'</td>' +
            '<td>'+ (r.nombre||'') +'</td>' +
            '<td>'+ (r.dni||'-') +'</td>' +
            '<td>'+ (r.pasaporteNumero||'-') +'</td>' +
            '<td><a class="btn btn-sm btn-outline-secondary" href="/clientes/'+ r.id +'">Editar</a> ' +
                '<a class="btn btn-sm btn-success" href="/oficios/generar?clienteId='+ r.id +'">Usar en oficio</a></td>' +
          '</tr>'
        )),
        '</tbody></table></div>'
      ].join('');
      out.innerHTML = html;
    } catch (ex) {
      out.innerHTML = '<div class="text-danger">Error buscando clientes.</div>';
    }
  });
})();`,
          }}
        />
      </section>

      {/* 3) SELECCIONAR ESCRITOS Y ASIGNAR CLIENTE */}
      <section className="mb-4">
        <h4 className="mb-3">3) Seleccionar escritos y asignar cliente</h4>
        <div className="card shadow-sm">
          <div className="card-body">
            <p className="text-muted mb-3">
              Elegí un cliente en el buscador de arriba o ingresá directamente al asistente para seleccionar RENAPER / Migraciones / Interpol / RNR / Azopardo y asignarle el cliente.
            </p>
            <a href="/oficios/generar" className="btn btn-success">Ir al asistente de oficios</a>
          </div>
        </div>
      </section>
    </main>
  );
}
