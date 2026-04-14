import { inject, Injectable } from '@angular/core';
import { Firestore, doc, setDoc, deleteDoc, collection, collectionData, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private firestore = inject(Firestore);

  // 1. Agregar correo a la lista blanca
  async autorizarMaestro(email: string) {
    const correoNormalizado = email.toLowerCase().trim();
    const docRef = doc(this.firestore, `whitelist_docentes/${correoNormalizado}`);

    return await setDoc(docRef, {
      email: correoNormalizado,
      autorizado: true,
      fechaAlta: serverTimestamp()
    });
  }

  // Obtener lista de maestros autorizados
  getListaBlanca(): Observable<any[]> {
    const ref = collection(this.firestore, 'whitelist_docentes');
    return collectionData(ref, { idField: 'id' });
  }

  // Revocar autorización
  async revocarAutorizacion(emailId: string) {
    const docRef = doc(this.firestore, `whitelist_docentes/${emailId}`);
    return await deleteDoc(docRef);
  }
}
