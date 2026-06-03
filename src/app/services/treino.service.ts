import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

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

const app = initializeApp(environment.firebase);
const db = getFirestore(app);

@Injectable({ providedIn: 'root' })
export class TreinoService {

  async salvarTreino(treino: Omit<Treino, 'id'>): Promise<void> {
    await addDoc(collection(db, 'treinos'), treino);
  }

  async buscarTreinos(uid: string): Promise<Treino[]> {
    const q = query(
        collection(db, 'treinos'),
        where('uid', '==', uid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Treino));
  }

  async deletarTreino(id: string): Promise<void> {
    await deleteDoc(doc(db, 'treinos', id));
  }
}