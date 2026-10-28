import type {
  ActaEntrega,
  BusquedaGuardada,
  Expediente,
  Notificacion,
  PlantillaContrato,
  Resena,
} from '@/types/modulos'

export const notificaciones: Notificacion[] = [
  {
    id: 1,
    tipo: 'favorito',
    destinatario: 'usuario',
    titulo: 'Bajó el precio de una favorita',
    mensaje: 'Casa con Jardín en Pedregal ahora cuesta $21,000,000.',
    fecha: '2026-10-27T18:20:00',
    leida: false,
    enlace: '/property/8',
  },
  {
    id: 2,
    tipo: 'cita',
    destinatario: 'usuario',
    titulo: 'Visita confirmada',
    mensaje:
      'Tu visita a Penthouse con Vista al Bosque quedó confirmada para el 30 de octubre a las 11:00.',
    fecha: '2026-10-26T10:05:00',
    leida: false,
    enlace: '/property/2',
    porCorreo: true,
  },
  {
    id: 3,
    tipo: 'publicacion',
    destinatario: 'usuario',
    titulo: 'Tu propiedad está en revisión',
    mensaje:
      'Recibimos «Departamento Luminoso en Narvarte». Te avisaremos cuando el equipo la revise.',
    fecha: '2026-10-14T09:12:00',
    leida: true,
    porCorreo: true,
  },
  {
    id: 4,
    tipo: 'sistema',
    destinatario: 'usuario',
    titulo: '3 propiedades nuevas para tu búsqueda',
    mensaje: '«Departamentos en renta en Condesa» tiene coincidencias nuevas.',
    fecha: '2026-10-12T08:00:00',
    leida: true,
    enlace: '/cuenta/favoritos',
  },
  {
    id: 101,
    tipo: 'publicacion',
    destinatario: 'admin',
    titulo: 'Nueva propiedad enviada',
    mensaje: 'Sofía Ramírez envió «Departamento Luminoso en Narvarte» para revisión.',
    fecha: '2026-10-27T16:40:00',
    leida: false,
    enlace: '/admin/panel',
  },
  {
    id: 102,
    tipo: 'resena',
    destinatario: 'admin',
    titulo: 'Reseña pendiente de moderar',
    mensaje: 'Jorge Salinas calificó con 4 estrellas el servicio.',
    fecha: '2026-10-26T13:15:00',
    leida: false,
    enlace: '/admin/resenas',
  },
  {
    id: 103,
    tipo: 'oferta',
    destinatario: 'admin',
    titulo: 'Nueva oferta recibida',
    mensaje: 'Oferta de $8,500,000 por Penthouse con Vista al Bosque.',
    fecha: '2026-10-25T19:02:00',
    leida: true,
    enlace: '/admin/property/2',
    porCorreo: true,
  },
]

export const busquedasGuardadas: BusquedaGuardada[] = [
  {
    id: 1,
    nombre: 'Departamentos en renta en Condesa',
    filtros: { q: 'Condesa', servicio: 'Renta', tipoInmueble: 'Departamentos' },
    alertas: true,
    creada: '2026-10-02T12:00:00',
    nuevas: 3,
  },
  {
    id: 2,
    nombre: 'Casas en venta en Coyoacán',
    filtros: { q: 'Coyoacán', servicio: 'Compra', tipoInmueble: 'Casas' },
    alertas: false,
    creada: '2026-09-21T12:00:00',
    nuevas: 0,
  },
]

