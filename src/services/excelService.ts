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

function nomesAves(aves: Ave[]): string[] {
  return aves
    .map((ave) => ave.ring || ave.name || ave.id)
    .filter(Boolean);
}

function descricaoCasal(casal: Casal, aves: Ave[]): string {
  const macho = aves.find((ave) => ave.id === casal.mId);
  const femea = aves.find((ave) => ave.id === casal.fId);

  const nomeMacho = macho?.name || macho?.ring || casal.mId;
  const nomeFemea = femea?.name || femea?.ring || casal.fId;

  return `${nomeMacho} x ${nomeFemea}`;
}

function nomesCasais(casais: Casal[], aves: Ave[]): string[] {
  return casais.map((casal) => descricaoCasal(casal, aves));
}

function nomesNinhos(ninhos: Ninho[]): string[] {
  return ninhos.map((ninho) => ninho.name || ninho.id);
}

function nomesCores(cores?: { nome: string }[]): string[] {
  return (cores || []).map((cor) => cor.nome).filter(Boolean);
}

function aplicarEstiloCabecalho(row: ExcelJS.Row) {
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

function aplicarBordas(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "FFE2E8F0" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    };
    cell.alignment = {
      vertical: "top",
      wrapText: true,
    };
  });
}

function aplicarListaSuspensa(
  worksheet: ExcelJS.Worksheet,
  coluna: string,
  ultimaLinha: number,
  referencia: string,
) {
  for (let linha = 2; linha <= ultimaLinha; linha += 1) {
    worksheet.getCell(`${coluna}${linha}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`=${referencia}`],
      showErrorMessage: false,
      showInputMessage: true,
      promptTitle: "Lista de referência",
      prompt: "Selecione um valor da lista ou digite um valor novo.",
    };
  }
}

function adicionarAbaListas(
  workbook: ExcelJS.Workbook,
  references: ExcelReferenceData,
) {
  const worksheet = workbook.addWorksheet("Listas");

  const listas: Array<{ titulo: string; valores: string[] }> = [
    { titulo: "Especies", valores: references.config.especies || [] },
    {
      titulo: "Sexo",
      valores: ["Macho", "Fêmea", "Indefinido"],
    },
    {
      titulo: "Status",
      valores: ["Ativo", "Vendido", "Óbito", "No Ninho"],
    },
    { titulo: "Criadores", valores: references.aves.map((ave) => ave.creator).filter(Boolean) },
    {
      titulo: "Pais",
      valores: nomesAves(references.aves),
    },
    {
      titulo: "Casais",
      valores: nomesCasais(references.casais, references.aves),
    },
    {
      titulo: "Ninhos",
      valores: nomesNinhos(references.ninhos),
    },
    {
      titulo: "CoresCabeca",
      valores: nomesCores(references.config.coresCabeca),
    },
    {
      titulo: "CoresPeito",
      valores: nomesCores(references.config.coresPeito),
    },
    {
      titulo: "CoresDorso",
      valores: nomesCores(references.config.coresDorso),
    },
    {
      titulo: "CriadoPorAmas",
      valores: ["Sim", "Não"],
    },
  ];

  const maiorQuantidade = Math.max(...listas.map((lista) => lista.valores.length), 1);

  listas.forEach((lista, indice) => {
    const coluna = indice + 1;
    const letra = worksheet.getColumn(coluna).letter;

    worksheet.getCell(`${letra}1`).value = lista.titulo;
    worksheet.getCell(`${letra}1`).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getCell(`${letra}1`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };

    lista.valores.forEach((valor, linha) => {
      worksheet.getCell(`${letra}${linha + 2}`).value = valor;
    });

    worksheet.getColumn(coluna).width = Math.max(
      18,
      Math.min(35, lista.titulo.length + 5),
    );
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: "A1",
    to: `${worksheet.getColumn(listas.length).letter}${maiorQuantidade + 1}`,
  };

  return worksheet;
}

function adicionarAbaInstrucoes(workbook: ExcelJS.Workbook) {
  const worksheet = workbook.addWorksheet("Instruções");

  const linhas = [
    ["MODELO DE IMPORTAÇÃO DE AVES - BIRD MANAGER"],
    [""],
    ["Como utilizar"],
    ["1. Preencha uma linha para cada ave."],
    ["2. O campo id deve ficar vazio para aves novas."],
    ["3. Campos com lista suspensa aceitam também valores digitados manualmente."],
    ["4. Valores novos de espécie, cor ou criador serão analisados durante a importação."],
    ["5. Para pai e mãe, informe a anilha, o nome ou o ID da ave já cadastrada."],
    ["6. Para ninho, informe o nome ou o ID do ninho já cadastrado."],
    ["7. Para casal de amas, informe a descrição do casal ou seu ID."],
    ["8. A importação será revisada antes de alterar os dados do sistema."],
    [""],
    ["Campos principais"],
    ["id", "ID interno. Deixe vazio para novas aves."],
    ["especie", "Espécie da ave."],
    ["anilha", "Número ou identificação da anilha."],
    ["ano_anilha", "Ano da anilha."],
    ["nome", "Nome da ave."],
    ["sexo", "Macho, Fêmea ou Indefinido."],
    ["status", "Ativo, Vendido, Óbito ou No Ninho."],
    ["criador", "Criador ou origem da ave."],
    ["ano_aquisicao", "Ano de aquisição."],
    ["foto", "URL ou referência da foto, se aplicável."],
    ["pai", "Nome, anilha ou ID do pai."],
    ["mae", "Nome, anilha ou ID da mãe."],
    ["data_nascimento", "Data no formato AAAA-MM-DD."],
    ["ninho_nascimento", "Nome ou ID do ninho de nascimento."],
    ["criado_por_amas", "Use Sim ou Não."],
    ["casal_amas", "Descrição ou ID do casal de amas."],
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
  worksheet.getCell("A3").font = { bold: true, size: 13 };
  worksheet.getColumn(1).width = 25;
  worksheet.getColumn(2).width = 90;
  worksheet.views = [{ state: "frozen", ySplit: 3 }];
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

  Object.entries(larguras).forEach(([coluna, largura]) => {
    worksheet.getColumn(coluna).width = largura;
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: "A1",
    to: `U1`,
  };

  const linhasModelo = 200;
  for (let linha = 2; linha <= linhasModelo + 1; linha += 1) {
    worksheet.addRow([]);
    aplicarBordas(worksheet.getRow(linha));
  }

  adicionarAbaListas(workbook, references);

  // Nomes definidos permitem que as listas funcionem no Excel
  // mesmo estando em outra aba. A validação permanece livre:
  // showErrorMessage: false permite digitar um valor novo.
  const especies = references.config.especies || [];
  const criadores = [...new Set(references.aves.map((ave) => ave.creator).filter(Boolean))];
  const pais = nomesAves(references.aves);
  const casais = nomesCasais(references.casais, references.aves);
  const ninhos = nomesNinhos(references.ninhos);
  const coresCabeca = nomesCores(references.config.coresCabeca);
  const coresPeito = nomesCores(references.config.coresPeito);
  const coresDorso = nomesCores(references.config.coresDorso);

  const definirLista = (nome: string, coluna: string, quantidade: number) => {
    const ultimaLinha = Math.max(quantidade + 1, 2);
    workbook.definedNames.add(
      nome,
      `'Listas'!$${coluna}$2:$${coluna}$${ultimaLinha}`,
    );
  };

  definirLista("ListaEspecies", "A", especies.length);
  definirLista("ListaSexo", "B", 3);
  definirLista("ListaStatus", "C", 4);
  definirLista("ListaCriadores", "D", criadores.length);
  definirLista("ListaPais", "E", pais.length);
  definirLista("ListaCasais", "F", casais.length);
  definirLista("ListaNinhos", "G", ninhos.length);
  definirLista("ListaCoresCabeca", "H", coresCabeca.length);
  definirLista("ListaCoresPeito", "I", coresPeito.length);
  definirLista("ListaCoresDorso", "J", coresDorso.length);
  definirLista("ListaAmas", "K", 2);

  aplicarListaSuspensa(worksheet, "B", linhasModelo + 1, "ListaEspecies");
  aplicarListaSuspensa(worksheet, "F", linhasModelo + 1, "ListaSexo");
  aplicarListaSuspensa(worksheet, "G", linhasModelo + 1, "ListaStatus");
  aplicarListaSuspensa(worksheet, "H", linhasModelo + 1, "ListaCriadores");
  aplicarListaSuspensa(worksheet, "K", linhasModelo + 1, "ListaPais");
  aplicarListaSuspensa(worksheet, "L", linhasModelo + 1, "ListaPais");
  aplicarListaSuspensa(worksheet, "N", linhasModelo + 1, "ListaNinhos");
  aplicarListaSuspensa(worksheet, "P", linhasModelo + 1, "ListaCasais");
  aplicarListaSuspensa(worksheet, "Q", linhasModelo + 1, "ListaCoresCabeca");
  aplicarListaSuspensa(worksheet, "R", linhasModelo + 1, "ListaCoresPeito");
  aplicarListaSuspensa(worksheet, "S", linhasModelo + 1, "ListaCoresDorso");
  aplicarListaSuspensa(worksheet, "O", linhasModelo + 1, "ListaAmas");

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "modelo_importacao_aves_bird_manager.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}

function converterBooleano(valor: unknown): boolean | undefined {
  if (valor === undefined || valor === null || valor === "") {
    return undefined;
  }

  if (typeof valor === "boolean") {
    return valor;
  }

  const texto = String(valor).trim().toLowerCase();

  if (["sim", "s", "true", "1", "yes"].includes(texto)) {
    return true;
  }

  if (["não", "nao", "n", "false", "0", "no"].includes(texto)) {
    return false;
  }

  return undefined;
}

function converterNumero(valor: unknown): number | undefined {
  if (valor === undefined || valor === null || valor === "") {
    return undefined;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

function textoOuUndefined(valor: unknown): string | undefined {
  if (valor === undefined || valor === null) {
    return undefined;
  }

  const texto = String(valor).trim();
  return texto || undefined;
}

function normalizarCabecalho(valor: unknown): string {
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

  const worksheet = workbook.getWorksheet("Aves") || workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("A planilha não possui uma aba válida.");
  }

  const primeiraLinha = worksheet.getRow(1);
  const mapaColunas = new Map<string, number>();

  primeiraLinha.eachCell((cell, coluna) => {
    const nome = normalizarCabecalho(cell.value);
    if (nome) {
      mapaColunas.set(nome, coluna);
    }
  });

  if (!mapaColunas.has("especie") && !mapaColunas.has("anilha") && !mapaColunas.has("nome")) {
    throw new Error(
      "Não foi possível identificar os cabeçalhos. Use a planilha modelo do Bird Manager.",
    );
  }

  const valor = (linha: ExcelJS.Row, coluna: string): unknown => {
    const numeroColuna = mapaColunas.get(coluna);
    return numeroColuna ? linha.getCell(numeroColuna).value : undefined;
  };

  const resultado: AveImportada[] = [];

  for (let numeroLinha = 2; numeroLinha <= worksheet.rowCount; numeroLinha += 1) {
    const linha = worksheet.getRow(numeroLinha);

    const possuiDados = CABECALHOS.some((cabecalho) => {
      const dado = valor(linha, cabecalho);
      return dado !== undefined && dado !== null && String(dado).trim() !== "";
    });

    if (!possuiDados) {
      continue;
    }

    resultado.push({
      id: textoOuUndefined(valor(linha, "id")),
      species: textoOuUndefined(valor(linha, "especie")),
      ring: textoOuUndefined(valor(linha, "anilha")),
      ringYear: converterNumero(valor(linha, "ano_anilha")),
      name: textoOuUndefined(valor(linha, "nome")),
      sex: textoOuUndefined(valor(linha, "sexo")) as Ave["sex"] | undefined,
      status: textoOuUndefined(valor(linha, "status")) as Ave["status"] | undefined,
      creator: textoOuUndefined(valor(linha, "criador")),
      acqYear: converterNumero(valor(linha, "ano_aquisicao")),
      photo: textoOuUndefined(valor(linha, "foto")),
      parentMaleId: textoOuUndefined(valor(linha, "pai")),
      parentFemaleId: textoOuUndefined(valor(linha, "mae")),
      birthDate: textoOuUndefined(valor(linha, "data_nascimento")),
      birthNestId: textoOuUndefined(valor(linha, "ninho_nascimento")),
      criadoPorAmas: converterBooleano(valor(linha, "criado_por_amas")),
      casalAmasId: textoOuUndefined(valor(linha, "casal_amas")),
      corCabeca: textoOuUndefined(valor(linha, "cor_cabeca")),
      corPeito: textoOuUndefined(valor(linha, "cor_peito")),
      corDorso: textoOuUndefined(valor(linha, "cor_dorso")),
      nota: textoOuUndefined(valor(linha, "nota")),
      porta: textoOuUndefined(valor(linha, "porta")),
    });
  }

  return resultado;
}
