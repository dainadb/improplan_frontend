import { Routes } from "@angular/router";

export const EVENTS_ROUTES: Routes = [
    {
    path: 'list',
    loadComponent: () =>
      import('./pages/event-list/event-list').then(m => m.EventList),
    }
];   