import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Unsubscribe } from '@angular/fire/firestore'; // Importación correcta para Firestore
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { Tarea } from '../../core/models/tarea.model';
import { TaskDetailComponent } from '../tareas/task-detail/task-detail.component';

@Component({
  selector: 'app-muro-alumno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TaskDetailComponent
  ],
  templateUrl: './muro-alumno.component.html',
  styleUrl: './muro-alumno.component.scss'
})
export class MuroAlumnoComponent implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private taskService = inject(TaskService);

  // Variables de estado
  tareas: Tarea[] = [];
  grupoId: string = '';
  nombreUsuario: string = 'Alumno';
  tareaSeleccionada: Tarea | null = null;
  filtroActual: 'todas' | 'pendientes' | 'completadas' = 'todas';

  // Seguimiento y suscripciones
  seguimientoMap: { [key: string]: any } = {};
  private tareasSub?: Unsubscribe;

  // Getters para la interfaz
  get materiasPendientes() {
    const materias = this.tareas.map(t => t.materia);
    return [...new Set(materias)];
  }

  // Getter para filtrar la lista automáticamente
  get tareasFiltradas() {
    if (this.filtroActual === 'pendientes') {
      return this.tareas.filter(t => !this.seguimientoMap[t.id!]?.completada);
    }
    if (this.filtroActual === 'completadas') {
      return this.tareas.filter(t => this.seguimientoMap[t.id!]?.completada);
    }
    return this.tareas;
  }

  get tituloFeed() {
    const titulos = {
      'todas': 'Todas las Tareas',
      'pendientes': 'Tareas por Realizar',
      'completadas': 'Tareas Terminadas'
    };
    return titulos[this.filtroActual];
  }

  async ngOnInit() {
    // 1. Cargamos la información del perfil
    await this.cargarUsuario();

    // 2. Activamos la escucha en tiempo real si tenemos un grupo
    if (this.grupoId) {
      this.activarMuroRealTime();
    }
  }

  // Centraliza la obtención de datos del perfil
  async cargarUsuario() {
    const user = this.auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.nombreUsuario = data['nombre'] || 'Alumno';
        this.grupoId = data['grupoId'] || '';
      }
    }
  }

  // Llama a cargarSeguimiento automáticamente
  activarMuroRealTime() {
    if (!this.grupoId) return;

    this.tareasSub = this.taskService.listenTasksByGrupo(this.grupoId, async (tareasRecibidas) => {
      this.tareas = tareasRecibidas;
      // Al recibir tareas nuevas (o actualizadas), refrescamos el estado de completado
      await this.cargarSeguimiento();
    });
  }

  // Recupera el estado de cada tarea para el alumno actual
  async cargarSeguimiento() {
    for (const tarea of this.tareas) {
      if (tarea.id) {
        const seg = await this.taskService.getSeguimientoTarea(tarea.id);
        if (seg) {
          this.seguimientoMap[tarea.id] = seg;
        }
      }
    }
  }

  // Lógica de visualización y estados
  obtenerEstado(fecha: Date): 'vencida' | 'proxima' | 'activa' {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(fecha);
    entrega.setHours(0, 0, 0, 0);

    const diffDias = Math.floor((entrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return 'vencida';
    if (diffDias <= 2) return 'proxima';
    return 'activa';
  }

  async toggleCompletada(tareaId: string, event: any) {
    const completada = event.target.checked;
    const nota = this.seguimientoMap[tareaId]?.notaPersonal || '';

    // Actualizamos localmente para feedback inmediato
    if (!this.seguimientoMap[tareaId]) {
      this.seguimientoMap[tareaId] = { completada, notaPersonal: nota };
    } else {
      this.seguimientoMap[tareaId].completada = completada;
    }

    await this.taskService.guardarSeguimiento(tareaId, completada, nota);
  }

  // Control de interfaz
  abrirDetalle(tarea: Tarea) {
    this.tareaSeleccionada = tarea;
    // Bloquea el scroll del cuerpo de la página
    //document.body.style.overflow = 'hidden';
  }

  // Al cerrar el modal
  cerrarDetalle() {
    this.tareaSeleccionada = null;
    // Restablece el scroll
    //document.body.style.overflow = 'auto';
  }

  cambiarFiltro(nuevoFiltro: 'todas' | 'pendientes' | 'completadas') {
    this.filtroActual = nuevoFiltro;
  }

  async onActualizado() {
    // Al actualizar desde el modal, refrescamos el seguimiento específico
    await this.cargarSeguimiento();
  }

  verImagenFull(url: string) {
    if (url) window.open(url, '_blank');
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    // Limpieza de la suscripción para evitar fugas de memoria
    if (this.tareasSub) {
      this.tareasSub();
    }
  }
}





















/*
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth, Unsubscribe } from '@angular/fire/auth';

import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Tarea } from '../../core/models/tarea.model';
import { FormsModule } from '@angular/forms';
import { TaskDetailComponent } from '../tareas/task-detail/task-detail.component';


@Component({
  selector: 'app-muro-alumno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TaskDetailComponent
  ],
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

  tareaSeleccionada: Tarea | null = null;

  private tareasSub?: Unsubscribe; // Para guardar la conexión y poder cerrarla

  // Diccionario para almacenar el seguimiento de cada tarea (completada/nota)
  seguimientoMap: { [key: string]: any } = {};

  // Para abrir la imagen en una pestaña nueva al hacer clic
  verImagenFull(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Después de cargar las tareas, podemos agruparlas (opcional para el reporte)
  get materiasPendientes() {
    const materias = this.tareas.map(t => t.materia);
    return [...new Set(materias)]; // Lista de materias únicas con tarea
  }

  async ngOnInit() {
    // 1. Cargar usuario y grupoId (Igual que antes)
    // -> -> -> await this.cargarUsuario(); // No existe este método

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

    // 2. En lugar de llamar a cargarTareas(), activamos la escucha:
    this.activarMuroRealTime();

  }

  activarMuroRealTime() {
    if (!this.grupoId) return;

    // Llamamos al nuevo método y le pasamos una función
    // Cada vez que Firebase detecte un cambio, este código se ejecutará solo
    this.tareasSub = this.taskService.listenTasksByGrupo(this.grupoId, (tareasRecibidas) => {
      this.tareas = tareasRecibidas;
      // -> -> -> this.cargarSeguimiento(); // Actualizamos los checks de completado  // Este método tampoco existe en esta clase
    });
  }

  async cargarTareas() {
    if (!this.grupoId) return;
    this.tareas = await this.taskService.getTasksByGrupo(this.grupoId);

    // Cargar el estado de completado de cada tarea
    for (const tarea of this.tareas) {
      if (tarea.id) {
        const seg = await this.taskService.getSeguimientoTarea(tarea.id);
        if (seg) this.seguimientoMap[tarea.id] = seg;
      }
    }
  }

  // Lógica para determinar el color y etiqueta según la fecha
  obtenerEstado(fecha: Date): 'vencida' | 'proxima' | 'activa' {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(fecha);
    entrega.setHours(0, 0, 0, 0);

    const diffDias = Math.floor((entrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return 'vencida';
    if (diffDias <= 2) return 'proxima';
    return 'activa';
  }

  async toggleCompletada(tareaId: string, event: any) {
    const completada = event.target.checked;
    const nota = this.seguimientoMap[tareaId]?.notaPersonal || '';
    await this.taskService.guardarSeguimiento(tareaId, completada, nota);
  }

  logout() {
    this.authService.logout();
  }

  abrirDetalle(tarea: Tarea) {
    this.tareaSeleccionada = tarea;
  }

  onActualizado() {
    this.cargarTareas(); // Refresca los estados de completado/notas
  }

  // Debemos cerrar la conexión cuando el alumno salga del muro para no gastar batería/datos
  ngOnDestroy() {
    if (this.tareasSub) {
      this.tareasSub();
    }
  }

}
*/
