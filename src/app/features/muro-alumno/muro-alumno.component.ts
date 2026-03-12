import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-muro-alumno',
  standalone: true,
  imports: [],
  templateUrl: './muro-alumno.component.html',
  styleUrl: './muro-alumno.component.scss'
})
export class MuroAlumnoComponent implements OnInit {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  nombreUsuario: string = 'Alumno';

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));
      if (userDoc.exists()) {
        this.nombreUsuario = userDoc.data()['nombre'] || 'Alumno';
      }
    }
  }

  logout() {
    this.authService.logout();
  }
}
