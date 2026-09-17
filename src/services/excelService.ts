import ExcelJS from "exceljs";
import type { Ave, Casal, Config, Ninho } from "../app/App";

export interface ExcelReferenceData {
  aves: Ave[];
  casais: Casal[];
  ninhos: Ninho[];
  config: Config;
}

export interface AveImportada {
  id?: string;
  species?: string;
  ring?: string;
  ringYear?: number;
  name?: string;
  sex?: Ave["sex"];
  status?: Ave["status"];
  creator?: string;
  acqYear?: number;
  photo?: string;
  parentMaleId?: string;
  parentFemaleId?: string;
  birthDate?: string;
  birthNestId?: string;
  criadoPorAmas?: boolean;
  casalAmasId?: string;
  corCabeca?: string;
  corPeito?: string;
  corDorso?: string;
  nota?: string;
  porta?: string;
}

const CABECALHOS = [
  "id",
  "especie",
  "anilha",
  "ano_anilha",
  "nome",
  "sexo",
  "status",
  "criador",
  "ano_aquisicao",
  "foto",
  "pai",
  "mae",
  "data_nascimento",
  "ninho_nascimento",
  "criado_por_amas",
  "casal_amas",
  "cor_cabeca",
  "cor_peito",
  "cor_dorso",
  "nota",
  "porta",
] as const;

function textoLista(valor: unknown): string {
  return String(valor ?? "").trim();
}

function valoresUnicos(valores: unknown[]): string[] {
  return [
    ...new Set(
      valores
        .map((valor) => textoLista(valor))
        .filter((valor) => valor.length > 0),
    ),
  ];
}

function nomesAves(aves: Ave[]): string[] {
  return valoresUnicos(
    aves.map((ave) => ave.ring || ave.name || ave.id || ""),
  );
}

function descricaoCasal(casal: Casal, aves: Ave[]): string {
  const macho = aves.find((ave) => ave.id === casal.mId);
  const femea = aves.find((ave) => ave.id === casal.fId);

  const nomeMacho = macho?.name || macho?.ring || casal.mId;
  const nomeFemea = femea?.name || femea?.ring || casal.fId;

  return `${nomeMacho} x ${nomeFemea}`;
}

function nomesCasais(casais: Casal[], aves: Ave[]): string[] {
  return valoresUnicos(
    casais.map((casal) => descricaoCasal(casal, aves)),
  );
}

function nomesNinhos(ninhos: Ninho[]): string[] {
  return valoresUnicos(
    ninhos.map((ninho) => ninho.name || ninho.id || ""),
  );
}

function nomesCores(cores?: { nome: string }[]): string[] {
  return valoresUnicos((cores || []).map((cor) => cor.nome));
}

function aplicarEstiloCabecalho(row: ExcelJS.Row): void {
  row.font = {
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" },
  };

  row.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  row.height = 30;
}

function aplicarBordas(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.border = {
      top: {
        style: "thin",
        color: { argb: "FFE2E8F0" },
      },
      left: {
        style: "thin",
        color: { argb: "FFE2E8F0" },
      },
      bottom: {
        style: "thin",
        color: { argb: "FFE2E8F0" },
      },
      right: {
        style: "thin",
        color: { argb: "FFE2E8F0" },
      },
    };

    cell.alignment = {
      vertical: "top",
      wrapText: true,
    };
  });
}

/**
 * Define as células como texto.
 *
 * Isso é essencial para preservar identificações como:
 * 072, 001, 0008 etc.
 *
 * A anilha, o pai e a mãe não devem ser tratados como números.
 */
function aplicarFormatoTexto(
  worksheet: ExcelJS.Worksheet,
  colunas: string[],
  primeiraLinha: number,
  ultimaLinha: number,
): void {
  colunas.forEach((coluna) => {
    for (
      let linha = primeiraLinha;
      linha <= ultimaLinha;
      linha += 1
    ) {
      const cell = worksheet.getCell(`${coluna}${linha}`);

      cell.numFmt = "@";

      if (cell.value !== null && cell.value !== undefined) {
        cell.value = String(cell.value);
      }
    }
  });
}

/**
 * Aplica uma lista suspensa utilizando um nome definido no Excel.
 *
 * A validação é aplicada diretamente em cada célula.
 * Essa forma é compatível com a versão do ExcelJS utilizada
 * no projeto.
 */
