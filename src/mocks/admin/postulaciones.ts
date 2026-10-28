import type { Postulacion } from '@/types/admin'

export const postulaciones: Postulacion[] = [
  {
    id: 101, titulo: "Departamento Luminoso en Narvarte", tipo: "renta", tipoInmueble: "Departamento",
    colonia: "Narvarte", ciudad: "CDMX", precio: "22,000", habitaciones: 2, banos: 1, m2: 95,
    imagen: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop&auto=format",
    contacto: "Sofía Ramírez", telefono: "+52 55 9988 7766", correo: "sofia@correo.com",
    fechaEnvio: "14 oct 2026", estado: "pendiente",
  },
  {
    id: 102, titulo: "Casa con Jardín en Tlalpan", tipo: "venta", tipoInmueble: "Casa",
    colonia: "Tlalpan", ciudad: "CDMX", precio: "4,800,000", habitaciones: 3, banos: 2, m2: 240,
    imagen: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop&auto=format",
    contacto: "Miguel Ángel Torres", telefono: "+52 55 1122 3344", correo: "miguel@correo.com",
    fechaEnvio: "13 oct 2026", estado: "pendiente",
  },
  {
    id: 103, titulo: "Penthouse en Satélite", tipo: "venta", tipoInmueble: "Penthouse",
    colonia: "Ciudad Satélite", ciudad: "Edo. Méx.", precio: "6,200,000", habitaciones: 3, banos: 3, m2: 210,
    imagen: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop&auto=format",
    contacto: "Patricia Núñez", telefono: "+52 55 5544 3322", correo: "pati@correo.com",
    fechaEnvio: "12 oct 2026", estado: "aprobada",
  },
  {
    id: 104, titulo: "Terreno en Xochimilco", tipo: "venta", tipoInmueble: "Terreno",
    colonia: "Xochimilco", ciudad: "CDMX", precio: "1,950,000", habitaciones: 0, banos: 0, m2: 450,
    imagen: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop&auto=format",
    contacto: "Roberto Leal", telefono: "+52 55 7788 9900", correo: "roberto@correo.com",
    fechaEnvio: "10 oct 2026", estado: "rechazada",
  },
]
