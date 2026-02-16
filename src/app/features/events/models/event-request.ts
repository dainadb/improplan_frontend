import { EventStatusType } from "../enum/event-status-type";

/**
 * Interfaz que representa la estructura de una solicitud para crear o actualizar un evento.
 */
export interface EventRequest {
    name: string;
    summary: string;
    description: string;
    placeName: string;
    address: string;
    latitude: number;   //BigDecimal no es compatible con JSON, por lo que se utiliza number.
    longitude: number;  
    image: string;
    infoUrl: string;
    isFree: boolean;
    price: number;      
    status: EventStatusType;
    municipalityName: string;
    themeName: string;
    eventDates: string[]; // En Angular Set<string> no es compatible con JSON, por lo que se utiliza un array de strings para representar las fechas del evento.
}

