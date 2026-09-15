import React, { useState } from "react";
import type { Config, CorAve } from "../App";

interface Props {
  config: Config;
  onSaveConfig: (config: Config) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
  onSaveToGoogleDrive: () => void;
  onImportFromGoogleDrive: () => void;
  lastGoogleDriveBackup: string | null;
  onRestoreBackup: (data: any) => void;
}

interface SeletorCoresProps {
  titulo: string;
  emoji: string;
  cores: CorAve[];
  novaCorNome: string;
  novaCorHex: string;
  onChangeNome: (valor: string) => void;
  onChangeHex: (valor: string) => void;
  onAdicionarCor: () => void;
  onRemoverCor: (id: string) => void;
}

function SeletorCores({
  titulo,
  emoji,
  cores,
  novaCorNome,
  novaCorHex,
  onChangeNome,
  onChangeHex,
  onAdicionarCor,
  onRemoverCor,
}: SeletorCoresProps) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-base font-bold mb-3 flex items-center gap-2">
        <span>{emoji}</span>
        {titulo}
      </h3>

      {/* Cores já cadastradas */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-700 mb-2">
          Cores cadastradas
        </div>

        {cores.length === 0 ? (
          <div className="border border-dashed rounded p-3 text-sm text-slate-500">
            Nenhuma cor cadastrada.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {cores.map((cor) => (
              <div
                key={cor.id}
                className="flex items-center justify-between gap-2 border rounded px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-8 h-8 rounded-full border border-slate-300 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: cor.hex }}
                    title={cor.hex}
                  />

                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {cor.nome}
                    </div>

                    <div className="text-xs text-slate-500">
                      {cor.hex}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoverCor(cor.id)}
                  className="text-red-500 hover:text-red-700 font-bold px-1"
                  title={`Excluir a cor ${cor.nome}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cadastro de nova cor */}
      <div className="border-t pt-4">
        <div className="text-sm font-semibold text-slate-700 mb-2">
          Cadastrar nova cor
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">
          {/* Nome */}
          <label className="block">
            <span className="block text-sm mb-1">
              Nome da cor
            </span>

            <input
              type="text"
              value={novaCorNome}
              onChange={(e) => onChangeNome(e.target.value)}
              placeholder="Ex.: Verde pastel"
              className="border rounded px-3 py-2 w-full"
            />
          </label>

          {/* Seletor de cor e hexadecimal */}
          <label className="block">
            <span className="block text-sm mb-1">
              Selecionar cor
            </span>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={novaCorHex}
                onChange={(e) => onChangeHex(e.target.value.toUpperCase())}
                className="h-10 w-14 cursor-pointer border rounded p-1 bg-white"
                title="Escolha uma cor"
              />

              <input
                type="text"
                value={novaCorHex}
                onChange={(e) => onChangeHex(e.target.value.toUpperCase())}
                className="border rounded px-2 py-2 w-full uppercase"
                maxLength={7}
                placeholder="#000000"
              />
            </div>
          </label>

          {/* Botão */}
          <button
            type="button"
            onClick={onAdicionarCor}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            + ADICIONAR
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfigSection({
  config,
  onSaveConfig,
  onExport,
  onImport,
  onClear,
  onSaveToGoogleDrive,
  onImportFromGoogleDrive,
  lastGoogleDriveBackup,
}: Props) {
  const [novoLocal, setNovoLocal] = useState("");
  const [novoEspecie, setNovoEspecie] = useState("");

  const [novaCorNomeCabeca, setNovaCorNomeCabeca] = useState("");
  const [novaCorHexCabeca, setNovaCorHexCabeca] = useState("#A7D7A9");

  const [novaCorNomePeito, setNovaCorNomePeito] = useState("");
  const [novaCorHexPeito, setNovaCorHexPeito] = useState("#A7D7A9");

  const [novaCorNomeDorso, setNovaCorNomeDorso] = useState("");
  const [novaCorHexDorso, setNovaCorHexDorso] = useState("#A7D7A9");

  const coresAves: CorAve[] = config.coresAves || [];

  const formatarUltimoBackup = () => {
    if (!lastGoogleDriveBackup) {
      return "Nenhum backup registrado nesta sessão";
    }

    const data = new Date(lastGoogleDriveBackup);

    if (Number.isNaN(data.getTime())) {
      return "Data do backup indisponível";
    }

    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const gerarIdCor = () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return `cor-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  };

  const adicionarCor = (
    nomeInformado: string,
    hexInformado: string,
  ) => {
    const nome = nomeInformado.trim();
    const hex = hexInformado.trim().toUpperCase();

    if (!nome) {
      alert("Digite o nome da cor.");
      return false;
    }

    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      alert("Digite um código hexadecimal válido, por exemplo: #A7D7A9.");
      return false;
    }

    const corJaExiste = coresAves.some(
      (cor) =>
        cor.nome.trim().toLowerCase() === nome.toLowerCase(),
    );

    if (corJaExiste) {
      alert("Já existe uma cor cadastrada com esse nome.");
      return false;
    }

    const novaCor: CorAve = {
      id: gerarIdCor(),
      nome,
      hex,
    };

    onSaveConfig({
      ...config,
      coresAves: [...coresAves, novaCor],
    });

    return true;
  };

  const removerCor = (id: string) => {
    const cor = coresAves.find((item) => item.id === id);

    if (!cor) return;

    const confirmar = window.confirm(
      `Deseja excluir a cor "${cor.nome}"?`,
    );

    if (!confirmar) return;

    onSaveConfig({
      ...config,
      coresAves: coresAves.filter((item) => item.id !== id),
    });
  };

  const cadastrarCorCabeca = () => {
    const adicionou = adicionarCor(
      novaCorNomeCabeca,
      novaCorHexCabeca,
    );

    if (adicionou) {
      setNovaCorNomeCabeca("");
      setNovaCorHexCabeca("#A7D7A9");
    }
  };

  const cadastrarCorPeito = () => {
    const adicionou = adicionarCor(
      novaCorNomePeito,
      novaCorHexPeito,
    );

    if (adicionou) {
      setNovaCorNomePeito("");
      setNovaCorHexPeito("#A7D7A9");
    }
  };

  const cadastrarCorDorso = () => {
    const adicionou = adicionarCor(
      novaCorNomeDorso,
      novaCorHexDorso,
    );

    if (adicionou) {
      setNovaCorNomeDorso("");
      setNovaCorHexDorso("#A7D7A9");
    }
  };

  return (
    <div className="space-y-6">
      {/* Configurações gerais */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">
          Configurações Gerais
        </h2>

        <label className="block mb-2">
          Prazo de alerta de postura (dias):

          <input
            type="number"
            value={config.prazoAlertaPostura}
            onChange={(e) =>
              onSaveConfig({
                ...config,
                prazoAlertaPostura: Number(e.target.value),
              })
            }
            className="border rounded px-2 py-1 ml-2"
          />
        </label>
      </div>

      {/* Espécies cadastradas */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">
          Espécies cadastradas
        </h2>

        <div className="space-y-2">
          {config.especies.map((esp) => (
            <div
              key={esp}
              className="flex items-center justify-between border rounded px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🐦</span>
                <span>{esp}</span>
              </div>

              <button
                className="text-red-500 font-bold"
                onClick={() =>
                  onSaveConfig({
                    ...config,
                    especies: config.especies.filter(
                      (e) => e !== esp,
                    ),
                  })
                }
              >
                x
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={novoEspecie}
            onChange={(e) => setNovoEspecie(e.target.value)}
            placeholder="Digite o nome da espécie..."
            className="border rounded px-2 py-1 flex-1"
          />

          <button
            className="bg-green-500 text-white px-3 py-1 rounded"
            onClick={() => {
              if (!novoEspecie.trim()) return;

              onSaveConfig({
                ...config,
                especies: [
                  ...config.especies,
                  novoEspecie.trim(),
                ],
              });

              setNovoEspecie("");
            }}
          >
            + ADICIONAR
          </button>
        </div>

        <div className="mt-2 text-sm text-green-700">
          Total de espécies: {config.especies.length} • As
          alterações são salvas automaticamente
        </div>
      </div>

      {/* Locais de ovos */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">
          Locais de ovos
        </h2>

        <div className="space-y-2">
          {config.locaisOvos?.map((local) => (
            <div
              key={local}
              className="flex items-center justify-between border rounded px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🥚</span>
                <span>{local}</span>
              </div>

              <button
                className="text-red-500 font-bold"
                onClick={() =>
                  onSaveConfig({
                    ...config,
                    locaisOvos: config.locaisOvos.filter(
                      (l) => l !== local,
                    ),
                  })
                }
              >
                x
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={novoLocal}
            onChange={(e) => setNovoLocal(e.target.value)}
            placeholder="Digite o nome do local..."
            className="border rounded px-2 py-1 flex-1"
          />

          <button
            className="bg-green-500 text-white px-3 py-1 rounded"
            onClick={() => {
              if (!novoLocal.trim()) return;

              onSaveConfig({
                ...config,
                locaisOvos: [
                  ...(config.locaisOvos || []),
                  novoLocal.trim(),
                ],
              });

              setNovoLocal("");
            }}
          >
            + ADICIONAR
          </button>
        </div>

        <div className="mt-2 text-sm text-green-700">
          Total de locais: {config.locaisOvos?.length || 0} • As
          alterações são salvas automaticamente
        </div>
      </div>

      {/* Paleta de cores das aves */}
      <div className="bg-slate-50 shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">
          🎨 Cores das aves
        </h2>

        <p className="text-sm text-slate-600 mb-4">
          Selecione uma cor existente ou cadastre uma nova cor
          personalizada. A paleta é compartilhada entre cabeça,
          peito e dorso.
        </p>

        <div className="space-y-4">
          {/* Cabeça */}
          <SeletorCores
            titulo="Cores da cabeça"
            emoji="🟢"
            cores={coresAves}
            novaCorNome={novaCorNomeCabeca}
            novaCorHex={novaCorHexCabeca}
            onChangeNome={setNovaCorNomeCabeca}
            onChangeHex={setNovaCorHexCabeca}
            onAdicionarCor={cadastrarCorCabeca}
            onRemoverCor={removerCor}
          />

          {/* Peito */}
          <SeletorCores
            titulo="Cores do peito"
            emoji="🟡"
            cores={coresAves}
            novaCorNome={novaCorNomePeito}
            novaCorHex={novaCorHexPeito}
            onChangeNome={setNovaCorNomePeito}
            onChangeHex={setNovaCorHexPeito}
            onAdicionarCor={cadastrarCorPeito}
            onRemoverCor={removerCor}
          />

          {/* Dorso */}
          <SeletorCores
            titulo="Cores do dorso"
            emoji="🔵"
            cores={coresAves}
            novaCorNome={novaCorNomeDorso}
            novaCorHex={novaCorHexDorso}
            onChangeNome={setNovaCorNomeDorso}
            onChangeHex={setNovaCorHexDorso}
            onAdicionarCor={cadastrarCorDorso}
            onRemoverCor={removerCor}
          />
        </div>

        <div className="mt-4 text-sm text-green-700">
          Total de cores disponíveis: {coresAves.length} • As
          alterações são salvas automaticamente
        </div>
      </div>

      {/* Backup */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">
          Backup
        </h2>

        <div className="flex gap-2 flex-wrap">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={onExport}
          >
            Exportar
          </button>

          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={onSaveToGoogleDrive}
          >
            ☁️ Salvar no Google Drive
          </button>

          <button
            className="bg-indigo-600 text-white px-3 py-1 rounded"
            onClick={onImportFromGoogleDrive}
          >
            📥 Importar do Google Drive
          </button>

          <input
            type="file"
            accept="application/json"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onImport(e.target.files[0]);
                e.currentTarget.value = "";
              }
            }}
          />

          <button
            className="bg-red-600 text-white px-3 py-1 rounded"
            onClick={onClear}
          >
            Limpar tudo
          </button>
        </div>

        <div className="mt-3 text-sm text-slate-600">
          <span className="font-semibold">
            ☁️ Último backup no Google Drive:
          </span>{" "}
          {formatarUltimoBackup()}
        </div>

        <div className="mt-1 text-xs text-slate-400">
          O backup é salvo como{" "}
          <span className="font-semibold">backup.json</span> na
          pasta{" "}
          <span className="font-semibold">GouldPRO</span>.
        </div>
      </div>
    </div>
  );
}
