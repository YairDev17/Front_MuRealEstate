export const BIENES_CATEGORIAS: { label: string; items: string[] }[] = [
  {
    label: 'Electrodomésticos',
    items: ['Refrigerador', 'Estufa', 'Horno empotrado', 'Microondas', 'Lavavajillas', 'Lavadora', 'Secadora', 'Campana extractora', 'Calentador solar'],
  },
  { label: 'Climatización', items: ['Aire acondicionado', 'Calefacción central', 'Minisplit'] },
  { label: 'Muebles', items: ['Cocina integral', 'Clósets empotrados', 'Armarios', 'Muebles de sala', 'Comedor'] },
  { label: 'Instalaciones', items: ['Paneles solares', 'Cisterna', 'Generador eléctrico', 'Sistema de filtrado de agua'] },
  { label: 'Seguridad y tecnología', items: ['Cámaras de seguridad', 'Sistema de alarma', 'Intercomunicador', 'Automatización de puertas'] },
]

export const AMENIDADES = [
  'Jardín privado', 'Alberca', 'Terraza', 'Balcón', 'Cocina equipada',
  'Cocina gourmet', 'Estudio', 'Cuarto de servicio', 'Bodega', 'Seguridad 24/7',
  'Domótica', 'Amueblado', 'Pet friendly', 'Vista panorámica', 'Dobles alturas',
  'Cine privado', 'Spa y sauna', 'Gym en edificio', 'Concierge', 'Roof garden',
]

export const TIPOS_INMUEBLE = ['Terreno', 'Casa', 'Departamento']

export type Operacion = 'compra' | 'venta' | 'renta' | 'administracion' | 'construccion' | 'remodelacion'

export const OPERACIONES: { key: Operacion; label: string }[] = [
  { key: 'compra', label: 'Compra' },
  { key: 'venta', label: 'Venta' },
  { key: 'renta', label: 'Renta' },
  { key: 'administracion', label: 'Administración' },
  { key: 'construccion', label: 'Construcción' },
  { key: 'remodelacion', label: 'Remodelación' },
]
