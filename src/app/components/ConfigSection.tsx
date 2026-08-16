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
      {/* Prazo de alerta */}
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

      {/* Espécies */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">Espécies</h2>
        <ul className="list-disc pl-6">
          {config.especies.map((esp) => (
            <li key={esp}>{esp}</li>
          ))}
        </ul>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={novoEspecie}
            onChange={(e) => setNovoEspecie(e.target.value)}
            placeholder="Nova espécie"
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
            Adicionar
          </button>
        </div>
      </div>

      {/* Locais de ovos */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">Locais de ovos</h2>
        <ul className="list-disc pl-6">
          {config.locaisOvos?.map((local) => (
            <li key={local}>{local}</li>
          ))}
        </ul>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={novoLocal}
            onChange={(e) => setNovoLocal(e.target.value)}
            placeholder="Novo local"
            className="border rounded px-2 py-1 flex-1"
          />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => {
              if (!novoLocal.trim()) return;
              onSaveConfig({
                ...config,
                locaisOvos: [...(config.locaisOvos || []), novoLocal.trim()],
              });
              setNovoLocal("");
            }}
          >
            Adicionar
          </button>
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
