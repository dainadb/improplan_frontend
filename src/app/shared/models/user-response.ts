/**
 * Interfaz para las respuestas de usuario.
 */
export interface UserResponse {
    id: number;
    email: string;
    name: string;
    surnames: string;
    roles: string[]; // Set<String> en Java → string[] en JSON
    registrationDate: string; // LocalDateTime → string (ISO 'YYYY-MM-DDTHH:mm:ss')
    enabled: boolean;
}
