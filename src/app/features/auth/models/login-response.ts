/**
 * Interfaz para la respuesta de inicio de sesión.
 */
export interface LoginResponse {
    email: string;
    name: string;
    roles: string[];
}
