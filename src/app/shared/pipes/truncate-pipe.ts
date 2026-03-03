import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe que trunca un texto a un número máximo de caracteres.
 * Uso: {{ texto | truncate:150:'...' }}
 */
@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  /**
   * @param value   Texto a truncar
   * @param limit   Número máximo de caracteres (por defecto 150)
   * @param ellipsis  Cadena que se añade al final si se trunca (por defecto '...')
   */
  transform(value: string | null | undefined, limit: number = 150, ellipsis: string = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value; // Si el texto es más corto que el límite, se devuelve sin cambios
    return value.substring(0, limit).trimEnd() + ellipsis; // Si se trunca, se añade la cadena de elipsis al final
  }
}
