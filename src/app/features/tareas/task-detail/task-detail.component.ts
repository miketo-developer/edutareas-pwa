import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tarea } from '../../../core/models/tarea.model';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  private taskService = inject(TaskService);

  @Input() tarea!: Tarea;
  @Input() seguimiento: any = { completada: false, notaPersonal: '' };
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<void>();

  // Variables locales para edición
  notaTemp: string = '';
  completadaTemp: boolean = false;
  isSaving: boolean = false;

  ngOnInit() {
    this.notaTemp = this.seguimiento?.notaPersonal || '';
    this.completadaTemp = this.seguimiento?.completada || false;
  }

  async guardarCambios() {
    if (!this.tarea.id) return;
    this.isSaving = true;

    try {
      await this.taskService.guardarSeguimiento(
        this.tarea.id,
        this.completadaTemp,
        this.notaTemp
      );
      this.actualizado.emit();
      this.cerrar.emit();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("No se pudo guardar el progreso.");
    } finally {
      this.isSaving = false;
    }
  }

  get estado() {
    // Reutilizamos la lógica de colores/etiquetas (puedes pasarla como Input o calcularla)
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const entrega = new Date(this.tarea.fechaEntrega);
    const diff = Math.floor((entrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { label: 'Vencida', class: 'vencida' };
    if (diff <= 2) return { label: 'Próxima', class: 'proxima' };
    return { label: 'Activa', class: 'activa' };
  }
}
