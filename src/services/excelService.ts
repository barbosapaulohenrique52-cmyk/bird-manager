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

/**
 * Converte uma ave do sistema para o formato utilizado na planilha.
 *
 * O campo anilha é convertido explicitamente para texto,
 * preservando zeros à esquerda e eventuais letras ou hífens.
 */
export function aveParaLinhaPlanilha(
  ave: Ave
): AvePlanilha {
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
 * Gera e baixa uma planilha Excel com os registros das aves.
 *
 * A primeira linha contém os títulos das colunas.
 * A coluna de anilha é configurada como texto para evitar
 * a perda de zeros à esquerda.
 */
export function gerarPlanilhaAves(
  aves: Ave[] = [],
  config?: Config
): void {
  const linhas: AvePlanilha[] =
    aves.length > 0
      ? aves.map(aveParaLinhaPlanilha)
      : [criarLinhaModeloAve()];

  const dados = linhas.map(linha => ({
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

  const worksheet =
    XLSX.utils.json_to_sheet(dados, {
      skipHeader: false
    });

  /*
   * Configura as colunas de texto.
   *
   * A coluna B corresponde à Anilha.
   * A coluna A corresponde à Espécie.
   *
   * O formato '@' orienta o Excel a tratar o conteúdo
   * como texto, evitando a conversão automática de valores.
   */
  const quantidadeLinhas = Math.max(dados.length + 1, 2);

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

  for (let linha = 2; linha <= quantidadeLinhas; linha += 1) {
    const celulaAnilha = `B${linha}`;
    const celulaAnoAnilha = `C${linha}`;
    const celulaAnoAquisicao = `H${linha}`;

    if (worksheet[celulaAnilha]) {
      worksheet[celulaAnilha].t = 's';
      worksheet[celulaAnilha].z = '@';
    }

    if (worksheet[celulaAnoAnilha]) {
      worksheet[celulaAnoAnilha].t = 's';
      worksheet[celulaAnoAnilha].z = '@';
    }

    if (worksheet[celulaAnoAquisicao]) {
      worksheet[celulaAnoAquisicao].t = 's';
      worksheet[celulaAnoAquisicao].z = '@';
    }
  }

  /*
   * Mantém a configuração disponível para a próxima etapa,
   * quando serão incluídas listas suspensas no Excel.
   *
   * Neste momento, não modificamos o conteúdo da configuração.
   */
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