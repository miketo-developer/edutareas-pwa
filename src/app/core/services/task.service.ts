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

  // MOCK: Simulación de subida a Firebase Storage
  // Con el plan Blaze, aquí usaremos la librería 'firebase/storage'
  async uploadImageMock(file: File): Promise<string> {
    return new Promise((resolve) => {
      // Simulamos un retraso de red de 1.5 segundos
      setTimeout(() => {
        const reader = new FileReader();  //Al tener la NUEVA CUENTA de Firestore, en lugar de usar FileReader, usaremos uploadBytes y getDownloadURL de Firebase Storage
        reader.onload = (e: any) => {
          // Devolvemos el Base64 como si fuera la URL de descarga de Firebase
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      }, 1500);
    });
  }

  // Crear tarea
  async createTask(tarea: Omit<Tarea, 'id'>) {
    return await addDoc(this.tareasCollection, tarea);
  }

  // Obtener tareas del maestro actual
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

  // Actualizar tarea
  async updateTask(id: string, data: Partial<Tarea>) {
    const ref = doc(this.firestore, `tareas/${id}`);
    return await updateDoc(ref, data);
  }

  // Eliminar tarea
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

