import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private auth = inject(Auth);

  // Variables para el manejo de la imagen
  archivoSeleccionado: File | null = null;
  imagenPreview: string | null = null;

  @Input() tarea: Tarea | null = null;
  @Output() tareaGuardada = new EventEmitter<void>();
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
    let finalImagenUrl = this.tarea?.imagenUrl || ''; // Mantener la actual si estamos editando

    try {
      // Si el maestro seleccionó una NUEVA imagen, "subirla"
      if (this.archivoSeleccionado) {
        // Aquí llamamos a nuestro simulador
        finalImagenUrl = await this.taskService.uploadImageMock(this.archivoSeleccionado);
      }

      const [year, month, day] = formValue.fechaEntrega!.split('-');
      const fechaCorrecta = new Date(Number(year), Number(month) - 1, Number(day));

      const data: Omit<Tarea, 'id'> = {
        titulo: formValue.titulo!,
        descripcion: formValue.descripcion!,
        materia: formValue.materia!,
        fechaEntrega: fechaCorrecta,
        grupoId: formValue.grupoId!,
        docenteId: user.uid,
        createdAt: this.tarea ? this.tarea.createdAt : new Date(),
        imagenUrl: finalImagenUrl // <--- Guardamos la URL (o Base64) en Firestore
      };

      if (this.tarea?.id) {
        await this.taskService.updateTask(this.tarea.id, data);
        alert('Tarea actualizada con éxito');
      } else {
        await this.taskService.createTask(data);
        alert('Tarea publicada con imagen');
      }

      this.tareaGuardada.emit();
      this.form.reset();
      this.removerImagen();

    } catch (error) {
      console.error("Error al procesar tarea:", error);
      alert('Hubo un error al guardar la actividad');
    }




    /*
    // CORRECCIÓN: Evitar el desfase de zona horaria agregando T00:00:00
    const [year, month, day] = formValue.fechaEntrega!.split('-');
    const fechaCorrecta = new Date(Number(year), Number(month) - 1, Number(day));

    const data: Omit<Tarea, 'id'> = {
      titulo: formValue.titulo!,
      descripcion: formValue.descripcion!,
      materia: formValue.materia!,
      fechaEntrega: fechaCorrecta,
      grupoId: formValue.grupoId!,
      docenteId: user.uid,
      createdAt: this.tarea ? this.tarea.createdAt : new Date() // Mantener fecha de creación original si se edita
    };

    try {
      if (this.tarea?.id) {
        await this.taskService.updateTask(this.tarea.id, data);
        alert('Tarea actualizada');
      } else {
        await this.taskService.createTask(data);
        alert('Tarea creada');
      }

      this.tareaGuardada.emit();
      this.form.reset();

    } catch (error) {
      console.error("Error al guardar:", error);
      alert('Hubo un error al guardar la tarea');
    }
    */
  }



  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }




  // Captura el archivo y genera la previsualización
  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      // Justificación "Saber": Validación de MIME Types
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona solo archivos de imagen (JPG, PNG, etc).');
        return;
      }

      // Validar tamaño (ej. máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es muy pesada. El tamaño máximo es 2MB.');
        return;
      }

      this.archivoSeleccionado = file;

      // Generar previsualización local (Base64)
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result; // URL local temporal
      };
      reader.readAsDataURL(file);
    }
  }

  // Limpiar la imagen si el maestro se arrepiente
  removerImagen() {
    this.archivoSeleccionado = null;
    this.imagenPreview = null;
  }

  onCancelar() {
    this.form.reset();
    this.removerImagen(); // <--- Limpiamos la imagen al cancelar
    this.cerrarForm.emit();
  }


}
