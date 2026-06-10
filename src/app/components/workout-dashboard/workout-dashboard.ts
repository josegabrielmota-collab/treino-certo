import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';

import { AuthService } from '../../services/auth.service';
import { Treino, TreinoService } from '../../services/treino.service';

type PapelMuscular = 'principal' | 'secundario' | 'estabilizador';
type NivelIntensidade = 'baixa' | 'média' | 'alta';

interface MusculoAtivado {
  nome: string;
  papel: PapelMuscular;
}

interface ExercicioCatalogo {
  id: string;
  nome: string;
  grupo: string;
  descricao: string;
  imagem: string;
  musculos: MusculoAtivado[];
}

interface VolumeConfig {
  series: number;
  repeticoes: number;
}

interface AnaliseMuscular {
  musculo: string;
  score: number;
  nivel: NivelIntensidade;
  exercicios: string[];
  papeis: PapelMuscular[];
  sobrecarga: boolean;
}

@Component({
  selector: 'app-workout-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-dashboard.html',
  styleUrls: ['./workout-dashboard.scss'],
})
export class WorkoutDashboardComponent implements OnInit {
  nomeTreino = 'Treino A - Análise Muscular';
  busca = '';
  grupoSelecionado = 'Todos';
  mostrarResumoFinal = false;
  mensagem = '';

  selecionados = new Set<string>();
  volumes: Record<string, VolumeConfig> = {};
  treinosSalvos: Treino[] = [];
  carregandoTreinos = false;
  salvandoTreino = false;

