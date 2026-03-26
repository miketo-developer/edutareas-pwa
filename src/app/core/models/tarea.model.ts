export interface Tarea {
  id?: string;
  titulo: string;
  descripcion: string;
  fechaEntrega: Date;
  grupoId: string;
  docenteId: string;
  createdAt: Date;
}
