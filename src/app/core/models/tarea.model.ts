export interface Tarea {
  id?: string;
  titulo: string;
  descripcion: string;
  materia: string;
  fechaEntrega: Date;
  grupoId: string;
  docenteId: string;
  createdAt: Date;
}
