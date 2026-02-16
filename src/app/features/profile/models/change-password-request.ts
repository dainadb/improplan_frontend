/**
 * Interfaz para las solicitudes de cambio de contraseña de usuario.
 */
export interface ChangePasswordRequest {
    newPassword: string;
    checkedPassword: string;
}
