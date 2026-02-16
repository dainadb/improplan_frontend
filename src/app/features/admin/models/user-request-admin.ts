/**
 * Interfaz para las solicitudes de actualización de usuarios por parte de administradores.
 */
export interface UserRequestAdmin {
    enabled: boolean;
    roles: string[];
}
