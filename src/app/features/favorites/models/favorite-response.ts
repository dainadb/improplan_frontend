/**
 * * Interfaz de respuesta con la información de un evento marcado como favorito.
 */
export interface FavoriteResponse {
    id: number;
    favoriteDate: string;  // LocalDateTime → string (ISO 'YYYY-MM-DDTHH:mm:ss')
    userEmail: string;
    eventId: number;
    eventName: string;
    eventImage: string;
    eventPrice: number;
    eventThemeName: string;
    eventMunicipalityName: string;
    eventInTime: boolean;
    eventStatus: string;
}
