import { RoleType } from "../enum/role-type";
/**
 * Interfaz que representa la respuesta de un rol desde el backend.
 */
export interface RoleResponse {
    id: number;
    name: RoleType;
    description: string;
}
