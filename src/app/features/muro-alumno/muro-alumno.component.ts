import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Tarea } from '../../core/models/tarea.model';


@Component({
  selector: 'app-muro-alumno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './muro-alumno.component.html',
  styleUrl: './muro-alumno.component.scss'
})
export class MuroAlumnoComponent implements OnInit {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private taskService = inject(TaskService);

  tareas: Tarea[] = [];
  grupoId: string = '';

  nombreUsuario: string = 'Alumno';

  // Después de cargar las tareas, podemos agruparlas (opcional para el reporte)
  get materiasPendientes() {
    const materias = this.tareas.map(t => t.materia);
    return [...new Set(materias)]; // Lista de materias únicas con tarea
  }

  async ngOnInit() {
    const user = this.auth.currentUser;

    if (user) {
      const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));

      if (userDoc.exists()) {
        const data = userDoc.data();

        this.nombreUsuario = userDoc.data()['nombre'] || 'Alumno';
        this.grupoId = data['grupoId'];

        await this.cargarTareas();
      }
    }
  }

  async cargarTareas() {
    if (!this.grupoId) return;

    this.tareas = await this.taskService.getTasksByGrupo(this.grupoId);
  }

  logout() {
    this.authService.logout();
  }
}
