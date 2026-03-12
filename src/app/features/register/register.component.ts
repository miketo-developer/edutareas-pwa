import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Definición del formulario con validaciones
  registerForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['alumno', [Validators.required]] // Valor por defecto
  });

  async onSubmit() {
    if (this.registerForm.valid) {
      const { email, password, role, nombre } = this.registerForm.value;
      try {
        await this.authService.register(email, password, role, nombre);
        alert('Usuario registrado con éxito');
      } catch (error: any) {
        alert('Error al registrar: ' + error.message);
      }
    }
  }
}
