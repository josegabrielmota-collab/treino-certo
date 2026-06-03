import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { firebaseDb } from './firebase';

export interface Exercicio {
  nome: string;
  series: number;
  repeticoes: number;
  peso?: number;
}

export interface Treino {
  id?: string;
  nome: string;
  exercicios: Exercicio[];
  uid: string;
  criadoEm: Timestamp;
}

@Injectable({ providedIn: 'root' })
export class TreinoService {

  async salvarTreino(treino: Omit<Treino, 'id'>): Promise<void> {
    await addDoc(collection(firebaseDb, 'treinos'), treino);
  }

  async buscarTreinos(uid: string): Promise<Treino[]> {
    const q = query(
      collection(firebaseDb, 'treinos'),
      where('uid', '==', uid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Treino));
  }

  async deletarTreino(id: string): Promise<void> {
    await deleteDoc(doc(firebaseDb, 'treinos', id));
  }
}