function aplicarListaSuspensa(
  worksheet: ExcelJS.Worksheet,
  coluna: string,
  primeiraLinha: number,
  ultimaLinha: number,
  nomeLista: string,
): void {
  for (let linha = primeiraLinha; linha <= ultimaLinha; linha += 1) {
    const celula = worksheet.getCell(`${coluna}${linha}`);

    celula.dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`=${nomeLista}`],
      showErrorMessage: false,
      showInputMessage: true,
      promptTitle: "Lista de referência",
      prompt:
        "Selecione um valor da lista ou digite um valor novo.",
    };
  }
}

function adicionarAbaListas(
  workbook: ExcelJS.Workbook,
  references: ExcelReferenceData,
): ExcelJS.Worksheet {
  const worksheet = workbook.addWorksheet("Listas");

  const criadores = valoresUnicos(
    references.aves.map((ave) => ave.creator || ""),
  );

  const listas: Array<{
    titulo: string;
    valores: string[];
  }> = [
    {
      titulo: "Especies",
      valores: valoresUnicos(
        references.config.especies || [],
      ),
    },
    {
      titulo: "Sexo",
      valores: ["Macho", "Fêmea", "Indefinido"],
    },
    {
      titulo: "Status",
      valores: ["Ativo", "Vendido", "Óbito", "No Ninho"],
    },
    {
      titulo: "Criadores",
      valores: criadores,
    },
    {
      titulo: "Pais",
      valores: nomesAves(references.aves),
    },
    {
      titulo: "Casais",
      valores: nomesCasais(
        references.casais,
        references.aves,
      ),
    },
    {
      titulo: "Ninhos",
      valores: nomesNinhos(references.ninhos),
    },
    {
      titulo: "CoresCabeca",
      valores: nomesCores(
        references.config.coresCabeca,
      ),
    },
    {
      titulo: "CoresPeito",
      valores: nomesCores(
        references.config.coresPeito,
      ),
    },
    {
      titulo: "CoresDorso",
      valores: nomesCores(
        references.config.coresDorso,
      ),
    },
    {
      titulo: "CriadoPorAmas",
      valores: ["Sim", "Não"],
    },
  ];

  listas.forEach((lista, indice) => {
    const coluna = indice + 1;
    const letra = worksheet.getColumn(coluna).letter;

    const titulo = worksheet.getCell(`${letra}1`);

    titulo.value = lista.titulo;

    titulo.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };

    titulo.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };

    titulo.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    const valores =
      lista.valores.length > 0
        ? lista.valores
        : [""];

    valores.forEach((valor, linha) => {
      const cell = worksheet.getCell(
        `${letra}${linha + 2}`,
      );

      /*
       * Todas as listas são gravadas como texto.
       * Isso preserva anilhas como 072 e 001.
       */
      cell.value = String(valor);
      cell.numFmt = "@";
    });

    worksheet.getColumn(coluna).width = Math.max(
      18,
      Math.min(35, lista.titulo.length + 5),
    );
  });

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  worksheet.autoFilter = {
    from: "A1",
    to: `${
      worksheet.getColumn(listas.length).letter
    }${
      Math.max(
        ...listas.map((lista) =>
          Math.max(lista.valores.length, 1),
        ),
      ) + 1
    }`,
  };

  return worksheet;
}

