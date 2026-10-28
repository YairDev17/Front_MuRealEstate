import type { RolAdmin } from '@/types/admin'

export const PERMISOS_CATALOGO = [
  { id: 'ver_propiedades', label: 'Ver propiedades', grupo: 'Propiedades' },
  { id: 'editar_propiedades', label: 'Editar propiedades', grupo: 'Propiedades' },
  { id: 'publicar_propiedades', label: 'Publicar propiedades', grupo: 'Propiedades' },
  { id: 'eliminar_propiedades', label: 'Eliminar propiedades', grupo: 'Propiedades' },
  { id: 'ver_solicitudes', label: 'Ver solicitudes', grupo: 'Solicitudes' },
  { id: 'gestionar_solicitudes', label: 'Gestionar solicitudes', grupo: 'Solicitudes' },
  { id: 'asignar_solicitudes', label: 'Asignar solicitudes', grupo: 'Solicitudes' },
  { id: 'ver_usuarios', label: 'Ver usuarios', grupo: 'Usuarios' },
  { id: 'gestionar_usuarios', label: 'Gestionar usuarios', grupo: 'Usuarios' },
  { id: 'gestionar_roles', label: 'Gestionar roles', grupo: 'Usuarios' },
  { id: 'ver_reportes', label: 'Ver reportes', grupo: 'Reportes' },
  { id: 'exportar_datos', label: 'Exportar datos', grupo: 'Reportes' },
]

export const PERMISOS_POR_ROL: Record<RolAdmin, string[]> = {
  super_admin: PERMISOS_CATALOGO.map((p) => p.id),
  admin: [
    'ver_propiedades',
    'editar_propiedades',
    'publicar_propiedades',
    'ver_solicitudes',
    'gestionar_solicitudes',
    'asignar_solicitudes',
    'ver_usuarios',
    'ver_reportes',
  ],
  agente: ['ver_propiedades', 'editar_propiedades', 'ver_solicitudes', 'gestionar_solicitudes'],
  visor: ['ver_propiedades', 'ver_solicitudes', 'ver_reportes'],
}
