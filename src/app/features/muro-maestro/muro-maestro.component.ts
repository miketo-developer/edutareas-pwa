import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Tarea } from '../../core/models/tarea.model';
import { TaskFormComponent } from '../tareas/task-form/task-form.component';
import { TaskDetailComponent } from '../tareas/task-detail/task-detail.component';


@Component({
  selector: 'app-muro-maestro',
  standalone: true,
  imports: [
    CommonModule,
    TaskFormComponent,
    TaskDetailComponent
  ],
  templateUrl: './muro-maestro.component.html',
  styleUrl: './muro-maestro.component.scss'
})
export class MuroMaestroComponent implements OnInit {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private taskService = inject(TaskService);

  // Variables de estado
  tareas: Tarea[] = [];
  tareasPorGrupo: { [key: string]: Tarea[] } = {};
  gruposDisponibles: string[] = [];
  nombreUsuario: string = 'Cargando...';

  // Control de Modales
  mostrarFormulario = false;
  tareaSeleccionada: Tarea | null = null;

  async ngOnInit() {
    await this.cargarUsuario();
    await this.cargarTareas(); // Este ahora hace todo el trabajo
  }

  async cargarUsuario() {
    const user = this.auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));
      if (userDoc.exists()) {
        this.nombreUsuario = userDoc.data()['nombre'] || 'Profesor';
      }
    }
  }

  // MÉTODO CONSOLIDADO Y CORREGIDO
  async cargarTareas() {
    const user = this.auth.currentUser;
    if (!user) return;

    // 1. Obtenemos las tareas usando el nuevo método del servicio
    this.tareas = await this.taskService.getTasksByDocente(user.uid);

    // 2. AGRUPAMIENTO LÓGICO (Corrección del error 'acc' implicitly any)
    // Definimos explícitamente el tipo del acumulador: { [key: string]: Tarea[] }
    this.tareasPorGrupo = this.tareas.reduce((acc: { [key: string]: Tarea[] }, tarea: Tarea) => {
      const grupo = tarea.grupoId || 'Sin Grupo';
      if (!acc[grupo]) {
        acc[grupo] = [];
      }
      acc[grupo].push(tarea);
      return acc;
    }, {});

    // 3. Extraemos las llaves de los grupos para el *ngFor del HTML
    this.gruposDisponibles = Object.keys(this.tareasPorGrupo);
  }

  // Métodos de acción
  abrirFormulario() {
    this.tareaSeleccionada = null;
    this.mostrarFormulario = true;
  }

  abrirVistaPrevia(tarea: Tarea) {
    this.tareaSeleccionada = tarea;
    // No activamos mostrarFormulario porque queremos ver el TaskDetail, no el TaskForm
  }

  editarTarea(tarea: Tarea) {
    this.tareaSeleccionada = tarea;
    this.mostrarFormulario = true;
  }

  async eliminarTarea(id: string) {
    const confirmacion = confirm('¿Eliminar esta tarea?');
    if (!confirmacion) return;

    await this.taskService.deleteTask(id);
    await this.cargarTareas(); // Recargamos para actualizar grupos y lista
  }

  onTareaGuardada() {
    this.mostrarFormulario = false;
    this.cargarTareas();
  }

  logout() {
    this.authService.logout();
  }

}
