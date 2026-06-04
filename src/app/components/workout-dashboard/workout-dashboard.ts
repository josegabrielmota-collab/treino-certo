import { Component, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreinoService, Treino, Exercicio } from '../../services/treino.service';
import { AuthService } from '../../services/auth.service';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-workout-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-dashboard.html',
  styleUrls: ['./workout-dashboard.scss'],
})
export class WorkoutDashboardComponent {
  // --- Meus Treinos (Firebase) ---
  treinos: Treino[] = [];
  carregando = false;
  salvando = false;
  erro = '';
  mostrarFormulario = false;
  nomeTreino = '';
  exercicios: Exercicio[] = [{ nome: '', series: 3, repeticoes: 10 }];

  // --- Guia de Divisões (local) ---
  activeDivision: string = 'abc';

  constructor(
    private treinoService: TreinoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.carregarTreinos();
      }
    });
  }

  async carregarTreinos() {
    const uid = this.authService.currentUser()?.uid;
    if (!uid) return;
    this.carregando = true;
    this.cdr.detectChanges();
    try {
      this.treinos = await this.treinoService.buscarTreinos(uid);
    } catch (e) {
      console.error('Erro ao carregar treinos:', e);
      this.erro = 'Erro ao carregar treinos.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  adicionarExercicio() {
    this.exercicios.push({ nome: '', series: 3, repeticoes: 10 });
  }

  removerExercicio(index: number) {
    if (this.exercicios.length > 1) {
      this.exercicios.splice(index, 1);
    }
  }

  async salvarTreino() {
    const uid = this.authService.currentUser()?.uid;
    if (!uid || !this.nomeTreino.trim()) return;
    const exerciciosValidos = this.exercicios.filter(e => e.nome.trim());
    if (exerciciosValidos.length === 0) {
      this.erro = 'Adicione pelo menos um exercício.';
      return;
    }
    this.salvando = true;
    this.erro = '';
    try {
      await this.treinoService.salvarTreino({
        nome: this.nomeTreino.trim(),
        exercicios: exerciciosValidos,
        uid,
        criadoEm: Timestamp.now(),
      });
      this.nomeTreino = '';
      this.exercicios = [{ nome: '', series: 3, repeticoes: 10 }];
      this.mostrarFormulario = false;
      await this.carregarTreinos();
    } catch (e) {
      this.erro = 'Erro ao salvar treino.';
    } finally {
      this.salvando = false;
      this.cdr.detectChanges();
    }
  }

  async deletarTreino(id: string) {
    if (!confirm('Excluir este treino?')) return;
    await this.treinoService.deletarTreino(id);
    await this.carregarTreinos();
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.nomeTreino = '';
    this.exercicios = [{ nome: '', series: 3, repeticoes: 10 }];
    this.erro = '';
  }

  formatarData(ts: Timestamp): string {
    return ts?.toDate().toLocaleDateString('pt-BR') ?? '';
  }
}