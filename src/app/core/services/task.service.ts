import { inject, Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Tarea } from '../models/tarea.model';


@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private tareasCollection = collection(this.firestore, 'tareas');

  // 🔹 Crear tarea
  async createTask(tarea: Omit<Tarea, 'id'>) {
    return await addDoc(this.tareasCollection, tarea);
  }

  // 🔹 Obtener tareas del maestro actual
  async getMyTasks() {
    const user = this.auth.currentUser;
    if (!user) return [];

    const q = query(this.tareasCollection, where('docenteId', '==', user.uid));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convertimos el Timestamp de Firebase a Date de JS
        fechaEntrega: data['fechaEntrega']?.toDate ? data['fechaEntrega'].toDate() : data['fechaEntrega']
      };
    }) as Tarea[];
  }

  // 🔹 Actualizar tarea
  async updateTask(id: string, data: Partial<Tarea>) {
    const ref = doc(this.firestore, `tareas/${id}`);
    return await updateDoc(ref, data);
  }

  // 🔹 Eliminar tarea
  async deleteTask(id: string) {
    const ref = doc(this.firestore, `tareas/${id}`);
    return await deleteDoc(ref);
  }

  async getTasksByGrupo(grupoId: string) {
    const q = query(this.tareasCollection, where('grupoId', '==', grupoId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convertimos el Timestamp de Firebase a Date de JS
        fechaEntrega: data['fechaEntrega']?.toDate ? data['fechaEntrega'].toDate() : data['fechaEntrega']
      };
    }) as Tarea[];
  }
}
