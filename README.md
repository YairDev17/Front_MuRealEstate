# MU Real Estate — Front (Vue 3)

Maquetación en **Vue 3 + TypeScript + Vite + Tailwind CSS 4 + Pinia + Vue Router**, a partir del proyecto de Figma Make
(`figma-export/`, solo como referencia; está en `.gitignore`).

## Arrancar

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + build de producción
npm run lint
```

## Pantallas / rutas

| Ruta | Vista | Acceso |
|---|---|---|
| `/` | Home (catálogo, carrusel, contacto) | público |
| `/property/:id` | Detalle de propiedad | público |
| `/publicar` | Publicar propiedad (2 pasos + documentos legales opcionales) | público |
| `/cuenta/favoritos` | Favoritos y búsquedas guardadas con alertas | sesión |
| `/notificaciones` | Centro de notificaciones del usuario | sesión |
| `/login`, `/registro`, `/verificacion` | Autenticación de usuarios | público |
| `/admin` | Login de administradores | público |
| `/admin/panel` | Kanban de portafolio + postulaciones | admin |
| `/admin/property/:id` | Detalle admin + cambio de estado | admin |
| `/admin/new-property` | Alta de propiedad | admin |
| `/admin/users` | Usuarios, roles y permisos | admin |
| `/admin/requests` | Solicitudes y avisos internos | admin |
| `/admin/agenda` | Agenda de visitas | admin |
| `/admin/activity` | Bitácora de auditoría (registra moderación, documentos, reseñas, contratos y entregas) | admin |
| `/admin/analitica` | Dashboard de analítica y exportación CSV | admin |
| `/admin/expedientes` | Bóveda digital de expedientes legales | admin |
| `/admin/resenas` | Moderación de reseñas y calificaciones | admin |
| `/admin/contratos` | Plantillas de contratos y borradores imprimibles | admin |
| `/admin/entregas` | Actas de entrega/recepción (check-in / check-out) con firmas | admin |

Las rutas `/admin/*` están protegidas por un guard (`src/router/index.ts`) que exige `rol === 'admin'`; las de cuenta
(`meta.requiresAuth`) exigen cualquier sesión.

## Conectar con el back

1. Copia `.env.example` a `.env.local` y define la URL del API:
   ```
   VITE_API_URL=https://api.tu-dominio.com
   ```
   Si `VITE_API_URL` está **vacía**, la app funciona con datos mock (`src/mocks`) y cualquier credencial entra.
2. Revisa los servicios en `src/services/` — cada uno tiene un `TODO(back)` con las rutas asumidas:
   - `auth.service.ts` — `POST /auth/login`, `/auth/admin/login`, `/auth/registro`, `/auth/verificar-correo`, `/auth/reenviar-codigo`
   - `propiedades.service.ts` — `GET /propiedades`, `GET /propiedades/:id`
   - `publicaciones.service.ts` — `POST /publicaciones` (multipart: campo `datos` JSON + `imagenes[]`)
   - `contacto.service.ts` — `POST /contacto`
   - `admin.service.ts` — CRUD REST en `/admin/propiedades`, `/admin/postulaciones` (`/:id/aprobar`, `/:id/rechazar` con
     `{ observaciones }`), `/admin/usuarios`, `/admin/solicitudes`, `/admin/avisos`, `/admin/visitas`, `/admin/actividad`
   - `modulos.service.ts` — `/notificaciones` (`/:id/leida`, `/leidas`), `/cuenta/busquedas`, `/resenas` y
     `/admin/resenas/:id/(aprobar|rechazar)`, `/admin/expedientes/:id/documentos` (multipart) y `/:docId/(validar|rechazar)`,
     `/admin/contratos/plantillas`, `/admin/entregas`, `/admin/analitica?periodo=30|90|365`
   - En modo mock la bitácora se alimenta sola (`registrarActividad`); con backend real, el servidor debe registrar esos eventos.
3. El login espera `{ token, usuario }` (ver `src/types/auth.ts`). El token se guarda en `localStorage` y se envía como
   `Authorization: Bearer <token>` en cada petición (`src/services/http.ts`).
4. Los contratos de datos están en `src/types/` (`propiedad.ts`, `admin.ts`, `auth.ts`).

## Estructura

```
src/
  assets/images/     logos de MU
  components/        layout, ui, home, propiedades, publicar, admin
  constants/         catálogos (amenidades, bienes, permisos)
  mocks/             datos de ejemplo (los mismos del diseño)
  services/          capa de API (http + servicios por dominio)
  stores/            Pinia: auth, favoritos
  styles/            Tailwind + tema (colores/fuentes del diseño)
  types/             interfaces compartidas con el back
  views/             auth/, user/, admin/
  config.ts          WhatsApp y estilos compartidos
```

Pendientes de datos reales: número de WhatsApp (`src/config.ts`), lista de agentes/asesores
(`components/admin/solicitudesConfig.ts`, `components/admin/agenda/agenda.ts`).
