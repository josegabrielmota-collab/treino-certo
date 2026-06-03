import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home';
import { WorkoutDashboardComponent } from './components/workout-dashboard/workout-dashboard';
import { AnatomyViewerComponent } from './components/anatomy-viewer/anatomy-viewer';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HomeComponent, WorkoutDashboardComponent, AnatomyViewerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  activeTab: string = 'inicio';
  modoTela: 'login' | 'cadastro' = 'login';

  email: string = '';
  senha: string = '';
  confirmarSenha: string = '';
  erro: string = '';
  carregando: boolean = false;

  constructor(public auth: AuthService) {}

  async fazerLogin() {
    this.erro = '';
    this.carregando = true;
    try {
      await this.auth.login(this.email, this.senha);
    } catch (e: any) {
      this.erro = this.traduzirErro(e.code);
    } finally {
      this.carregando = false;
    }
  }

  async fazerCadastro() {
    this.erro = '';
    if (this.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não coincidem.';
      return;
    }
    this.carregando = true;
    try {
      await this.auth.cadastrar(this.email, this.senha);
    } catch (e: any) {
      this.erro = this.traduzirErro(e.code);
    } finally {
      this.carregando = false;
    }
  }

  async logout() {
    await this.auth.logout();
    this.activeTab = 'inicio';
    this.email = '';
    this.senha = '';
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  trocarModo(modo: 'login' | 'cadastro') {
    this.modoTela = modo;
    this.erro = '';
    this.senha = '';
    this.confirmarSenha = '';
  }

  private traduzirErro(code: string): string {
    const erros: Record<string, string> = {
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    };
    return erros[code] || 'Erro ao autenticar. Tente novamente.';
  }
}