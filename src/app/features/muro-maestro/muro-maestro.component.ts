import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Tarea } from '../../core/models/tarea.model';
import { TaskFormComponent } from '../tareas/task-form/task-form.component';


@Component({
  selector: 'app-muro-maestro',
  standalone: true,
  imports: [CommonModule, TaskFormComponent],
  templateUrl: './muro-maestro.component.html',
  styleUrl: './muro-maestro.component.scss'
})
export class MuroMaestroComponent implements OnInit {

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private taskService = inject(TaskService);

  tareas: Tarea[] = [];
  mostrarFormulario = false;
  tareaSeleccionada?: Tarea; // Por si se va a editar una existente
  gruposUnicos: string[] = [];

  nombreUsuario: string = 'Cargando...';

  async ngOnInit() {
    await this.cargarUsuario();
    await this.cargarTareas();
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

  async cargarTareas() {
    this.tareas = await this.taskService.getMyTasks();

    // Extraemos los gruposID únicos de las tareas
    const grupos = this.tareas.map(t => t.grupoId); // Asegúrate de que el nombre coincida con tu interfaz
    this.gruposUnicos = [...new Set(grupos)]; // Elimina duplicados
  }

  logout() {
    this.authService.logout();
  }

  abrirFormulario() {
    this.tareaSeleccionada = undefined;
    this.mostrarFormulario = true;
  }

  editarTarea(tarea: Tarea) {
    const user = this.auth.currentUser;

    // VALIDACIÓN DE PROPIEDAD
    if (tarea.docenteId !== user?.uid) {
      alert('No puedes editar esta tarea');
      return;
    }

    this.tareaSeleccionada = tarea;
    this.mostrarFormulario = true;
  }

  async eliminarTarea(id: string) {
    const tarea = this.tareas.find(t => t.id === id);
    const user = this.auth.currentUser;

    // VALIDACIÓN DE PROPIEDAD
    if (!tarea || tarea.docenteId !== user?.uid) {
      alert('No puedes eliminar esta tarea');
      return;
    }

    const confirmacion = confirm('¿Eliminar esta tarea?');
    if (!confirmacion) return;

    await this.taskService.deleteTask(id);
    await this.cargarTareas();
  }

  // PARA RECARGAR DESPUÉS DE GUARDAR
  onTareaGuardada() {
    this.mostrarFormulario = false;
    this.cargarTareas();
  }
}
