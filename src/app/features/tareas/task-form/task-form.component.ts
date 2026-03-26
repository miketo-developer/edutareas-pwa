import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { Auth } from '@angular/fire/auth';
import { Tarea } from '../../../core/models/tarea.model';


@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private auth = inject(Auth);

  @Input() tarea?: Tarea; // para editar
  @Output() tareaGuardada = new EventEmitter<void>(); // Para refrescar
  @Output() cerrarForm = new EventEmitter<void>();

  form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    materia: ['', Validators.required],
    fechaEntrega: ['', Validators.required],
    grupoId: ['', Validators.required]
  });

  ngOnInit() {
    if (this.tarea) {
      this.form.patchValue({
      ...this.tarea,
      fechaEntrega: this.formatDate(this.tarea.fechaEntrega)
    });
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    const user = this.auth.currentUser;
    if (!user) return;

    const formValue = this.form.getRawValue();

    const data = {
      titulo: formValue.titulo!,
      descripcion: formValue.descripcion!,
      materia: formValue.materia!,
      fechaEntrega: new Date(formValue.fechaEntrega!),
      grupoId: formValue.grupoId!,
      docenteId: user.uid,
      createdAt: new Date()
    };

    try {
      if (this.tarea?.id) {
        await this.taskService.updateTask(this.tarea.id, data);
        alert('Tarea actualizada');
      } else {
        await this.taskService.createTask(data as any);
        alert('Tarea creada');
      }

      // 1. Notificamos al componente padre que se guardó con éxito
      this.tareaGuardada.emit();

      // 2. Limpiamos el formulario
      this.form.reset();

    } catch (error) {
      console.error("Error al guardar:", error);
      alert('Hubo un error al guardar la tarea');
    }
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  onCancelar() {
    this.form.reset();
    this.cerrarForm.emit();
  }

}
