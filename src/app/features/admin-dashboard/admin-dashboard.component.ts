import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  nuevoEmail: string = '';
  maestrosAutorizados$: Observable<any[]> = this.adminService.getListaBlanca();

  async agregarMaestro() {
    if (!this.nuevoEmail) return;
    try {
      await this.adminService.autorizarMaestro(this.nuevoEmail);
      this.nuevoEmail = '';
      alert('Correo autorizado con éxito');
    } catch (error) {
      alert('Error al autorizar');
    }
  }

  async eliminar(email: string) {
    if (confirm(`¿Revocar acceso a ${email}?`)) {
      await this.adminService.revocarAutorizacion(email);
    }
  }

  logout() {
    this.authService.logout();
  }
}
