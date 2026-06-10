import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

import { firebaseDb } from './firebase';

export type PapelMuscular = 'principal' | 'secundario' | 'estabilizador';
export type NivelIntensidade = 'baixa' | 'média' | 'alta';

export interface ExercicioTreino {
  id: string;
  nome: string;
  grupo: string;
  series: number;
  repeticoes: number;
}

export interface AnaliseTreino {
  musculo: string;
  score: number;
  nivel: NivelIntensidade;
  exercicios: string[];
  papeis: PapelMuscular[];
  sobrecarga: boolean;
}

export interface Treino {
  id?: string;
  uid: string;
  nome: string;
  criadoEm: Timestamp;
  exercicios: ExercicioTreino[];
  analise: AnaliseTreino[];
  possuiAlerta: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TreinoService {
  private readonly nomeColecao = 'treinos';

  async salvarTreino(treino: Omit<Treino, 'id'>): Promise<string> {
    const referencia = await addDoc(
      collection(firebaseDb, this.nomeColecao),
      treino
    );

    return referencia.id;
  }

  async buscarTreinos(uid: string): Promise<Treino[]> {
    const consulta = query(
      collection(firebaseDb, this.nomeColecao),
      where('uid', '==', uid)
    );

    const snapshot = await getDocs(consulta);

    return snapshot.docs
      .map((documento) => {
        return {
          id: documento.id,
          ...documento.data(),
        } as Treino;
      })
      .sort((a, b) => b.criadoEm.toMillis() - a.criadoEm.toMillis());
  }

  async deletarTreino(id: string): Promise<void> {
    await deleteDoc(doc(firebaseDb, this.nomeColecao, id));
  }
}