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
    // 0. Normalización: Evita errores por mayúsculas o espacios accidentales
    const emailRef = email.toLowerCase().trim();

    try {
      // 1. VALIDACIÓN DE LISTA BLANCA (Antes de crear la cuenta en Auth)
      if (role === 'maestro') {
        const docRef = doc(this.firestore, `whitelist_docentes/${emailRef}`);
        const docSnap = await getDoc(docRef);

        // Si el documento no existe, detenemos todo antes de crear el usuario en Auth
        if (!docSnap.exists()) {
          throw new Error('Este correo no está autorizado por la Dirección. Consulta al administrador.');
        }
      }

      // 2. CREACIÓN EN FIREBASE AUTH
      // Hasta que esta línea se ejecute con éxito, el usuario NO está autenticado
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = credential.user.uid;

      // 3. PERSISTENCIA DEL PERFIL EN FIRESTORE
      // Es correcto guardar más datos aquí (nombre, grupo, etc) que no están en la lista blanca
      const userDoc = doc(this.firestore, `users/${uid}`);

      await setDoc(userDoc, {
        uid,
        email: emailRef,
        nombre: nombre.trim(),
        role: role,
        // Tip: Si es maestro, podrías guardar el grupoId como opcional o vacío
        grupoId: role === 'maestro' ? 'DOCENTE_GENERAL' : grupoId,
        createdAt: new Date()
      });

      return credential;
    } catch (error: any) {
      // Manejo de errores de Firebase para mensajes más claros
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este correo ya está registrado en la plataforma.');
      }
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
      }  else if (userData?.['role'] === 'admin') {
        this.router.navigate(['/features/admin-dashboard']);
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