function adicionarAbaInstrucoes(
  workbook: ExcelJS.Workbook,
): ExcelJS.Worksheet {
  const worksheet = workbook.addWorksheet("Instruções");

  const linhas = [
    ["MODELO DE IMPORTAÇÃO DE AVES - BIRD MANAGER"],
    [""],
    ["Como utilizar"],
    ["1. Preencha uma linha para cada ave."],
    ["2. O campo id deve ficar vazio para aves novas."],
    [
      "3. Campos com lista suspensa aceitam também valores digitados manualmente.",
    ],
    [
      "4. Valores novos de espécie, cor ou criador serão analisados durante a importação.",
    ],
    [
      "5. Para pai e mãe, informe a anilha, o nome ou o ID da ave já cadastrada.",
    ],
    [
      "6. Para ninho, informe o nome ou o ID do ninho já cadastrado.",
    ],
    [
      "7. Para casal de amas, informe a descrição do casal ou seu ID.",
    ],
    [
      "8. A importação será revisada antes de alterar os dados do sistema.",
    ],
    [""],
    ["Atenção sobre as anilhas"],
    [
      "A coluna anilha deve ser mantida como TEXTO para preservar zeros à esquerda.",
    ],
    [
      "Exemplos válidos: 072, 001, 0008. Não altere a coluna para Número.",
    ],
    [""],
    ["Campos principais"],
    ["id", "ID interno. Deixe vazio para novas aves."],
    ["especie", "Espécie da ave."],
    [
      "anilha",
      "Identificação da anilha. Deve ser tratada como texto.",
    ],
    ["ano_anilha", "Ano da anilha."],
    ["nome", "Nome da ave."],
    ["sexo", "Macho, Fêmea ou Indefinido."],
    [
      "status",
      "Ativo, Vendido, Óbito ou No Ninho.",
    ],
    ["criador", "Criador ou origem da ave."],
    ["ano_aquisicao", "Ano de aquisição."],
    [
      "foto",
      "URL ou referência da foto, se aplicável.",
    ],
    ["pai", "Nome, anilha ou ID do pai."],
    ["mae", "Nome, anilha ou ID da mãe."],
    [
      "data_nascimento",
      "Data no formato AAAA-MM-DD.",
    ],
    [
      "ninho_nascimento",
      "Nome ou ID do ninho de nascimento.",
    ],
    ["criado_por_amas", "Use Sim ou Não."],
    [
      "casal_amas",
      "Descrição ou ID do casal de amas.",
    ],
    ["cor_cabeca", "Cor da cabeça."],
    ["cor_peito", "Cor do peito."],
    ["cor_dorso", "Cor do dorso."],
    ["nota", "Observações livres."],
    ["porta", "Porta, gaiola ou localização."],
  ];

  linhas.forEach((linha, indice) => {
    const row = worksheet.getRow(indice + 1);

    linha.forEach((valor, coluna) => {
      row.getCell(coluna + 1).value = valor;
    });
  });

  worksheet.getCell("A1").font = {
    bold: true,
    size: 16,
    color: { argb: "FF0F172A" },
  };

  worksheet.getCell("A3").font = {
    bold: true,
    size: 13,
  };

  worksheet.getCell("A13").font = {
    bold: true,
    size: 13,
    color: { argb: "FFB91C1C" },
  };

  worksheet.getColumn(1).width = 28;
  worksheet.getColumn(2).width = 90;

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 3,
    },
  ];

  return worksheet;
}

