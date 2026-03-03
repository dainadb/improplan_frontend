/**
 * Devuelve la fecha actual en formato 'YYYY-MM-DD' requerido por el backend.
 */
export function dateIso(): string {
  return new Date().toISOString().split('T')[0];
}