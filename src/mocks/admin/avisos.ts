import type { Aviso } from '@/types/admin'

export const avisos: Aviso[] = [
  {
    id: 1, tipo: "urgente", titulo: "Visita confirmada hoy a las 3 pm",
    cuerpo: "El cliente Jorge Salinas confirmó visita a Casa en Tlalpan. Coordinar con Luis.",
    autor: "Ana Villanueva", fecha: "Hoy, 10:00 a.m.", leido: false, destinatario: "Luis Cano",
  },
  {
    id: 2, tipo: "informativo", titulo: "Nueva postulación recibida",
    cuerpo: "Se recibió una postulación de un departamento en Narvarte. Revisar en panel.",
    autor: "Sistema", fecha: "Hoy, 08:30 a.m.", leido: false, destinatario: "Todos",
  },
  {
    id: 3, tipo: "recordatorio", titulo: "Renovar contrato de Renta — 31 oct",
    cuerpo: "El contrato de renta de la propiedad en Satélite vence el 31 de octubre.",
    autor: "Carlos Medina", fecha: "Ayer, 05:15 p.m.", leido: true, destinatario: "Patricia Soto",
  },
  {
    id: 4, tipo: "informativo", titulo: "Actualización de precios de lista",
    cuerpo: "Se actualizaron los precios de 3 propiedades según el estudio de mercado Q4.",
    autor: "Carlos Medina", fecha: "22 oct 2026", leido: true, destinatario: "Todos",
  },
]
