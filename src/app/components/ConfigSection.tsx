import React, { useState } from "react";
import { Config } from "../App";

interface Props {
  config: Config;
  onSaveConfig: (config: Config) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
  onRestoreBackup: (data: any) => void;
}

export function ConfigSection({
  config,
  onSaveConfig,
  onExport,
  onImport,
  onClear,
  onRestoreBackup,
}: Props) {
  const [novoLocal, setNovoLocal] = useState("");
  const [novoEspecie, setNovoEspecie] = useState("");

  return (
    <div className="space-y-6">
      {/* Configurações gerais */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">Configurações Gerais</h2>
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
        <h2 className="text-lg font-bold mb-2">Espécies cadastradas</h2>
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
                    especies: config.especies.filter((e) => e !== esp),
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
                especies: [...config.especies, novoEspecie.trim()],
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
        <h2 className="text-lg font-bold mb-2">Locais de ovos</h2>
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
                    locaisOvos: config.locaisOvos.filter((l) => l !== local),
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
                locaisOvos: [...(config.locaisOvos || []), novoLocal.trim()],
              });
              setNovoLocal("");
            }}
          >
            + ADICIONAR
          </button>
        </div>
        <div className="mt-2 text-sm text-green-700">
          Total de locais: {config.locaisOvos?.length || 0} • As alterações são salvas automaticamente
        </div>
      </div>

      {/* Backup */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">Backup</h2>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={onExport}
          >
            Exportar
          </button>
          <input
            type="file"
            accept="application/json"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onImport(e.target.files[0]);
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
      </div>
    </div>
  );
}
