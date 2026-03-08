import { Routes } from "@angular/router";

export const FAVORITES_ROUTES: Routes = [
{
    path:'list',
    loadComponent: () => 
        import('./pages/favorites-list/favorites-list').then(m => m.FavoritesList)
}

];  