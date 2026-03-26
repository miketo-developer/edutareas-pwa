import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Observable para escuchar el estado de la sesión en tiempo real
  user$ = user(this.auth);

  /**
   * Registro de usuario con Rol
   * @param email Correo electrónico
   * @param password Contraseña
   * @param role 'maestro' | 'alumno'
   */
  async register(email: string, password: string, role: 'maestro' | 'alumno', nombre: string, grupoId: string) {
    try {
      // 1. Crear usuario en Firebase Auth
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = credential.user.uid;

      // 2. Guardar el perfil con el ROL en Firestore
      const userDoc = doc(this.firestore, `users/${uid}`);
      await setDoc(userDoc, {
        uid,
        email,
        nombre,
        role,
        grupoId,
        createdAt: new Date()
      });

      return credential;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login y redirección por rol
   */
  async login(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = credential.user.uid;

      // Consultar el rol para saber a dónde mandarlo
      const userDoc = await getDoc(doc(this.firestore, `users/${uid}`));
      const userData = userDoc.data();

      if (userData?.['role'] === 'maestro') {
        this.router.navigate(['/features/muro-maestro']);
      } else {
        this.router.navigate(['/features/muro-alumno']);
      }

      return credential;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    return signOut(this.auth).then(() => this.router.navigate(['/features/login']));
  }

}
