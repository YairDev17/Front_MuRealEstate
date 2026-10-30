export const BIENES_CATEGORIAS: { label: string; items: string[] }[] = [
  {
    label: 'Electrodomésticos',
    items: [
      'Refrigerador',
      'Estufa',
      'Horno empotrado',
      'Microondas',
      'Lavavajillas',
      'Lavadora',
      'Secadora',
      'Campana extractora',
      'Calentador solar',
    ],
  },
  { label: 'Climatización', items: ['Aire acondicionado', 'Calefacción central', 'Minisplit'] },
  {
    label: 'Muebles',
    items: ['Cocina integral', 'Clósets empotrados', 'Armarios', 'Muebles de sala', 'Comedor'],
  },
  {
    label: 'Instalaciones',
    items: ['Paneles solares', 'Cisterna', 'Generador eléctrico', 'Sistema de filtrado de agua'],
  },
  {
    label: 'Seguridad y tecnología',
    items: [
      'Cámaras de seguridad',
      'Sistema de alarma',
      'Intercomunicador',
      'Automatización de puertas',
    ],
  },
]

export const AMENIDADES = [
  'Jardín privado',
  'Alberca',
  'Terraza',
  'Balcón',
  'Cocina equipada',
  'Cocina gourmet',
  'Estudio',
  'Cuarto de servicio',
  'Bodega',
  'Seguridad 24/7',
  'Domótica',
  'Amueblado',
  'Pet friendly',
  'Vista panorámica',
  'Dobles alturas',
  'Cine privado',
  'Spa y sauna',
  'Gym en edificio',
  'Concierge',
  'Roof garden',
]

export const TIPOS_INMUEBLE = ['Casa', 'Departamento', 'Terreno', 'Lote', 'Comercial']

export type Operacion =
  'compra' | 'venta' | 'renta' | 'administracion' | 'construccion' | 'remodelacion'

/** Operaciones con las que se puede publicar un inmueble (la API solo maneja venta y renta). */
export const OPERACIONES: { key: Operacion; label: string }[] = [
  { key: 'venta', label: 'Venta' },
  { key: 'renta', label: 'Renta' },
]
