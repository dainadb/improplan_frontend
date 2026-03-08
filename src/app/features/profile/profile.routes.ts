import { Routes } from "@angular/router";


export const PROFILE_ROUTES: Routes = [
    
    {
        path:'page',
        loadComponent: () => import('./pages/profile-page/profile-page').then(m => m.ProfilePage),
    },

    {
        path:'form',
        loadComponent: () => import('./pages/profile-form/profile-form').then(m => m.ProfileForm),

    }
]; 