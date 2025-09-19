app/
  layout.jsx
  login/page.jsx
  page.jsx                 # dashboard
  clientes/
    page.jsx               # listado + filtros
    nuevo/page.jsx
    [id]/page.jsx          # editar
  juzgados/
    page.jsx
    nuevo/page.jsx
    [id]/page.jsx
  oficios/
    generar/page.jsx       # wizard
  api/
    login/route.js
    logout/route.js
    clientes/route.js
    clientes/[id]/route.js
    juzgados/route.js
    juzgados/[id]/route.js
    oficios/pdf/route.js   # genera y devuelve 1 PDF
lib/
  firebaseClient.js
  auth.js
  organisms.js
  templates.js
components/
  Navbar.jsx
  Guard.jsx
  ClienteForm.jsx
  JuzgadoForm.jsx
  OficioWizard.jsx
  DataTable.jsx
middleware.js
