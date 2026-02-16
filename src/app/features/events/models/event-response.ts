import { EventStatusType } from "../enum/event-status-type";
/**
 * Interfaz que representa la estructura de una respuesta al obtener los detalles de un evento.
 */
export interface EventResponse {
    id: number;
    name: string;
    summary: string;
    description: string;
    placeName: string;
    address: string;
    latitude: number;
    longitude: number;
    image: string;
    infoUrl: string;
    isFree: boolean;
    price: number;
    inTime: boolean;
    status: EventStatusType;
    municipalityName: string;
    themeName: string;
    eventDates: string[]; // En Angular Set<string> no es compatible con JSON, por lo que se utiliza un array de strings para representar las fechas del evento.
}
