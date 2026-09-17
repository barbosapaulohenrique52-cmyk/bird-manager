import ExcelJS from 'exceljs';
import type { Ave, Config } from '../app/App';

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
  'Porta',
];

interface LinhaPlanilhaAve {
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

interface ListasPlanilha {
  especies: string[];
  sexos: string[];
  status: string[];
  coresCabeca: string[];
  coresPeito: string[];
  coresDorso: string[];
  portas: string[];
}

function valorTexto(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return '';
  }

  return String(valor);
}

function aveParaLinhaPlanilha(ave: Ave): LinhaPlanilhaAve {
  return {
    especie: valorTexto(ave.species),
    anilha: valorTexto(ave.ring),
    anoAnilha: valorTexto(ave.ringYear),
    nome: valorTexto(ave.name),
    sexo: valorTexto(ave.sex),
    status: valorTexto(ave.status),
    criador: valorTexto(ave.creator),
    anoAquisicao: valorTexto(ave.acqYear),
    corCabeca: valorTexto(ave.corCabeca),
    corPeito: valorTexto(ave.corPeito),
    corDorso: valorTexto(ave.corDorso),
    nota: valorTexto(ave.nota),
    porta: valorTexto(ave.porta),
  };
}

function criarLinhaModeloAve(): LinhaPlanilhaAve {
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
    porta: '',
  };
}

function obterListaUnica(valores: unknown[]): string[] {
  const valoresTexto = valores
    .map((valor) => valorTexto(valor).trim())
    .filter((valor) => valor.length > 0);

  return [...new Set(valoresTexto)].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );
}

function obterNomesCores(
  cores: Array<{ nome: string }> | undefined,
): string[] {
  return obterListaUnica((cores ?? []).map((cor) => cor.nome));
}

function obterListas(config?: Config): ListasPlanilha {
  const especies = obterListaUnica(config?.especies ?? []);

  const sexos = ['Macho', 'Fêmea', 'Indefinido'];

  const status = ['Ativo', 'Vendido', 'Óbito', 'No Ninho'];

  // Cada parte utiliza exclusivamente sua própria lista de cores.
  // Não utilizamos coresAves como fallback, pois isso mistura cores
  // que podem ser válidas para uma região, mas não para outra.
  const coresCabeca = obterNomesCores(config?.coresCabeca);
  const coresPeito = obterNomesCores(config?.coresPeito);
  const coresDorso = obterNomesCores(config?.coresDorso);

  // A interface Config atual não possui uma lista de portas.
  // A coluna Porta permanece disponível para digitação manual.
  const portas: string[] = [];

  return {
    especies,
    sexos,
    status,
    coresCabeca,
    coresPeito,
    coresDorso,
    portas,
  };
}

function configurarCabecalho(worksheet: ExcelJS.Worksheet): void {
  const linhaCabecalho = worksheet.getRow(1);

  linhaCabecalho.height = 30;

  linhaCabecalho.eachCell((celula) => {
    celula.font = {
      bold: true,
      color: {
        argb: 'FFFFFFFF',
      },
    };

    celula.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'FF1F4E78',
      },
    };

    celula.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };

    celula.border = {
      top: {
        style: 'thin',
        color: {
          argb: 'FFD9E2F3',
        },
      },
      bottom: {
        style: 'thin',
        color: {
          argb: 'FFD9E2F3',
        },
      },
      left: {
        style: 'thin',
        color: {
          argb: 'FFD9E2F3',
        },
      },
      right: {
        style: 'thin',
        color: {
          argb: 'FFD9E2F3',
        },
      },
    };
  });
}

function configurarLarguraColunas(worksheet: ExcelJS.Worksheet): void {
  const larguras = [
    20, // Espécie
    16, // Anilha
    17, // Ano da anilha
    20, // Nome
    14, // Sexo
    16, // Status
    22, // Criador
    18, // Ano de aquisição
    20, // Cor da cabeça
    20, // Cor do peito
    20, // Cor do dorso
    35, // Nota
    14, // Porta
  ];

  worksheet.columns.forEach((coluna, indice) => {
    coluna.width = larguras[indice] ?? 18;
  });
}

function configurarColunasTexto(worksheet: ExcelJS.Worksheet): void {
  worksheet.getColumn(2).numFmt = '@';
  worksheet.getColumn(3).numFmt = '@';
  worksheet.getColumn(8).numFmt = '@';
}

function prepararPlanilhaAves(
  worksheet: ExcelJS.Worksheet,
  linhas: LinhaPlanilhaAve[],
): void {
  worksheet.columns = CABECALHOS_INGRESSO.map((header) => ({
    header,
    key: header,
  }));

  linhas.forEach((linha) => {
    worksheet.addRow([
      linha.especie,
      linha.anilha,
      linha.anoAnilha,
      linha.nome,
      linha.sexo,
      linha.status,
      linha.criador,
      linha.anoAquisicao,
      linha.corCabeca,
      linha.corPeito,
      linha.corDorso,
      linha.nota,
      linha.porta,
    ]);
  });

  configurarCabecalho(worksheet);
  configurarLarguraColunas(worksheet);
  configurarColunasTexto(worksheet);

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  worksheet.autoFilter = {
    from: 'A1',
    to: 'M1',
  };

  worksheet.eachRow((linha, numeroLinha) => {
    if (numeroLinha === 1) {
      return;
    }

    linha.height = 22;

    linha.eachCell((celula) => {
      celula.alignment = {
        vertical: 'middle',
        wrapText: true,
      };
    });
  });
}

