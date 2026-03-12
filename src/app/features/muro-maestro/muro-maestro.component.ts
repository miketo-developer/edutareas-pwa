import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-muro-maestro',
  standalone: true,
  imports: [],
  templateUrl: './muro-maestro.component.html',
  styleUrl: './muro-maestro.component.scss'
})
export class MuroMaestroComponent implements OnInit {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  // Definimos la variable para que no haya error
  nombreUsuario: string = 'Cargando...';

  async ngOnInit() {
    // Obtenemos el usuario autenticado actualmente
    const user = this.auth.currentUser;

    if (user) {
      // Consultamos su documento en la colección 'users' usando su UID
      const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.nombreUsuario = userData['nombre'] || 'Profesor';
      }
    }
  }

  logout() {
    this.authService.logout();
  }
}
