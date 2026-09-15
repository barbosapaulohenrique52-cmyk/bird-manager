import React, { useState } from "react";
import { Config, CorAve } from "../App";

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
  onChange: (cores: CorAve[]) => void;
}

function SeletorCores({
  titulo,
  emoji,
  cores,
  onChange,
}: SeletorCoresProps) {
  const [novoNome, setNovoNome] = useState("");
  const [novoHex, setNovoHex] = useState("#808080");

  const adicionarCor = () => {
    const nome = novoNome.trim();

    if (!nome) {
      alert("Digite um nome para a cor.");
      return;
    }

    const jaExiste = cores.some(
      (cor) => cor.nome.trim().toLowerCase() === nome.toLowerCase()
    );

    if (jaExiste) {
      alert("Já existe uma cor com esse nome nesta região.");
      return;
    }

    const novaCor: CorAve = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nome,
      hex: novoHex.toUpperCase(),
    };

    onChange([...cores, novaCor]);

    setNovoNome("");
    setNovoHex("#808080");
  };

  const excluirCor = (id: string) => {
    const cor = cores.find((item) => item.id === id);

    if (!cor) return;

    const confirmar = window.confirm(
      `Deseja excluir a cor "${cor.nome}"?`
    );

    if (!confirmar) return;

    onChange(cores.filter((item) => item.id !== id));
  };

  return (
    <div className="border rounded-lg p-4 bg-slate-50">
      <h3 className="text-base font-bold mb-3">
        {emoji} Cores da {titulo}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 mb-4">
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder={`Nome da cor da ${titulo.toLowerCase()}...`}
          className="border rounded px-3 py-2 bg-white"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              adicionarCor();
            }
          }}
        />

        <div className="flex items-center gap-2 border rounded px-3 py-2 bg-white">
          <input
            type="color"
            value={novoHex}
            onChange={(e) => setNovoHex(e.target.value)}
            className="w-10 h-8 cursor-pointer"
            title="Escolha a cor"
          />

          <span className="text-sm font-mono text-slate-700">
            {novoHex.toUpperCase()}
          </span>
        </div>

        <button
          type="button"
          onClick={adicionarCor}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
        >
          + ADICIONAR
        </button>
      </div>

      {cores.length === 0 ? (
        <div className="text-sm text-slate-500 italic">
          Nenhuma cor cadastrada para esta região.
        </div>
      ) : (
        <div className="space-y-2">
          {cores.map((cor) => (
            <div
              key={cor.id}
              className="flex items-center justify-between gap-3 border rounded bg-white px-3 py-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-8 h-8 rounded border border-slate-300 flex-shrink-0"
                  style={{ backgroundColor: cor.hex }}
                  title={cor.hex}
                />

                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {cor.nome}
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    {cor.hex.toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => excluirCor(cor.id)}
                className="text-red-600 hover:text-red-800 font-bold px-2"
                title="Excluir cor"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-slate-500">
        Total de cores cadastradas: {cores.length}
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

  const coresCabeca = config.coresCabeca || [];
  const coresPeito = config.coresPeito || [];
  const coresDorso = config.coresDorso || [];

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
                type="button"
                className="text-red-500 font-bold"
                onClick={() =>
                  onSaveConfig({
                    ...config,
                    especies: config.especies.filter(
                      (e) => e !== esp
                    ),
                  })
                }
              >
                ✕
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
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
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
          Total de espécies: {config.especies.length} • As alterações são salvas automaticamente
        </div>
      </div>

      {/* Locais de ovos */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">
          Locais de ovos
        </h2>

        <div className="space-y-2">
          {(config.locaisOvos || []).map((local) => (
            <div
              key={local}
              className="flex items-center justify-between border rounded px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🥚</span>
                <span>{local}</span>
              </div>

              <button
                type="button"
                className="text-red-500 font-bold"
                onClick={() =>
                  onSaveConfig({
                    ...config,
                    locaisOvos: (config.locaisOvos || []).filter(
                      (l) => l !== local
                    ),
                  })
                }
              >
                ✕
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
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
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
          Total de locais: {(config.locaisOvos || []).length} • As alterações são salvas automaticamente
        </div>
      </div>

      {/* Cadastro de cores por região */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">
          🎨 Cores visuais das aves
        </h2>

        <p className="text-sm text-slate-600 mb-4">
          Cadastre as cores separadamente para cada região da ave.
          O código hexadecimal será utilizado no diagrama visual.
        </p>

        <div className="space-y-4">
          <SeletorCores
            titulo="Cabeça"
            emoji="🟠"
            cores={coresCabeca}
            onChange={(cores) =>
              onSaveConfig({
                ...config,
                coresCabeca: cores,
              })
            }
          />

          <SeletorCores
            titulo="Peito"
            emoji="🔵"
            cores={coresPeito}
            onChange={(cores) =>
              onSaveConfig({
                ...config,
                coresPeito: cores,
              })
            }
          />

          <SeletorCores
            titulo="Dorso"
            emoji="🟢"
            cores={coresDorso}
            onChange={(cores) =>
              onSaveConfig({
                ...config,
                coresDorso: cores,
              })
            }
          />
        </div>
      </div>

      {/* Backup */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">
          Backup
        </h2>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            onClick={onExport}
          >
            Exportar
          </button>

          <button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            onClick={onSaveToGoogleDrive}
          >
            ☁️ Salvar no Google Drive
          </button>

          <button
            type="button"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
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
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
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
          <span className="font-semibold">backup.json</span>{" "}
          na pasta{" "}
          <span className="font-semibold">GouldPRO</span>.
        </div>
      </div>
    </div>
  );
}
