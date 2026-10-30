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
| `/publicar` | Publicar propiedad (2 pasos; documentos legales solo en modo mock por ahora) | sesión |
| `/cuenta/favoritos` | Favoritos y búsquedas guardadas con alertas | sesión |
| `/notificaciones` | Centro de notificaciones del usuario | sesión |
| `/login`, `/registro`, `/verificacion`, `/recuperar` | Autenticación, verificación de correo y recuperar contraseña | público |
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

El back es [mu-realestate-api](https://github.com/4nh31/mu-realestate-api) (FastAPI).

1. Levanta la API (ver su README) y, para tener datos de prueba en local, corre
   `python -m app.scripts.datos_demo` dentro de la API: crea personal y propiedades de demostración
   (las credenciales están en el docstring de ese script).
2. Copia `.env.example` a `.env.local` con la URL de la API **incluido el prefijo**:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```
   Si `VITE_API_URL` está **vacía**, toda la app funciona con datos mock (`src/mocks`) y cualquier credencial entra.
   La API solo acepta peticiones desde los orígenes de su `CORS_ORIGINS` (por defecto `http://localhost:5173`).
3. Los servicios de `src/services/` traducen las respuestas de la API a los tipos de `src/types/` que usan las vistas
   (los tipos de la API están en `src/services/api/`). Estado de cada módulo:

   | Módulo | Endpoints de la API |
   |---|---|
   | Login, registro, verificación, recuperar contraseña | `/auth/login` (formulario OAuth2) + `/auth/me`, `/auth/registro`, `/auth/verificar-correo`, `/auth/reenviar-codigo`, `/auth/restablecer-password` |
   | Catálogo público y ficha | `/publico/propiedades`, `/publico/catalogos/*` |
   | Contacto | `/publico/solicitudes` |
   | Publicar propiedad (dueño) | `POST /cuenta/propiedades` (multipart: `datos` JSON + `imagenes`) |
   | Favoritos | `/cuenta/favoritos` (se sincronizan al iniciar sesión) |
   | Notificaciones y avisos | `/avisos` |
   | Panel: portafolio, alta, fotos, estados | `/propiedades`, `/propiedades/{id}/publicacion`, `/propiedades/{id}/medios` |
   | Panel: postulaciones | `/propiedades?origen=particular` + `/publicacion` (rechazo con motivo) |
   | Panel: usuarios | `/usuarios` (roles administrador y asesor) |
   | Panel: solicitudes | `/solicitudes` (asignación, atención, descarte, notas) y `/usuarios/personal` |
   | Panel: historial | `/auditoria` |
   | Agenda, reseñas, expedientes, contratos, entregas, analítica, búsquedas guardadas | **todavía en mock** (`CON_API` en `modulos.service.ts`) |

4. El token se guarda en `localStorage` y se envía como `Authorization: Bearer <token>`. Un 401 cierra la sesión.
   Los errores de la API que ninguna vista maneja aparecen en un aviso flotante (`ErrorToast`).

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
