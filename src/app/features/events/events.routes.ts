import { Routes } from "@angular/router";
import { authGuard } from "../../core/guards/auth-guard";


export const EVENTS_ROUTES: Routes = [
    {
    path: 'list',
    loadComponent: () =>
      import('./pages/event-list/event-list').then(m => m.EventList),
    },
    {
      path: 'map',
      loadComponent: () =>
        import('./pages/events-map/events-map').then(m => m.EventsMap),

    },
    {
      path: 'detail/:id',
      loadComponent: () =>
        import('./pages/event-detail-page/event-detail-page').then(m => m.EventDetailPage),

    },
    {
      path: 'create',
      loadComponent: () =>
        import('./pages/event-create-form/event-create-form').then(m => m.EventCreateForm),
      canActivate: [authGuard],  
    }



];   