function criarAbaListas(
  workbook: ExcelJS.Workbook,
  listas: ListasPlanilha,
): void {
  const worksheet = workbook.addWorksheet('Listas');

  worksheet.getCell('A1').value = 'Espécies';
  worksheet.getCell('B1').value = 'Sexos';
  worksheet.getCell('C1').value = 'Status';
  worksheet.getCell('D1').value = 'Cor da cabeça';
  worksheet.getCell('E1').value = 'Cor do peito';
  worksheet.getCell('F1').value = 'Cor do dorso';
  worksheet.getCell('G1').value = 'Portas';

  const maiorQuantidade = Math.max(
    listas.especies.length,
    listas.sexos.length,
    listas.status.length,
    listas.coresCabeca.length,
    listas.coresPeito.length,
    listas.coresDorso.length,
    listas.portas.length,
    1,
  );

  for (let indice = 0; indice < maiorQuantidade; indice += 1) {
    const linha = indice + 2;

    worksheet.getCell(`A${linha}`).value = listas.especies[indice] ?? '';
    worksheet.getCell(`B${linha}`).value = listas.sexos[indice] ?? '';
    worksheet.getCell(`C${linha}`).value = listas.status[indice] ?? '';
    worksheet.getCell(`D${linha}`).value = listas.coresCabeca[indice] ?? '';
    worksheet.getCell(`E${linha}`).value = listas.coresPeito[indice] ?? '';
    worksheet.getCell(`F${linha}`).value = listas.coresDorso[indice] ?? '';
    worksheet.getCell(`G${linha}`).value = listas.portas[indice] ?? '';
  }

  worksheet.columns = [
    { width: 25 },
    { width: 18 },
    { width: 20 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 18 },
  ];

  worksheet.getRow(1).height = 25;

  worksheet.getRow(1).eachCell((celula) => {
    celula.font = {
      bold: true,
      color: {
        argb: 'FFFFFFFF',
      },
    };

    celula.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'FF548235',
      },
    };

    celula.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
  });

  // Mantida visível nesta etapa para permitir a conferência das listas.
  worksheet.state = 'visible';
}

function aplicarValidacaoLista(
  worksheet: ExcelJS.Worksheet,
  coluna: string,
  linhaInicial: number,
  linhaFinal: number,
  colunaLista: string,
  quantidadeItens: number,
): void {
  // O intervalo sempre terá pelo menos a célula 2, evitando referência
  // inválida quando determinada lista estiver vazia.
  const ultimaLinha = Math.max(quantidadeItens + 1, 2);
  const referenciaLista = `'Listas'!$${colunaLista}$2:$${colunaLista}$${ultimaLinha}`;

  for (let linha = linhaInicial; linha <= linhaFinal; linha += 1) {
    worksheet.getCell(`${coluna}${linha}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [referenciaLista],
      // Permite selecionar uma opção ou digitar livremente outro valor.
      showErrorMessage: false,
      promptTitle: 'Lista de opções',
      prompt: 'Escolha uma opção ou digite um novo valor.',
      showInputMessage: true,
    };
  }
}

function baixarArquivoExcel(
  buffer: ArrayBuffer | Uint8Array,
  nomeArquivo: string,
): void {
  const bytes =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  const arrayBufferView = new Uint8Array(arrayBuffer);

  arrayBufferView.set(bytes);

  const blob = new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = nomeArquivo;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

export async function gerarPlanilhaAves(
  aves: Ave[] = [],
  _config?: Config,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Bird Manager';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Aves');
  const linhas = aves.map(aveParaLinhaPlanilha);

  prepararPlanilhaAves(worksheet, linhas);

  const buffer = await workbook.xlsx.writeBuffer();

  baixarArquivoExcel(buffer, 'plantel_aves.xlsx');
}

export async function gerarPlanilhaModeloAves(
  config?: Config,
  quantidadeLinhas = 200,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Bird Manager';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheetAves = workbook.addWorksheet('Aves');
  const listas = obterListas(config);

  const linhasModelo = Array.from(
    { length: quantidadeLinhas },
    () => criarLinhaModeloAve(),
  );

  prepararPlanilhaAves(worksheetAves, linhasModelo);
  criarAbaListas(workbook, listas);

  const linhaInicial = 2;
  const linhaFinal = quantidadeLinhas + 1;

  // Espécie: coluna A da planilha principal, lista A da aba Listas.
  aplicarValidacaoLista(
    worksheetAves,
    'A',
    linhaInicial,
    linhaFinal,
    'A',
    listas.especies.length,
  );

  // Sexo: coluna E da planilha principal, lista B da aba Listas.
  aplicarValidacaoLista(
    worksheetAves,
    'E',
    linhaInicial,
    linhaFinal,
    'B',
    listas.sexos.length,
  );

  // Status: coluna F da planilha principal, lista C da aba Listas.
  aplicarValidacaoLista(
    worksheetAves,
    'F',
    linhaInicial,
    linhaFinal,
    'C',
    listas.status.length,
  );

  // Cor da cabeça: coluna I da planilha principal, lista D da aba Listas.
  aplicarValidacaoLista(
    worksheetAves,
    'I',
    linhaInicial,
    linhaFinal,
    'D',
    listas.coresCabeca.length,
  );

  // Cor do peito: coluna J da planilha principal, lista E da aba Listas.
  aplicarValidacaoLista(
    worksheetAves,
    'J',
    linhaInicial,
    linhaFinal,
    'E',
    listas.coresPeito.length,
  );

  // Cor do dorso: coluna K da planilha principal, lista F da aba Listas.
  aplicarValidacaoLista(
    worksheetAves,
    'K',
    linhaInicial,
    linhaFinal,
    'F',
    listas.coresDorso.length,
  );

  const buffer = await workbook.xlsx.writeBuffer();

  baixarArquivoExcel(buffer, 'modelo_plantel_aves.xlsx');
}