export const resenas: Resena[] = [
  {
    id: 1,
    autor: 'Gabriela Torres',
    perfil: 'Compradora en Polanco',
    calificacion: 5,
    comentario:
      'Llevaba más de un año buscando sin encontrar lo que necesitaba. En MU Real Estate lo encontré en tres semanas. El acompañamiento fue impecable de principio a fin.',
    fecha: '2026-09-18T10:00:00',
    estado: 'aprobada',
  },
  {
    id: 2,
    autor: 'Ricardo Solís',
    perfil: 'Inversionista · Santa Fe',
    calificacion: 5,
    comentario:
      'Tienen acceso a propiedades que no están en ningún otro portal. Gracias a ellos cerré dos inversiones con retornos muy por encima del mercado.',
    fecha: '2026-09-25T10:00:00',
    estado: 'aprobada',
  },
  {
    id: 3,
    autor: 'Mariana Vega',
    perfil: 'Rentista · Condesa',
    calificacion: 5,
    comentario:
      'Buscaba departamento en la Condesa con presupuesto ajustado. Me presentaron opciones reales, sin perder tiempo. El proceso fue rápido y sin sorpresas.',
    fecha: '2026-10-01T10:00:00',
    estado: 'aprobada',
  },
  {
    id: 4,
    propiedadId: 2,
    propiedad: 'Penthouse con Vista al Bosque',
    autor: 'Daniela Ortiz',
    perfil: 'Visitó la propiedad',
    calificacion: 5,
    comentario:
      'La vista es tal cual las fotos. El asesor llegó puntual y resolvió todas mis dudas sobre el mantenimiento.',
    fecha: '2026-10-20T17:30:00',
    estado: 'aprobada',
  },
  {
    id: 5,
    autor: 'Jorge Salinas',
    perfil: 'Comprador · Juárez',
    calificacion: 4,
    comentario:
      'Buen seguimiento y mucha claridad en los documentos. Me hubiera gustado recibir las fotos del inmueble antes de la visita.',
    fecha: '2026-10-26T13:15:00',
    estado: 'pendiente',
  },
  {
    id: 6,
    propiedadId: 4,
    propiedad: 'Departamento de Diseño',
    autor: 'Usuario anónimo',
    perfil: 'Visitante',
    calificacion: 1,
    comentario: 'Llamen al 55 0000 0000 para ofertas mejores!!!',
    fecha: '2026-10-25T09:40:00',
    estado: 'pendiente',
  },
  {
    id: 7,
    propiedadId: 1,
    propiedad: 'Casa Contemporánea en Lomas',
    autor: 'Fernanda Ruiz',
    perfil: 'Visitó la propiedad',
    calificacion: 2,
    comentario: 'No me gustó.',
    fecha: '2026-10-10T12:00:00',
    estado: 'rechazada',
    motivoRechazo: 'Sin información útil para otros usuarios.',
  },
]

export const expedientes: Expediente[] = [
  {
    id: 1,
    propiedad: 'Departamento Luminoso en Narvarte',
    colonia: 'Narvarte',
    propietario: 'Sofía Ramírez',
    correoPropietario: 'sofia@correo.com',
    documentos: [
      {
        id: 1,
        tipo: 'identificacion',
        archivo: 'INE_Sofia_Ramirez.pdf',
        tamano: 412_000,
        fechaCarga: '2026-10-14T09:20:00',
        estado: 'validado',
      },
      {
        id: 2,
        tipo: 'escrituras',
        archivo: 'Escritura_Narvarte_4512.pdf',
        tamano: 2_850_000,
        fechaCarga: '2026-10-14T09:22:00',
        estado: 'pendiente',
      },
      {
        id: 3,
        tipo: 'predial',
        archivo: 'Predial_2026.pdf',
        tamano: 180_000,
        fechaCarga: '2026-10-14T09:23:00',
        estado: 'pendiente',
      },
    ],
  },
  {
    id: 2,
    propiedad: 'Casa con Jardín en Tlalpan',
    colonia: 'Tlalpan',
    propietario: 'Miguel Ángel Torres',
    correoPropietario: 'miguel@correo.com',
    documentos: [
      {
        id: 4,
        tipo: 'identificacion',
        archivo: 'Pasaporte_MTorres.jpg',
        tamano: 950_000,
        fechaCarga: '2026-10-13T18:02:00',
        estado: 'rechazado',
        observaciones: 'La imagen está cortada; falta la fecha de vigencia.',
      },
      {
        id: 5,
        tipo: 'escrituras',
        archivo: 'Escrituras_Tlalpan.pdf',
        tamano: 3_400_000,
        fechaCarga: '2026-10-13T18:05:00',
        estado: 'validado',
      },
    ],
  },
  {
    id: 3,
    propiedad: 'Penthouse en Satélite',
    colonia: 'Ciudad Satélite',
    propietario: 'Patricia Núñez',
    correoPropietario: 'pati@correo.com',
    documentos: [
      {
        id: 6,
        tipo: 'identificacion',
        archivo: 'INE_PNunez.pdf',
        tamano: 380_000,
        fechaCarga: '2026-10-12T11:00:00',
        estado: 'validado',
      },
      {
        id: 7,
        tipo: 'escrituras',
        archivo: 'Escritura_Satelite.pdf',
        tamano: 2_100_000,
        fechaCarga: '2026-10-12T11:02:00',
        estado: 'validado',
      },
      {
        id: 8,
        tipo: 'predial',
        archivo: 'Predial_Satelite_2026.pdf',
        tamano: 160_000,
        fechaCarga: '2026-10-12T11:03:00',
        estado: 'validado',
      },
    ],
  },
]

