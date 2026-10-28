/** «hace 5 min», «hace 3 h», «ayer», «12 oct». */
export function haceCuanto(iso: string, ahora = new Date()): string {
  const d = new Date(iso)
  const min = Math.round((ahora.getTime() - d.getTime()) / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const dias = Math.round(h / 24)
  if (dias === 1) return 'ayer'
  if (dias < 7) return `hace ${dias} días`
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', '')
}

export function fechaCorta(iso: string): string {
  return new Date(iso)
    .toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    .replace('.', '')
}

export function tamanoArchivo(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
