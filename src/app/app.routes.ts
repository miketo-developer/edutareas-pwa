import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent) },

  // Rutas protegidas por el Guard
  {
    path: 'features/muro-maestro',
    canActivate: [authGuard], // <--- Candado puesto
    data: { role: 'maestro' }, // <--- Indicamos qué rol se necesita
    loadComponent: () => import('./features/muro-maestro/muro-maestro.component').then(m => m.MuroMaestroComponent)
  },
  {
    path: 'features/muro-alumno',
    canActivate: [authGuard], // <--- Candado puesto
    data: { role: 'alumno' }, // <--- Indicamos qué rol se necesita
    loadComponent: () => import('./features/muro-alumno/muro-alumno.component').then(m => m.MuroAlumnoComponent)
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];