  constructor(
    private readonly treinoService: TreinoService,
    public readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const usuario = this.authService.currentUser();

      if (usuario === undefined) {
        return;
      }

      if (!usuario) {
        this.treinosSalvos = [];
        return;
      }

      void this.carregarTreinosDoFirebase(usuario.uid);
    });
  }

  readonly grupos = [
    'Todos',
    'Peitoral',
    'Costas',
    'Ombros',
    'Tríceps',
    'Bíceps',
    'Antebraço',
    'Quadríceps',
    'Posteriores',
    'Glúteos',
    'Panturrilhas',
    'Abdômen/Core',
  ];

  readonly exercicios: ExercicioCatalogo[] = [
    {
      id: 'peitoral-supino-reto',
      nome: 'Supino Reto',
      grupo: 'Peitoral',
      descricao: 'Movimento base para peitoral maior com apoio de ombros e tríceps.',
      imagem: 'assets/exercicios/peitoral_supino-reto.gif',
      musculos: [
        { nome: 'Peitoral', papel: 'principal' },
        { nome: 'Tríceps', papel: 'secundario' },
        { nome: 'Ombros', papel: 'secundario' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'peitoral-supino-inclinado',
      nome: 'Supino Inclinado',
      grupo: 'Peitoral',
      descricao: 'Ênfase na porção superior do peitoral.',
      imagem: 'assets/exercicios/peitoral_supino-inclinado.gif',
      musculos: [
        { nome: 'Peitoral', papel: 'principal' },
        { nome: 'Ombros', papel: 'secundario' },
        { nome: 'Tríceps', papel: 'secundario' },
      ],
    },
    {
      id: 'peitoral-pec-deck',
      nome: 'Pec Deck',
      grupo: 'Peitoral',
      descricao: 'Isolamento do peitoral com alto controle de movimento.',
      imagem: 'assets/exercicios/peitoral_pec-deck.gif',
      musculos: [
        { nome: 'Peitoral', papel: 'principal' },
        { nome: 'Ombros', papel: 'estabilizador' },
      ],
    },
    {
      id: 'peitoral-crossover',
      nome: 'Crossover',
      grupo: 'Peitoral',
      descricao: 'Contração final do peitoral com polia.',
      imagem: 'assets/exercicios/peitoral_crossover.gif',
      musculos: [
        { nome: 'Peitoral', papel: 'principal' },
        { nome: 'Ombros', papel: 'estabilizador' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'costas-puxada-alta',
      nome: 'Puxada Alta',
      grupo: 'Costas',
      descricao: 'Foco em largura de dorsais.',
      imagem: 'assets/exercicios/costas_puxada-alta.gif',
      musculos: [
        { nome: 'Costas', papel: 'principal' },
        { nome: 'Bíceps', papel: 'secundario' },
        { nome: 'Antebraço', papel: 'secundario' },
      ],
    },
    {
      id: 'costas-remada-curvada',
      nome: 'Remada Curvada',
      grupo: 'Costas',
      descricao: 'Trabalho de espessura de costas com estabilização de tronco.',
      imagem: 'assets/exercicios/costas_remada-curvada.gif',
      musculos: [
        { nome: 'Costas', papel: 'principal' },
        { nome: 'Bíceps', papel: 'secundario' },
        { nome: 'Antebraço', papel: 'secundario' },
        { nome: 'Posteriores', papel: 'estabilizador' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'costas-remada-baixa',
      nome: 'Remada Baixa',
      grupo: 'Costas',
      descricao: 'Remada guiada para dorsais e romboides.',
      imagem: 'assets/exercicios/costas_remada-baixa.gif',
      musculos: [
        { nome: 'Costas', papel: 'principal' },
        { nome: 'Bíceps', papel: 'secundario' },
        { nome: 'Antebraço', papel: 'secundario' },
      ],
    },
    {
      id: 'costas-pull-down',
      nome: 'Pull Down',
      grupo: 'Costas',
      descricao: 'Isolamento de dorsais com braço quase estendido.',
      imagem: 'assets/exercicios/costas_pull-down.gif',
      musculos: [
        { nome: 'Costas', papel: 'principal' },
        { nome: 'Tríceps', papel: 'estabilizador' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'ombros-desenvolvimento',
      nome: 'Desenvolvimento',
      grupo: 'Ombros',
      descricao: 'Empurrada vertical para deltoides.',
      imagem: 'assets/exercicios/deltoides_desenvolvimento.gif',
      musculos: [
        { nome: 'Ombros', papel: 'principal' },
        { nome: 'Tríceps', papel: 'secundario' },
        { nome: 'Peitoral', papel: 'estabilizador' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'ombros-elevacao-lateral',
      nome: 'Elevação Lateral',
      grupo: 'Ombros',
      descricao: 'Isolamento do deltoide lateral.',
      imagem: 'assets/exercicios/deltoides_elevacao-lateral.gif',
      musculos: [
        { nome: 'Ombros', papel: 'principal' },
        { nome: 'Trapézio', papel: 'estabilizador' },
      ],
    },
    {
      id: 'ombros-crucifixo-invertido',
      nome: 'Crucifixo Invertido',
      grupo: 'Ombros',
      descricao: 'Ênfase no deltoide posterior.',
      imagem: 'assets/exercicios/deltoides_crucifixo-invertido.gif',
      musculos: [
        { nome: 'Ombros', papel: 'principal' },
        { nome: 'Costas', papel: 'secundario' },
      ],
    },
    {
      id: 'ombros-encolhimento',
      nome: 'Encolhimento',
      grupo: 'Ombros',
      descricao: 'Movimento para trapézio superior.',
      imagem: 'assets/exercicios/deltoides_encolhimento.gif',
      musculos: [
        { nome: 'Trapézio', papel: 'principal' },
        { nome: 'Antebraço', papel: 'estabilizador' },
      ],
    },
    {
      id: 'triceps-polia',
      nome: 'Tríceps na Polia',
      grupo: 'Tríceps',
      descricao: 'Extensão de cotovelo na polia.',
      imagem: 'assets/exercicios/triceps_polia.gif',
      musculos: [{ nome: 'Tríceps', papel: 'principal' }],
    },
    {
      id: 'triceps-testa',
      nome: 'Tríceps Testa',
      grupo: 'Tríceps',
      descricao: 'Ênfase na porção longa do tríceps.',
      imagem: 'assets/exercicios/triceps_testa.gif',
      musculos: [
        { nome: 'Tríceps', papel: 'principal' },
        { nome: 'Ombros', papel: 'estabilizador' },
      ],
    },
    {
      id: 'triceps-coice',
      nome: 'Tríceps Coice',
      grupo: 'Tríceps',
      descricao: 'Isolamento com pico de contração.',
      imagem: 'assets/exercicios/triceps_coice.gif',
      musculos: [
        { nome: 'Tríceps', papel: 'principal' },
        { nome: 'Ombros', papel: 'estabilizador' },
      ],
    },
    {
      id: 'triceps-mergulho',
      nome: 'Mergulho',
      grupo: 'Tríceps',
      descricao: 'Exercício composto para tríceps, peitoral e ombros.',
      imagem: 'assets/exercicios/triceps_mergulho.gif',
      musculos: [
        { nome: 'Tríceps', papel: 'principal' },
        { nome: 'Peitoral', papel: 'secundario' },
        { nome: 'Ombros', papel: 'secundario' },
      ],
    },
    {
      id: 'biceps-rosca-direta',
      nome: 'Rosca Direta',
      grupo: 'Bíceps',
      descricao: 'Movimento base para bíceps.',
      imagem: 'assets/exercicios/biceps_rosca-direta.gif',
      musculos: [
        { nome: 'Bíceps', papel: 'principal' },
        { nome: 'Antebraço', papel: 'estabilizador' },
      ],
    },
    {
      id: 'biceps-rosca-alternada',
      nome: 'Rosca Alternada',
      grupo: 'Bíceps',
      descricao: 'Trabalho unilateral com supinação.',
      imagem: 'assets/exercicios/biceps_rosca-alternada.gif',
      musculos: [
        { nome: 'Bíceps', papel: 'principal' },
        { nome: 'Antebraço', papel: 'estabilizador' },
      ],
    },
    {
      id: 'biceps-rosca-scott',
      nome: 'Rosca Scott',
      grupo: 'Bíceps',
      descricao: 'Isolamento do bíceps com menor roubo corporal.',
      imagem: 'assets/exercicios/biceps_rosca-scott.gif',
      musculos: [{ nome: 'Bíceps', papel: 'principal' }],
    },
    {
      id: 'biceps-rosca-martelo',
      nome: 'Rosca Martelo',
      grupo: 'Bíceps',
      descricao: 'Ênfase em braquial e antebraço.',
      imagem: 'assets/exercicios/biceps_rosca-martelo.gif',
      musculos: [
        { nome: 'Bíceps', papel: 'principal' },
        { nome: 'Antebraço', papel: 'secundario' },
      ],
    },
    {
      id: 'antebraco-rosca-inversa',
      nome: 'Rosca Inversa',
      grupo: 'Antebraço',
      descricao: 'Foco em braquiorradial e extensores.',
      imagem: 'assets/exercicios/antebraco_rosca-inversa.gif',
      musculos: [
        { nome: 'Antebraço', papel: 'principal' },
        { nome: 'Bíceps', papel: 'secundario' },
      ],
    },
    {
      id: 'antebraco-flexao-punho',
      nome: 'Flexão de Punho',
      grupo: 'Antebraço',
      descricao: 'Isolamento dos flexores do antebraço.',
      imagem: 'assets/exercicios/antebraco_flexao-punho.gif',
      musculos: [{ nome: 'Antebraço', papel: 'principal' }],
    },
    {
      id: 'antebraco-extensao-punho',
      nome: 'Extensão de Punho',
      grupo: 'Antebraço',
      descricao: 'Fortalecimento dos extensores do punho.',
      imagem: 'assets/exercicios/antebraco_extensao-punho.gif',
      musculos: [{ nome: 'Antebraço', papel: 'principal' }],
    },
    {
      id: 'antebraco-farmers-walk',
      nome: 'Farmer\'s Walk',
      grupo: 'Antebraço',
      descricao: 'Força de pegada com estabilização global.',
      imagem: 'assets/exercicios/antebraco_farmers-walk.gif',
      musculos: [
        { nome: 'Antebraço', papel: 'principal' },
        { nome: 'Costas', papel: 'estabilizador' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'quadriceps-agachamento-livre',
      nome: 'Agachamento Livre',
      grupo: 'Quadríceps',
      descricao: 'Exercício composto para membros inferiores.',
      imagem: 'assets/exercicios/quadriceps_agachamento-livre.gif',
      musculos: [
        { nome: 'Quadríceps', papel: 'principal' },
        { nome: 'Glúteos', papel: 'secundario' },
        { nome: 'Posteriores', papel: 'secundario' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'quadriceps-leg-press',
      nome: 'Leg Press',
      grupo: 'Quadríceps',
      descricao: 'Movimento guiado para força de pernas.',
      imagem: 'assets/exercicios/quadriceps_leg-press.gif',
      musculos: [
        { nome: 'Quadríceps', papel: 'principal' },
        { nome: 'Glúteos', papel: 'secundario' },
        { nome: 'Panturrilhas', papel: 'estabilizador' },
      ],
    },
    {
      id: 'quadriceps-cadeira-extensora',
      nome: 'Cadeira Extensora',
      grupo: 'Quadríceps',
      descricao: 'Isolamento do quadríceps.',
      imagem: 'assets/exercicios/quadriceps_cadeira-extensora.gif',
      musculos: [{ nome: 'Quadríceps', papel: 'principal' }],
    },
    {
      id: 'quadriceps-avanco',
      nome: 'Avanço',
      grupo: 'Quadríceps',
      descricao: 'Trabalho unilateral para pernas.',
      imagem: 'assets/exercicios/quadriceps_avanco.gif',
      musculos: [
        { nome: 'Quadríceps', papel: 'principal' },
        { nome: 'Glúteos', papel: 'secundario' },
        { nome: 'Posteriores', papel: 'secundario' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'posteriores-stiff',
      nome: 'Stiff',
      grupo: 'Posteriores',
      descricao: 'Extensão de quadril com foco em posteriores.',
      imagem: 'assets/exercicios/posteriores_stiff.gif',
      musculos: [
        { nome: 'Posteriores', papel: 'principal' },
        { nome: 'Glúteos', papel: 'secundario' },
        { nome: 'Costas', papel: 'estabilizador' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'posteriores-cadeira-flexora',
      nome: 'Cadeira Flexora',
      grupo: 'Posteriores',
      descricao: 'Isolamento direto dos isquiotibiais.',
      imagem: 'assets/exercicios/posteriores_cadeira-flexora.gif',
      musculos: [{ nome: 'Posteriores', papel: 'principal' }],
    },
    {
      id: 'posteriores-elevacao-pelvica',
      nome: 'Elevação Pélvica',
      grupo: 'Posteriores',
      descricao: 'Integra glúteos e posteriores.',
      imagem: 'assets/exercicios/posteriores_elevacao-pelvica.gif',
      musculos: [
        { nome: 'Glúteos', papel: 'principal' },
        { nome: 'Posteriores', papel: 'secundario' },
      ],
    },
    {
      id: 'posteriores-mesa-flexora',
      nome: 'Mesa Flexora',
      grupo: 'Posteriores',
      descricao: 'Flexão de joelho em posição deitada.',
      imagem: 'assets/exercicios/posteriores_mesa-flexora.gif',
      musculos: [{ nome: 'Posteriores', papel: 'principal' }],
    },
    {
      id: 'gluteos-agachamento-sumo',
      nome: 'Agachamento Sumô',
      grupo: 'Glúteos',
      descricao: 'Ênfase em glúteos e adutores.',
      imagem: 'assets/exercicios/gluteos_agachamento-sumo.gif',
      musculos: [
        { nome: 'Glúteos', papel: 'principal' },
        { nome: 'Quadríceps', papel: 'secundario' },
        { nome: 'Posteriores', papel: 'secundario' },
      ],
    },
    {
      id: 'gluteos-elevacao-pelvica-barra',
      nome: 'Elevação Pélvica com Barra',
      grupo: 'Glúteos',
      descricao: 'Foco no glúteo máximo.',
      imagem: 'assets/exercicios/gluteos_elevacao-pelvica-barra.gif',
      musculos: [
        { nome: 'Glúteos', papel: 'principal' },
        { nome: 'Posteriores', papel: 'secundario' },
      ],
    },
    {
      id: 'gluteos-cadeira-abdutora',
      nome: 'Cadeira Abdutora',
      grupo: 'Glúteos',
      descricao: 'Ênfase no glúteo médio.',
      imagem: 'assets/exercicios/gluteos_cadeira-abdutora.gif',
      musculos: [{ nome: 'Glúteos', papel: 'principal' }],
    },
    {
      id: 'gluteos-avanco-lateral',
      nome: 'Avanço Lateral',
      grupo: 'Glúteos',
      descricao: 'Trabalho lateral de quadril e glúteos.',
      imagem: 'assets/exercicios/gluteos_avanco-lateral.gif',
      musculos: [
        { nome: 'Glúteos', papel: 'principal' },
        { nome: 'Quadríceps', papel: 'secundario' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'panturrilhas-em-pe',
      nome: 'Panturrilha em Pé',
      grupo: 'Panturrilhas',
      descricao: 'Ênfase no gastrocnêmio.',
      imagem: 'assets/exercicios/panturrilhas_em-pe.gif',
      musculos: [{ nome: 'Panturrilhas', papel: 'principal' }],
    },
    {
      id: 'panturrilhas-sentado',
      nome: 'Panturrilha Sentado',
      grupo: 'Panturrilhas',
      descricao: 'Ênfase no sóleo.',
      imagem: 'assets/exercicios/panturrilhas_sentado.gif',
      musculos: [{ nome: 'Panturrilhas', papel: 'principal' }],
    },
    {
      id: 'panturrilhas-leg-press',
      nome: 'Panturrilha no Leg Press',
      grupo: 'Panturrilhas',
      descricao: 'Variação confortável para cargas altas.',
      imagem: 'assets/exercicios/panturrilhas_leg-press.gif',
      musculos: [
        { nome: 'Panturrilhas', papel: 'principal' },
        { nome: 'Quadríceps', papel: 'estabilizador' },
      ],
    },
    {
      id: 'panturrilhas-gemeos-unilateral',
      nome: 'Gêmeos Unilateral',
      grupo: 'Panturrilhas',
      descricao: 'Estímulo unilateral para panturrilhas.',
      imagem: 'assets/exercicios/panturrilhas_gemeos-unilateral.gif',
      musculos: [
        { nome: 'Panturrilhas', papel: 'principal' },
        { nome: 'Abdômen/Core', papel: 'estabilizador' },
      ],
    },
    {
      id: 'abdomen-elevacao-pernas',
      nome: 'Elevação de Pernas',
      grupo: 'Abdômen/Core',
      descricao: 'Ênfase na porção inferior do abdômen.',
      imagem: 'assets/exercicios/abdomen_elevacao-pernas.gif',
      musculos: [{ nome: 'Abdômen/Core', papel: 'principal' }],
    },
    {
      id: 'abdomen-supra',
      nome: 'Abdominal Supra',
      grupo: 'Abdômen/Core',
      descricao: 'Flexão de tronco para reto abdominal.',
      imagem: 'assets/exercicios/abdomen_supra.gif',
      musculos: [{ nome: 'Abdômen/Core', papel: 'principal' }],
    },
    {
      id: 'abdomen-prancha',
      nome: 'Prancha Isométrica',
      grupo: 'Abdômen/Core',
      descricao: 'Estabilização profunda do core.',
      imagem: 'assets/exercicios/abdomen_prancha.jpg',
      musculos: [
        { nome: 'Abdômen/Core', papel: 'principal' },
        { nome: 'Ombros', papel: 'estabilizador' },
        { nome: 'Glúteos', papel: 'estabilizador' },
      ],
    },
    {
      id: 'abdomen-russo',
      nome: 'Abdominal Russo',
      grupo: 'Abdômen/Core',
      descricao: 'Rotação de tronco com foco em oblíquos.',
      imagem: 'assets/exercicios/abdomen_russo.gif',
      musculos: [{ nome: 'Abdômen/Core', papel: 'principal' }],
    },
  ];
  private atualizarTela(): void {
    this.cdr.detectChanges();
  }

      ngOnInit(): void {
    for (const exercicio of this.exercicios) {
      this.volumes[exercicio.id] = { series: 3, repeticoes: 10 };
    }
  }

  private async carregarTreinosDoFirebase(uid: string): Promise<void> {
    this.carregandoTreinos = true;

    try {
      this.treinosSalvos = await this.treinoService.buscarTreinos(uid);
    } catch (erro) {
      console.error('Erro ao carregar treinos do Firebase:', erro);
      this.mensagem = 'Não foi possível carregar os treinos salvos no Firebase.';
    } finally {
      this.carregandoTreinos = false;
      this.atualizarTela();
    }
  }

  get exerciciosFiltrados(): ExercicioCatalogo[] {
    const termo = this.normalizar(this.busca);

    return this.exercicios.filter((exercicio) => {
      const bateGrupo =
        this.grupoSelecionado === 'Todos' ||
        exercicio.grupo === this.grupoSelecionado;

      const bateBusca =
        !termo ||
        this.normalizar(exercicio.nome).includes(termo) ||
        this.normalizar(exercicio.descricao).includes(termo) ||
        this.normalizar(exercicio.grupo).includes(termo);

      return bateGrupo && bateBusca;
    });
  }

  get exerciciosSelecionados(): ExercicioCatalogo[] {
    return this.exercicios.filter((exercicio) =>
      this.selecionados.has(exercicio.id)
    );
  }

  get analise(): AnaliseMuscular[] {
    const mapa = new Map<
      string,
      {
        score: number;
        exercicios: string[];
        papeis: PapelMuscular[];
        primarios: number;
      }
    >();

    for (const exercicio of this.exerciciosSelecionados) {
      const volume = this.volumes[exercicio.id] ?? {
        series: 3,
        repeticoes: 10,
      };

      const fatorVolume = Math.max(
        0.5,
        (Number(volume.series) * Number(volume.repeticoes)) / 30
      );

      for (const musculo of exercicio.musculos) {
        const pesoBase = this.pesoPorPapel(musculo.papel);
        const score = pesoBase * fatorVolume;

        const atual = mapa.get(musculo.nome) ?? {
          score: 0,
          exercicios: [],
          papeis: [],
          primarios: 0,
        };

        atual.score += score;
        atual.exercicios.push(exercicio.nome);
        atual.papeis.push(musculo.papel);

        if (musculo.papel === 'principal') {
          atual.primarios += 1;
        }

        mapa.set(musculo.nome, atual);
      }
    }

    return Array.from(mapa.entries())
      .map(([musculo, dados]) => ({
        musculo,
        score: Number(dados.score.toFixed(1)),
        nivel: this.nivelPorScore(dados.score),
        exercicios: Array.from(new Set(dados.exercicios)),
        papeis: dados.papeis,
        sobrecarga: dados.score >= 8 || dados.primarios >= 3,
      }))
      .sort((a, b) => b.score - a.score || a.musculo.localeCompare(b.musculo));
  }

  get possuiSobrecarga(): boolean {
    return this.analise.some((item) => item.sobrecarga);
  }

  get sobrecargas(): AnaliseMuscular[] {
    return this.analise.filter((item) => item.sobrecarga);
  }

  get musculosMaisTrabalhados(): AnaliseMuscular[] {
    return this.analise.slice(0, 3);
  }

  get musculosMenosTrabalhados(): AnaliseMuscular[] {
    return [...this.analise]
      .filter((item) => item.score > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }

  selecionarGrupo(grupo: string): void {
    this.grupoSelecionado = grupo;
  }

  alternarExercicio(exercicio: ExercicioCatalogo): void {
    if (this.selecionados.has(exercicio.id)) {
      this.selecionados.delete(exercicio.id);
    } else {
      this.selecionados.add(exercicio.id);
    }

    this.mostrarResumoFinal = false;
    this.mensagem = '';
  }

  estaSelecionado(exercicio: ExercicioCatalogo): boolean {
    return this.selecionados.has(exercicio.id);
  }

  removerExercicio(id: string): void {
    this.selecionados.delete(id);
    this.mostrarResumoFinal = false;
  }

  limparTreino(): void {
    this.selecionados.clear();
    this.mostrarResumoFinal = false;
    this.mensagem = '';
  }

  finalizarAnalise(): void {
    if (this.selecionados.size < 2) {
      this.mensagem =
        'Selecione pelo menos dois exercícios para compor um treino e gerar a análise do Processo 2.';
      this.mostrarResumoFinal = false;
      return;
    }

    this.mensagem = '';
    this.mostrarResumoFinal = true;
  }

  async salvarTreino(): Promise<void> {
    this.finalizarAnalise();

    if (!this.mostrarResumoFinal || !this.nomeTreino.trim()) {
      if (!this.nomeTreino.trim()) {
        this.mensagem = 'Informe um nome para salvar o treino.';
      }
      return;
    }

    const usuario = this.authService.currentUser();

    if (!usuario) {
      this.mensagem = 'Faça login para salvar o treino na sua conta.';
      return;
    }

    const treino: Omit<Treino, 'id'> = {
      uid: usuario.uid,
      nome: this.nomeTreino.trim(),
      criadoEm: Timestamp.now(),
      exercicios: this.exerciciosSelecionados.map((exercicio) => ({
        id: exercicio.id,
        nome: exercicio.nome,
        grupo: exercicio.grupo,
        series: Number(this.volumes[exercicio.id].series),
        repeticoes: Number(this.volumes[exercicio.id].repeticoes),
      })),
      analise: this.analise.map((item) => ({
        musculo: item.musculo,
        score: item.score,
        nivel: item.nivel,
        exercicios: item.exercicios,
        papeis: item.papeis,
        sobrecarga: item.sobrecarga,
      })),
      possuiAlerta: this.possuiSobrecarga,
    };

    this.salvandoTreino = true;

    try {
      const id = await this.treinoService.salvarTreino(treino);

      this.treinosSalvos = [
        {
          id,
          ...treino,
        },
        ...this.treinosSalvos,
      ];

      this.mensagem = 'Treino salvo no Firebase com sucesso.';
    } catch (erro) {
      console.error('Erro ao salvar treino no Firebase:', erro);
      this.mensagem = 'Erro ao salvar o treino no Firebase.';
    } finally {
      this.salvandoTreino = false;
      this.atualizarTela();
    }
  }

  async excluirTreino(id: string | undefined): Promise<void> {
    if (!id) {
      return;
    }

    try {
      await this.treinoService.deletarTreino(id);

      this.treinosSalvos = this.treinosSalvos.filter(
        (treino) => treino.id !== id
      );

      this.mensagem = 'Treino excluído do Firebase.';
    } catch (erro) {
      console.error('Erro ao excluir treino do Firebase:', erro);
      this.mensagem = 'Erro ao excluir o treino do Firebase.';
    } finally {
      this.atualizarTela();
    }
  }

  percentual(score: number): number {
    const maior = Math.max(...this.analise.map((item) => item.score), 1);
    return Math.min(100, Math.round((score / maior) * 100));
  }

  rotuloPapel(papel: PapelMuscular): string {
    const mapa: Record<PapelMuscular, string> = {
      principal: 'Principal',
      secundario: 'Secundário',
      estabilizador: 'Estabilizador',
    };

    return mapa[papel];
  }

  formatarData(data: string | Timestamp): string {
    const dataConvertida =
      typeof data === 'string' ? new Date(data) : data.toDate();

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dataConvertida);
  }

  private pesoPorPapel(papel: PapelMuscular): number {
    const pesos: Record<PapelMuscular, number> = {
      principal: 3,
      secundario: 2,
      estabilizador: 1,
    };

    return pesos[papel];
  }

  private nivelPorScore(score: number): NivelIntensidade {
    if (score >= 7) {
      return 'alta';
    }

    if (score >= 3) {
      return 'média';
    }

    return 'baixa';
  }

  private normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

