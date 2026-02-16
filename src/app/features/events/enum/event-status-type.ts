/**
 * Enum para los estados de un evento.
 * PUBLISHED: El evento ha sido publicado y es visible para los usuarios.
 * PENDING: El evento está pendiente de revisión o aprobación antes de ser publicado.
 * DISCARDED: El evento ha sido descartado y no será publicado ni visible para los usuarios.
 */
export enum EventStatusType {
    PUBLISHED = 'PUBLISHED',
    PENDING = 'PENDING',
    DISCARDED = 'DISCARDED',
}
