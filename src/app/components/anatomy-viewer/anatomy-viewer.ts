import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-anatomy-viewer",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./anatomy-viewer.html",
  styleUrls: ["./anatomy-viewer.scss"],
})
export class AnatomyViewerComponent {
  selectedMuscle: any;

  muscleGroups = [
    {
      id: "peitoral",
      name: "Peitoral (Maior e Menor)",
      icon: "🍒",
      image: "assets/anatomy/peitoral.png",
      function: "Adução, rotação interna e flexão do úmero (braço).",
      importance:
        'Essencial para movimentos de "empurrar" (supino, flexão). Treinar peito estabiliza a articulação do ombro, melhora a postura (evitando ombros caídos) e é fundamental para a força da parte superior do corpo em atividades diárias.',
    },
    {
      id: "dorsais",
      name: "Dorsais (Costas Completas)",
      icon: "🦅",
      image: "assets/anatomy/dorsal.png", // Conforme o print: dorsal
      function:
        "Adutores, extensores e rotadores internos do braço; estabilizadores da coluna.",
      importance:
        'A "asa" das costas. Treinar dorsais (puxadas, remadas) é o pilar da postura correta, combatendo a cifose. Costas fortes protegem a coluna vertebral contra dores crônicas e lesões, além de definir a largura do tronco.',
    },
    {
      id: "ombros",
      name: "Deltoides (Ombros)",
      icon: "🛡️",
      image: "assets/anatomy/ombro.png", // Conforme o print: ombro
      function:
        "Abdução (elevação lateral), flexão (frente) e extensão (trás) do braço.",
      importance:
        "A articulação mais móvel e instável do corpo. Treinar ombros de forma equilibrada é CRÍTICO para prevenir lesões e luxações. Eles são recrutados em quase todos os treinos de superior e dão o aspector largo e atlético.",
    },
    {
      id: "triceps",
      name: "Tríceps Braquial",
      icon: "⚡",
      image: "assets/anatomy/triceps.png",
      function: "Extensão do cotovelo.",
      importance:
        "Representa 2/3 do volume do braço. Fundamental para a força de empurrar. Tríceps fortes são necessários para evoluir no supino e desenvolvimentos, além de auxiliarem na estabilização do cotovelo em movimentos finos.",
    },
    {
      id: "biceps",
      name: "Bíceps Braquial e Braquial",
      icon: "💪",
      image: "assets/anatomy/biceps.png", // Conforme o print: bíceps (com acento)
      function: "Flexão do cotovelo e supinação do antebraço.",
      importance:
        'Músculo "cartão de visita". Essencial para movimentos de "puxar" e carregar objetos. Treinar bíceps melhora a força da pegada e auxilia os dorsais nos treinos pesados de costas.',
    },
    {
      id: "antebraco",
      name: "Antebraço e Pegada",
      icon: "🥖",
      image: "assets/anatomy/antebraco.png", // Conforme o print: antebraço (com ç)
      function:
        "Flexão, extensão e desvios do pulso; flexão dos dedos (pegada).",
      importance:
        "O elo fraco na maioria dos treinos. Sem antebraços fortes, você não consegue segurar a barra no Stiff ou Levantamento Terra. Treiná-los diretamente previne tendinites (epicondilite) e garante que sua pegada não falhe antes do músculo alvo.",
    },
    {
      id: "quadriceps",
      name: "Quadríceps (Frente da Coxa)",
      icon: "🍗",
      image: "assets/anatomy/quadrieps.png", // Conforme o print: quadríceps (com acento)
      function: "Extensão do joelho e flexão do quadril.",
      importance:
        "O grupo muscular mais potente do corpo. Vital para andar, correr, levantar e agachar. Treinar quadríceps forte é base para a queima calórica (alto volume muscular) e protege a articulação do joelho contra impactos.",
    },
    {
      id: "posteriores",
      name: "Posteriores de Coxa (Isquiotibiais)",
      icon: "🦵",
      image: "assets/anatomy/posterior.png", // Conforme o print: posterior
      function: "Flexão do joelho e extensão do quadril.",
      importance:
        "Frequentemente negligenciados, gerando desequilíbrios com o quadríceps e causando lesões de joelho (LCA). Treiná-los (Stiff, Flexora) é crucial para a estabilidade da pelve, saúde do joelho e potência na corrida.",
    },
    {
      id: "gluteos",
      name: "Glúteos (Máximo, Médio e Mínimo)",
      icon: "🍑",
      image: "assets/anatomy/gluteos.png", // Conforme o print: glúteos (com acento)
      function:
        "Extensão, abdução e rotação externa do quadril; estabilização da pelve.",
      importance:
        'Muito além da estética. O glúteo máximo é o principal motor da marcha e do agachamento. Glúteos médios fortes previnem o "valgo dinâmico" (joelho para dentro), dores lombares e lesões nos quadris e joelhos.',
    },
    {
      id: "panturrilhas",
      name: "Panturrilhas (Gastrocnêmio e Sóleo)",
      icon: "🧦",
      image: "assets/anatomy/panturrilhas.png",
      function: "Flexão plantar (ficar na ponta dos pés).",
      importance:
        'O "segundo coração" do corpo. Auxiliam brutalmente no retorno venoso (circulação). Panturrilhas fortes aumentam a potência do salto, a velocidade na corrida e estabilizam o tornozelo contra entorses.',
    },
    {
      id: "core",
      name: "Core & Abdômen (Reto, Oblíquos e Transverso)",
      icon: "🏋🏻‍♂️",
      image: "assets/anatomy/abdomen.png", // Conforme o print: abdomen (sem acento no arquivo)
      function:
        "Flexão, rotação e inclinação do tronco; compressão abdominal (estabilidade).",
      importance:
        "O centro de força. O core estabiliza a coluna vertebral em TODOS os exercícios pesados (Agachamento, Terra, Supino). Um core fraco é a causa nº 1 de dores lombares. Treiná-lo garante transferência de força eficiente e protege sua coluna.",
    },
  ];

  constructor() {
    this.selectedMuscle = this.muscleGroups[0];
  }

  selectMuscle(muscle: any) {
    this.selectedMuscle = muscle;
  }
}
