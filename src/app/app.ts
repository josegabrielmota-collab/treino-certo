import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home';
import { WorkoutDashboardComponent } from './components/workout-dashboard/workout-dashboard';
import { AnatomyViewerComponent } from './components/anatomy-viewer/anatomy-viewer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HomeComponent, WorkoutDashboardComponent, AnatomyViewerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  // Controla o estado de login do usuário (começa deslogado)
  isLoggedIn: boolean = false;

  // Controla a aba do menu principal
  activeTab: string = 'inicio';

  // Função disparada no submit do formulário
  fazerLogin() {
    this.isLoggedIn = true;
  }

  // Troca as abas do menu
  changeTab(tabName: string) {
    this.activeTab = tabName;
  }
}