export const plantillasContrato: PlantillaContrato[] = [
  {
    id: 1,
    nombre: 'Contrato de promesa de compraventa',
    tipo: 'compraventa',
    descripcion: 'Promesa de compraventa entre propietario y comprador con depósito en garantía.',
    actualizada: '2026-10-05T10:00:00',
    cuerpo: `CONTRATO DE PROMESA DE COMPRAVENTA

En la ciudad de {{ciudad}}, a {{fecha}}, comparecen por una parte {{propietario}}, en lo sucesivo «EL PROMITENTE VENDEDOR», y por la otra {{cliente}}, en lo sucesivo «EL PROMITENTE COMPRADOR», con la intermediación de MU Real Estate, unidad inmobiliaria de Cano & Asociados, al tenor de las siguientes:

CLÁUSULAS

PRIMERA. OBJETO. EL PROMITENTE VENDEDOR se obliga a vender y EL PROMITENTE COMPRADOR a comprar el inmueble denominado «{{propiedad}}», ubicado en {{direccion}}.

SEGUNDA. PRECIO. Las partes convienen como precio de la operación la cantidad de {{precio}} M.N.

TERCERA. DEPÓSITO. A la firma del presente, EL PROMITENTE COMPRADOR entrega un depósito en garantía equivalente al 10 % del precio, que se aplicará al pago total.

CUARTA. ESCRITURACIÓN. La escritura definitiva se otorgará ante el notario que designen las partes dentro de los noventa días naturales siguientes.

Leído que fue el presente, las partes lo firman de conformidad.`,
  },
  {
    id: 2,
    nombre: 'Contrato de arrendamiento habitacional',
    tipo: 'arrendamiento',
    descripcion: 'Arrendamiento por doce meses con depósito y renta mensual.',
    actualizada: '2026-10-02T10:00:00',
    cuerpo: `CONTRATO DE ARRENDAMIENTO

En la ciudad de {{ciudad}}, a {{fecha}}, {{propietario}} («EL ARRENDADOR») y {{cliente}} («EL ARRENDATARIO») celebran el presente contrato con la intermediación de MU Real Estate.

PRIMERA. OBJETO. EL ARRENDADOR otorga en arrendamiento el inmueble «{{propiedad}}», ubicado en {{direccion}}, para uso exclusivamente habitacional.

SEGUNDA. RENTA. La renta mensual será de {{precio}} M.N., pagadera dentro de los primeros cinco días de cada mes.

TERCERA. VIGENCIA. El presente contrato tendrá una vigencia de doce meses a partir de la fecha de firma.

CUARTA. DEPÓSITO. EL ARRENDATARIO entrega un mes de renta como depósito en garantía, reembolsable al término del contrato previa revisión del acta de recepción del inmueble.

Leído que fue el presente, las partes lo firman de conformidad.`,
  },
  {
    id: 3,
    nombre: 'Carta de intención de compra',
    tipo: 'intencion',
    descripcion: 'Manifestación no vinculante del interés de compra y de la oferta del cliente.',
    actualizada: '2026-09-28T10:00:00',
    cuerpo: `CARTA DE INTENCIÓN

{{ciudad}}, a {{fecha}}.

{{propietario}}
P R E S E N T E

Por medio de la presente, {{cliente}} manifiesta su interés en adquirir el inmueble «{{propiedad}}», ubicado en {{direccion}}, por la cantidad de {{precio}} M.N.

Esta carta no constituye una obligación de compra y tiene por objeto iniciar la negociación con la intermediación de MU Real Estate. La oferta tendrá una vigencia de quince días naturales.

Atentamente,

{{cliente}}`,
  },
]

export const ELEMENTOS_CHECKLIST: { categoria: string; elementos: string[] }[] = [
  {
    categoria: 'Interiores',
    elementos: [
      'Paredes y pintura',
      'Pisos',
      'Puertas y chapas',
      'Ventanas y cancelería',
      'Iluminación',
    ],
  },
  {
    categoria: 'Servicios',
    elementos: ['Instalación eléctrica', 'Agua y presión', 'Gas', 'Drenaje'],
  },
  {
    categoria: 'Cocina y baños',
    elementos: ['Cocina integral', 'Muebles de baño', 'Regaderas y llaves'],
  },
  {
    categoria: 'Electrodomésticos',
    elementos: ['Refrigerador', 'Estufa', 'Lavadora', 'Aire acondicionado'],
  },
]

export const actasEntrega: ActaEntrega[] = [
  {
    id: 1,
    tipo: 'entrega',
    propiedad: 'Departamento de Diseño',
    fecha: '2026-10-01',
    asesor: 'Ana Fuentes',
    cliente: 'Mariana Vega',
    llaves: 3,
    lecturas: { luz: '048213', agua: '1290', gas: '35 %' },
    elementos: ELEMENTOS_CHECKLIST.flatMap((c) =>
      c.elementos.map((e) => ({
        categoria: c.categoria,
        elemento: e,
        estado: e === 'Pisos' ? 'regular' : e === 'Lavadora' ? 'na' : 'bueno',
        nota: e === 'Pisos' ? 'Rayón leve junto a la ventana de la sala.' : '',
      })),
    ),
    observaciones: 'Se entrega amueblado conforme al inventario anexo.',
  },
]
