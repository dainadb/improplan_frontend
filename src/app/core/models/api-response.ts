/**
 * Interfaz genérica para representar la estructura de una respuesta de la API.
 * @template T El tipo de dato genérico que se espera en la propiedad 'data' de la respuesta.
 */
export interface ApiResponse<T>{
  success: boolean;
  message: string;
  data: T | null; // null cuando la respuesta es de error  
}
