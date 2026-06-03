import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class WorkoutDashboardComponent implements OnInit {
  treinos: Treino[] = [];
  carregando = false;
  salvando = false;
  erro = '';

  // Formulário
  mostrarFormulario = false;
  nomeTreino = '';
  exercicios: Exercicio[] = [{ nome: '', series: 3, repeticoes: 10 }];

  constructor(
    private treinoService: TreinoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.carregarTreinos();
    } else {
      const interval = setInterval(() => {
        if (this.authService.currentUser()) {
          clearInterval(interval);
          this.carregarTreinos();
        }
      }, 200);
    }
  }

  async carregarTreinos() {
    const uid = this.authService.currentUser()?.uid;
    console.log('UID ao carregar:', uid);
    if (!uid) return;
    this.carregando = true;
    try {
      this.treinos = await this.treinoService.buscarTreinos(uid);
      console.log('Treinos retornados:', this.treinos);
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Erro ao carregar:', e);
      this.erro = 'Erro ao carregar treinos.';
    } finally {
      this.carregando = false;
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
      setTimeout(() => this.carregarTreinos(), 300);
    } catch (e) {
      this.erro = 'Erro ao salvar treino.';
    } finally {
      this.salvando = false;
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