export async function baixarPlanilhaModelo(
  references: ExcelReferenceData,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Bird Manager";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Aves");

  worksheet.addRow([...CABECALHOS]);

  aplicarEstiloCabecalho(worksheet.getRow(1));

  const larguras: Record<string, number> = {
    A: 18,
    B: 24,
    C: 18,
    D: 14,
    E: 22,
    F: 15,
    G: 16,
    H: 22,
    I: 16,
    J: 35,
    K: 22,
    L: 22,
    M: 18,
    N: 22,
    O: 18,
    P: 24,
    Q: 20,
    R: 20,
    S: 20,
    T: 40,
    U: 18,
  };

  Object.entries(larguras).forEach(
    ([coluna, largura]) => {
      worksheet.getColumn(coluna).width = largura;
    },
  );

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  worksheet.autoFilter = {
    from: "A1",
    to: "U1",
  };

  const linhasModelo = 200;

  for (
    let linha = 2;
    linha <= linhasModelo + 1;
    linha += 1
  ) {
    worksheet.addRow([]);
    aplicarBordas(worksheet.getRow(linha));
  }

  /*
   * Colunas que obrigatoriamente devem ser TEXTO:
   *
   * A = ID
   * C = Anilha
   * K = Pai
   * L = Mãe
   *
   * Principalmente C, K e L precisam preservar zeros
   * à esquerda, como 072, 001 e 0008.
   */
  aplicarFormatoTexto(
    worksheet,
    ["A", "C", "K", "L"],
    2,
    linhasModelo + 1,
  );

  /*
   * Também define o formato das colunas de anilha,
   * pai e mãe.
   */
  worksheet.getColumn("C").numFmt = "@";
  worksheet.getColumn("K").numFmt = "@";
  worksheet.getColumn("L").numFmt = "@";

  adicionarAbaListas(workbook, references);
  adicionarAbaInstrucoes(workbook);

  const especies = valoresUnicos(
    references.config.especies || [],
  );

  const criadores = valoresUnicos(
    references.aves.map((ave) => ave.creator || ""),
  );

  const pais = nomesAves(references.aves);

  const casais = nomesCasais(
    references.casais,
    references.aves,
  );

  const ninhos = nomesNinhos(references.ninhos);

  const coresCabeca = nomesCores(
    references.config.coresCabeca,
  );

  const coresPeito = nomesCores(
    references.config.coresPeito,
  );

  const coresDorso = nomesCores(
    references.config.coresDorso,
  );

  /*
   * Cria os nomes definidos no Excel.
   *
   * Os nomes definidos permitem que a validação de dados
   * utilize listas localizadas na aba "Listas".
   */
  const definirLista = (
    nome: string,
    coluna: string,
    quantidade: number,
  ): void => {
    const ultimaLinha = Math.max(
      quantidade + 1,
      2,
    );

    workbook.definedNames.add(
      nome,
      `'Listas'!$${coluna}$2:$${coluna}$${ultimaLinha}`,
    );
  };

  definirLista(
    "ListaEspecies",
    "A",
    especies.length,
  );

  definirLista(
    "ListaSexo",
    "B",
    3,
  );

  definirLista(
    "ListaStatus",
    "C",
    4,
  );

  definirLista(
    "ListaCriadores",
    "D",
    criadores.length,
  );

  definirLista(
    "ListaPais",
    "E",
    pais.length,
  );

  definirLista(
    "ListaCasais",
    "F",
    casais.length,
  );

  definirLista(
    "ListaNinhos",
    "G",
    ninhos.length,
  );

  definirLista(
    "ListaCoresCabeca",
    "H",
    coresCabeca.length,
  );

  definirLista(
    "ListaCoresPeito",
    "I",
    coresPeito.length,
  );

  definirLista(
    "ListaCoresDorso",
    "J",
    coresDorso.length,
  );

  definirLista(
    "ListaAmas",
    "K",
    2,
  );

  /*
   * B - Espécie
   */
  aplicarListaSuspensa(
    worksheet,
    "B",
    2,
    linhasModelo + 1,
    "ListaEspecies",
  );

  /*
   * F - Sexo
   */
  aplicarListaSuspensa(
    worksheet,
    "F",
    2,
    linhasModelo + 1,
    "ListaSexo",
  );

  /*
   * G - Status
   */
  aplicarListaSuspensa(
    worksheet,
    "G",
    2,
    linhasModelo + 1,
    "ListaStatus",
  );

  /*
   * H - Criador
   */
  aplicarListaSuspensa(
    worksheet,
    "H",
    2,
    linhasModelo + 1,
    "ListaCriadores",
  );

  /*
   * K - Pai
   */
  aplicarListaSuspensa(
    worksheet,
    "K",
    2,
    linhasModelo + 1,
    "ListaPais",
  );

  /*
   * L - Mãe
   */
  aplicarListaSuspensa(
    worksheet,
    "L",
    2,
    linhasModelo + 1,
    "ListaPais",
  );

  /*
   * N - Ninho de nascimento
   */
  aplicarListaSuspensa(
    worksheet,
    "N",
    2,
    linhasModelo + 1,
    "ListaNinhos",
  );

  /*
   * O - Criado por amas
   */
  aplicarListaSuspensa(
    worksheet,
    "O",
    2,
    linhasModelo + 1,
    "ListaAmas",
  );

  /*
   * P - Casal de amas
   */
  aplicarListaSuspensa(
    worksheet,
    "P",
    2,
    linhasModelo + 1,
    "ListaCasais",
  );

  /*
   * Q - Cor da cabeça
   */
  aplicarListaSuspensa(
    worksheet,
    "Q",
    2,
    linhasModelo + 1,
    "ListaCoresCabeca",
  );

  /*
   * R - Cor do peito
   */
  aplicarListaSuspensa(
    worksheet,
    "R",
    2,
    linhasModelo + 1,
    "ListaCoresPeito",
  );

  /*
   * S - Cor do dorso
   */
  aplicarListaSuspensa(
    worksheet,
    "S",
    2,
    linhasModelo + 1,
    "ListaCoresDorso",
  );

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download =
    "modelo_importacao_aves_bird_manager.xlsx";

  link.click();

  URL.revokeObjectURL(url);
}

function converterBooleano(
  valor: unknown,
): boolean | undefined {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return undefined;
  }

  if (typeof valor === "boolean") {
    return valor;
  }

  const texto = String(valor)
    .trim()
    .toLowerCase();

  if (
    ["sim", "s", "true", "1", "yes"].includes(texto)
  ) {
    return true;
  }

  if (
    ["não", "nao", "n", "false", "0", "no"].includes(
      texto,
    )
  ) {
    return false;
  }

  return undefined;
}

function converterNumero(
  valor: unknown,
): number | undefined {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return undefined;
  }

  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : undefined;
}

/**
 * Converte um valor em texto preservando o conteúdo.
 *
 * Importante:
 * - Se o Excel entregar "072", mantém "072".
 * - Se o Excel já tiver convertido para 72, não é possível
 *   recuperar automaticamente o zero perdido.
 */
