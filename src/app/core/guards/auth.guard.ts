import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise((resolve) => {
    // Escuchamos el estado de Firebase Auth
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true); // Hay usuario, puede pasar
      } else {
        router.navigate(['/login']); // No hay usuario, a loguearse
        resolve(false);
      }
    });
  });
};
