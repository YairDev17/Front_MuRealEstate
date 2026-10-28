import type { Solicitud } from '@/types/admin'

export const solicitudes: Solicitud[] = [
  {
    id: 1, tipo: "visita", nombre: "Fernanda Reyes", telefono: "+52 55 4433 2211",
    correo: "freyes@gmail.com", propiedad: "Penthouse en Polanco",
    ubicacion: "Polanco, CDMX", mensaje: "Me interesa agendar una visita este fin de semana.",
    fecha: "24 oct 2026", hora: "11:20 a.m.", estado: "nueva", asignadoA: null, notas: "",
  },
  {
    id: 2, tipo: "contacto", nombre: "Jorge Salinas", telefono: "+52 55 8877 6655",
    correo: "jsalinas@outlook.com", propiedad: "Casa con Jardín en Tlalpan",
    ubicacion: "Tlalpan, CDMX", mensaje: "¿Cuáles son las formas de pago disponibles?",
    fecha: "23 oct 2026", hora: "04:45 p.m.", estado: "asignada", asignadoA: "Ana Villanueva", notas: "Llamada pendiente para el 25 oct.",
  },
  {
    id: 3, tipo: "visita", nombre: "Claudia Moreno", telefono: "+52 55 2233 4455",
    correo: "cmoreno@mail.com", propiedad: "Departamento en Narvarte",
    ubicacion: "Narvarte, CDMX", mensaje: "Disponible miércoles por la tarde.",
    fecha: "22 oct 2026", hora: "09:10 a.m.", estado: "atendida", asignadoA: "Luis Cano", notas: "Visita realizada. Cliente muy interesado.",
  },
  {
    id: 4, tipo: "contacto", nombre: "Alejandro Ruiz", telefono: "+52 55 5566 7788",
    correo: "aruiz@empresa.com", propiedad: "Terreno en Xochimilco",
    ubicacion: "Xochimilco, CDMX", mensaje: "¿Hay financiamiento disponible?",
    fecha: "21 oct 2026", hora: "02:30 p.m.", estado: "cancelada", asignadoA: null, notas: "No respondió llamadas.",
  },
  {
    id: 5, tipo: "visita", nombre: "Valeria Espinoza", telefono: "+52 55 9900 1122",
    correo: "vespinoza@hotmail.com", propiedad: "Casa Colonial en Coyoacán",
    ubicacion: "Coyoacán, CDMX", mensaje: "Vendremos en pareja, preferimos el sábado.",
    fecha: "24 oct 2026", hora: "08:55 a.m.", estado: "nueva", asignadoA: null, notas: "",
  },
]
