import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export const roleGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  const user = auth.currentUser;

  // 1. Si ni siquiera hay usuario, al login
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Obtenemos el rol esperado desde la configuración de la ruta
  const expectedRole = route.data['role'];

  // 3. Consultamos Firestore para verificar el rol real
  const userDoc = await getDoc(doc(firestore, `users/${user.uid}`));
  const userData = userDoc.data();

  if (userData && userData['role'] === expectedRole) {
    return true; // El rol coincide, acceso concedido
  } else {
    // Si es alumno y quiere entrar a maestro (o viceversa), lo mandamos a su muro correcto
    const target = userData?.['role'] === 'maestro' ? '/features/muro-maestro' : '/features/muro-alumno';
    router.navigate([target]);
    return false;
  }
};