function textoOuUndefined(
  valor: unknown,
): string | undefined {
  if (
    valor === undefined ||
    valor === null
  ) {
    return undefined;
  }

  const texto = String(valor).trim();

  return texto || undefined;
}

function normalizarCabecalho(
  valor: unknown,
): string {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

export async function lerPlanilhaAves(
  arquivo: File,
): Promise<AveImportada[]> {
  const workbook = new ExcelJS.Workbook();

  const buffer = await arquivo.arrayBuffer();

  await workbook.xlsx.load(buffer);

  const worksheet =
    workbook.getWorksheet("Aves") ||
    workbook.worksheets[0];

  if (!worksheet) {
    throw new Error(
      "A planilha não possui uma aba válida.",
    );
  }

  const primeiraLinha = worksheet.getRow(1);

  const mapaColunas = new Map<string, number>();

  primeiraLinha.eachCell((cell, coluna) => {
    const nome = normalizarCabecalho(
      cell.value,
    );

    if (nome) {
      mapaColunas.set(nome, coluna);
    }
  });

  if (
    !mapaColunas.has("especie") &&
    !mapaColunas.has("anilha") &&
    !mapaColunas.has("nome")
  ) {
    throw new Error(
      "Não foi possível identificar os cabeçalhos. Use a planilha modelo do Bird Manager.",
    );
  }

  const valor = (
    linha: ExcelJS.Row,
    coluna: string,
  ): unknown => {
    const numeroColuna =
      mapaColunas.get(coluna);

    return numeroColuna
      ? linha.getCell(numeroColuna).value
      : undefined;
  };

  const resultado: AveImportada[] = [];

  for (
    let numeroLinha = 2;
    numeroLinha <= worksheet.rowCount;
    numeroLinha += 1
  ) {
    const linha = worksheet.getRow(numeroLinha);

    const possuiDados = CABECALHOS.some(
      (cabecalho) => {
        const dado = valor(
          linha,
          cabecalho,
        );

        return (
          dado !== undefined &&
          dado !== null &&
          String(dado).trim() !== ""
        );
      },
    );

    if (!possuiDados) {
      continue;
    }

    /*
     * As anilhas são lidas como texto.
     *
     * Se a planilha estiver corretamente formatada
     * como texto, "072" chegará ao sistema como "072".
     */
    const anilha = textoOuUndefined(
      valor(linha, "anilha"),
    );

    const pai = textoOuUndefined(
      valor(linha, "pai"),
    );

    const mae = textoOuUndefined(
      valor(linha, "mae"),
    );

    resultado.push({
      id: textoOuUndefined(
        valor(linha, "id"),
      ),

      species: textoOuUndefined(
        valor(linha, "especie"),
      ),

      ring: anilha,

      ringYear: converterNumero(
        valor(linha, "ano_anilha"),
      ),

      name: textoOuUndefined(
        valor(linha, "nome"),
      ),

      sex: textoOuUndefined(
        valor(linha, "sexo"),
      ) as Ave["sex"] | undefined,

      status: textoOuUndefined(
        valor(linha, "status"),
      ) as Ave["status"] | undefined,

      creator: textoOuUndefined(
        valor(linha, "criador"),
      ),

      acqYear: converterNumero(
        valor(linha, "ano_aquisicao"),
      ),

      photo: textoOuUndefined(
        valor(linha, "foto"),
      ),

      /*
       * Pai e mãe permanecem como texto.
       *
       * O App.tsx fará a conversão da referência
       * para o ID interno da ave.
       */
      parentMaleId: pai,
      parentFemaleId: mae,

      birthDate: textoOuUndefined(
        valor(linha, "data_nascimento"),
      ),

      birthNestId: textoOuUndefined(
        valor(linha, "ninho_nascimento"),
      ),

      criadoPorAmas: converterBooleano(
        valor(linha, "criado_por_amas"),
      ),

      casalAmasId: textoOuUndefined(
        valor(linha, "casal_amas"),
      ),

      corCabeca: textoOuUndefined(
        valor(linha, "cor_cabeca"),
      ),

      corPeito: textoOuUndefined(
        valor(linha, "cor_peito"),
      ),

      corDorso: textoOuUndefined(
        valor(linha, "cor_dorso"),
      ),

      nota: textoOuUndefined(
        valor(linha, "nota"),
      ),

      porta: textoOuUndefined(
        valor(linha, "porta"),
      ),
    });
  }

  return resultado;
}