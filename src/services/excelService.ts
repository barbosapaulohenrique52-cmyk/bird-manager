import * as XLSX from 'xlsx';
import type { Ave, Config } from '../app/App';

export interface AvePlanilha {
  especie: string;
  anilha: string;
  anoAnilha: string;
  nome: string;
  sexo: string;
  status: string;
  criador: string;
  anoAquisicao: string;
  corCabeca: string;
  corPeito: string;
  corDorso: string;
  nota: string;
  porta: string;
}

const CABECALHOS_INGRESSO = [
  'Espécie',
  'Anilha',
  'Ano da anilha',
  'Nome',
  'Sexo',
  'Status',
  'Criador',
  'Ano de aquisição',
  'Cor da cabeça',
  'Cor do peito',
  'Cor do dorso',
  'Nota',
  'Porta'
];

/**
 * Converte uma ave do sistema para o formato utilizado na planilha.
 */
export function aveParaLinhaPlanilha(ave: Ave): AvePlanilha {
  return {
    especie: ave.species ?? '',
    anilha: String(ave.ring ?? ''),
    anoAnilha: String(ave.ringYear ?? ''),
    nome: ave.name ?? '',
    sexo: ave.sex ?? '',
    status: ave.status ?? '',
    criador: ave.creator ?? '',
    anoAquisicao: String(ave.acqYear ?? ''),
    corCabeca: ave.corCabeca ?? '',
    corPeito: ave.corPeito ?? '',
    corDorso: ave.corDorso ?? '',
    nota: ave.nota ?? '',
    porta: ave.porta ?? ''
  };
}

/**
 * Cria uma linha vazia para servir como modelo de preenchimento.
 */
export function criarLinhaModeloAve(): AvePlanilha {
  return {
    especie: '',
    anilha: '',
    anoAnilha: '',
    nome: '',
    sexo: '',
    status: '',
    criador: '',
    anoAquisicao: '',
    corCabeca: '',
    corPeito: '',
    corDorso: '',
    nota: '',
    porta: ''
  };
}

/**
 * Gera o relatório preenchido com as aves cadastradas.
 *
 * Esta função permanece destinada ao relatório do plantel.
 */
export function gerarPlanilhaAves(
  aves: Ave[] = [],
  config?: Config
): void {
  const linhas: AvePlanilha[] =
    aves.length > 0
      ? aves.map(aveParaLinhaPlanilha)
      : [criarLinhaModeloAve()];

  const dados = linhas.map((linha) => ({
    'Espécie': linha.especie,
    'Anilha': linha.anilha,
    'Ano da anilha': linha.anoAnilha,
    'Nome': linha.nome,
    'Sexo': linha.sexo,
    'Status': linha.status,
    'Criador': linha.criador,
    'Ano de aquisição': linha.anoAquisicao,
    'Cor da cabeça': linha.corCabeca,
    'Cor do peito': linha.corPeito,
    'Cor do dorso': linha.corDorso,
    'Nota': linha.nota,
    'Porta': linha.porta
  }));

  const worksheet = XLSX.utils.json_to_sheet(dados, {
    skipHeader: false
  });

  configurarLarguraColunas(worksheet);

  const quantidadeLinhas = Math.max(dados.length + 1, 2);

  for (let linha = 2; linha <= quantidadeLinhas; linha += 1) {
    configurarCelulaComoTexto(worksheet, `B${linha}`);
    configurarCelulaComoTexto(worksheet, `C${linha}`);
    configurarCelulaComoTexto(worksheet, `H${linha}`);
  }

  void config;

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Aves'
  );

  XLSX.writeFile(
    workbook,
    'plantel_aves.xlsx'
  );
}

/**
 * Gera uma planilha modelo vazia para posterior importação.
 *
 * A planilha contém:
 * - uma aba Aves com linhas vazias;
 * - uma aba Listas com os valores cadastrados;
 * - listas suspensas para espécies, sexo, status e cores;
 * - campos de anilha e anos configurados como texto.
 */
export function gerarPlanilhaModeloAves(
  config?: Config,
  quantidadeLinhas = 200
): void {
  const especies = obterListaUnica(
    config?.especies || []
  );

  const sexos = [
    'Macho',
    'Fêmea',
    'Indefinido'
  ];

  const status = [
    'Ativo',
    'No Ninho',
    'Vendido',
    'Óbito'
  ];

  const coresCabeca = obterNomesDasCores(
    config?.coresCabeca
  );

  const coresPeito = obterNomesDasCores(
    config?.coresPeito
  );

  const coresDorso = obterNomesDasCores(
    config?.coresDorso
  );

  const linhasVazias = Array.from(
    { length: quantidadeLinhas },
    () => criarLinhaModeloAve()
  );

  const dadosAves = linhasVazias.map((linha) => ({
    'Espécie': linha.especie,
    'Anilha': linha.anilha,
    'Ano da anilha': linha.anoAnilha,
    'Nome': linha.nome,
    'Sexo': linha.sexo,
    'Status': linha.status,
    'Criador': linha.criador,
    'Ano de aquisição': linha.anoAquisicao,
    'Cor da cabeça': linha.corCabeca,
    'Cor do peito': linha.corPeito,
    'Cor do dorso': linha.corDorso,
    'Nota': linha.nota,
    'Porta': linha.porta
  }));

  const worksheetAves = XLSX.utils.json_to_sheet(
    dadosAves,
    {
      header: CABECALHOS_INGRESSO,
      skipHeader: false
    }
  );

  configurarLarguraColunas(worksheetAves);

  /*
   * A primeira linha é o cabeçalho.
   * As linhas 2 até quantidadeLinhas + 1 ficam disponíveis
   * para preenchimento pelo usuário.
   */
  const primeiraLinhaDados = 2;
  const ultimaLinhaDados = quantidadeLinhas + 1;

  for (
    let linha = primeiraLinhaDados;
    linha <= ultimaLinhaDados;
    linha += 1
  ) {
    configurarCelulaComoTexto(
      worksheetAves,
      `B${linha}`
    );

    configurarCelulaComoTexto(
      worksheetAves,
      `C${linha}`
    );

    configurarCelulaComoTexto(
      worksheetAves,
      `H${linha}`
    );
  }

  const worksheetListas = criarAbaListas({
    especies,
    sexos,
    status,
    coresCabeca,
    coresPeito,
    coresDorso
  });

  /*
   * O pacote xlsx utiliza a estrutura !dataValidation
   * para representar as validações de dados da planilha.
   *
   * As referências apontam para a aba Listas, evitando
   * deixar os valores das listas diretamente nas células.
   */
  worksheetAves['!dataValidation'] = [
    criarValidacaoLista(
      `A${primeiraLinhaDados}:A${ultimaLinhaDados}`,
      `=Listas!$A$2:$A$${Math.max(especies.length + 1, 2)}`
    ),
    criarValidacaoLista(
      `E${primeiraLinhaDados}:E${ultimaLinhaDados}`,
      `=Listas!$B$2:$B$${Math.max(sexos.length + 1, 2)}`
    ),
    criarValidacaoLista(
      `F${primeiraLinhaDados}:F${ultimaLinhaDados}`,
      `=Listas!$C$2:$C$${Math.max(status.length + 1, 2)}`
    ),
    criarValidacaoLista(
      `I${primeiraLinhaDados}:I${ultimaLinhaDados}`,
      `=Listas!$D$2:$D$${Math.max(coresCabeca.length + 1, 2)}`
    ),
    criarValidacaoLista(
      `J${primeiraLinhaDados}:J${ultimaLinhaDados}`,
      `=Listas!$E$2:$E$${Math.max(coresPeito.length + 1, 2)}`
    ),
    criarValidacaoLista(
      `K${primeiraLinhaDados}:K${ultimaLinhaDados}`,
      `=Listas!$F$2:$F$${Math.max(coresDorso.length + 1, 2)}`
    )
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheetAves,
    'Aves'
  );

  XLSX.utils.book_append_sheet(
    workbook,
    worksheetListas,
    'Listas'
  );

  XLSX.writeFile(
    workbook,
    'modelo_importacao_aves.xlsx'
  );
}

function configurarLarguraColunas(
  worksheet: XLSX.WorkSheet
): void {
  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 24 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 36 },
    { wch: 14 }
  ];
}

function configurarCelulaComoTexto(
  worksheet: XLSX.WorkSheet,
  referencia: string
): void {
  if (!worksheet[referencia]) {
    worksheet[referencia] = {
      t: 's',
      v: '',
      z: '@'
    };

    return;
  }

  worksheet[referencia].t = 's';
  worksheet[referencia].z = '@';
}

function obterListaUnica(
  valores: string[]
): string[] {
  return Array.from(
    new Set(
      valores
        .map((valor) => String(valor ?? '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}

function obterNomesDasCores(
  cores:
    | Array<{ nome: string }>
    | undefined
): string[] {
  return obterListaUnica(
    (cores || []).map((cor) => cor.nome)
  );
}

function criarAbaListas(
  listas: {
    especies: string[];
    sexos: string[];
    status: string[];
    coresCabeca: string[];
    coresPeito: string[];
    coresDorso: string[];
  }
): XLSX.WorkSheet {
  const maiorQuantidade = Math.max(
    listas.especies.length,
    listas.sexos.length,
    listas.status.length,
    listas.coresCabeca.length,
    listas.coresPeito.length,
    listas.coresDorso.length,
    1
  );

  const dados: string[][] = [
    [
      'Espécies',
      'Sexos',
      'Status',
      'Cores da cabeça',
      'Cores do peito',
      'Cores do dorso'
    ]
  ];

  for (let indice = 0; indice < maiorQuantidade; indice += 1) {
    dados.push([
      listas.especies[indice] || '',
      listas.sexos[indice] || '',
      listas.status[indice] || '',
      listas.coresCabeca[indice] || '',
      listas.coresPeito[indice] || '',
      listas.coresDorso[indice] || ''
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(dados);

  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 }
  ];

  return worksheet;
}

function criarValidacaoLista(
  sqref: string,
  formula1: string
): {
  sqref: string;
  type: string;
  operator: string;
  allowBlank: boolean;
  showInputMessage: boolean;
  showErrorMessage: boolean;
  errorTitle: string;
  error: string;
  promptTitle: string;
  prompt: string;
  formula1: string;
} {
  return {
    sqref,
    type: 'list',
    operator: 'equal',
    allowBlank: true,
    showInputMessage: true,
    showErrorMessage: true,
    errorTitle: 'Valor inválido',
    error: 'Selecione um valor disponível na lista.',
    promptTitle: 'Selecione uma opção',
    prompt: 'Utilize a lista suspensa para escolher um valor.',
    formula1
  };
}