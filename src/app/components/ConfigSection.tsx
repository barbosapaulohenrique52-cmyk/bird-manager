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

  /*
   * Garante que a lista exista mesmo se o usuário
   * estiver trabalhando com uma configuração antiga.
   */
  const locaisOvos = Array.isArray(config.locaisOvos)
    ? config.locaisOvos
    : [];

  const adicionarLocal = () => {
    const local = novoLocal.trim();

    if (!local) {
      return;
    }

    /*
     * Evita cadastrar dois locais com o mesmo nome,
     * ignorando diferenças entre maiúsculas e minúsculas.
     */
    const jaExiste = locaisOvos.some(
      (item) => item.toLowerCase() === local.toLowerCase()
    );

    if (jaExiste) {
      alert("Este local já está cadastrado.");
      return;
    }

    onSaveConfig({
      ...config,
      locaisOvos: [...locaisOvos, local],
    });

    setNovoLocal("");
  };

  const excluirLocal = (localParaExcluir: string) => {
    if (
      !confirm(
        `Deseja realmente excluir o local "${localParaExcluir}" da lista de locais disponíveis?`
      )
    ) {
      return;
    }

    onSaveConfig({
      ...config,
      locaisOvos: locaisOvos.filter(
        (local) => local !== localParaExcluir
      ),
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
                prazoAlertaPostura: Number(
                  e.target.value
                ),
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
                <span className="text-xl">
                  🐦
                </span>

                <span>{esp}</span>
              </div>

              <button
                className="text-red-500 font-bold"
                onClick={() =>
                  onSaveConfig({
                    ...config,
                    especies:
                      config.especies.filter(
                        (e) => e !== esp
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
            onChange={(e) =>
              setNovoEspecie(e.target.value)
            }
            placeholder="Digite o nome da espécie..."
            className="border rounded px-2 py-1 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const especie =
                  novoEspecie.trim();

                if (!especie) {
                  return;
                }

                onSaveConfig({
                  ...config,
                  especies: [
                    ...config.especies,
                    especie,
                  ],
                });

                setNovoEspecie("");
              }
            }}
          />

          <button
            className="bg-green-500 text-white px-3 py-1 rounded"
            onClick={() => {
              const especie =
                novoEspecie.trim();

              if (!especie) {
                return;
              }

              onSaveConfig({
                ...config,
                especies: [
                  ...config.especies,
                  especie,
                ],
              });

              setNovoEspecie("");
            }}
          >
            + ADICIONAR
          </button>
        </div>

        <div className="mt-2 text-sm text-green-700">
          Total de espécies:{" "}
          {config.especies.length} • As alterações são
          salvas automaticamente
        </div>
      </div>

      {/* ============================================================
          LOCAIS DE OVOS
          ============================================================ */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">
          Locais de ovos
        </h2>

        <div className="space-y-2">
          {locaisOvos.map((local) => (
            <div
              key={local}
              className="flex items-center justify-between border rounded px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  🥚
                </span>

                <span>{local}</span>
              </div>

              <button
                className="text-red-500 font-bold"
                onClick={() =>
                  excluirLocal(local)
                }
                title={`Excluir ${local}`}
              >
                x
              </button>
            </div>
          ))}
        </div>

        {/* Quando ainda não existem locais */}
        {locaisOvos.length === 0 && (
          <div className="border border-dashed rounded p-4 text-center text-sm text-slate-400 mt-2">
            Nenhum local cadastrado.
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={novoLocal}
            onChange={(e) =>
              setNovoLocal(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                adicionarLocal();
              }
            }}
            placeholder="Digite o nome do local..."
            className="border rounded px-2 py-1 flex-1"
          />

          <button
            className="bg-green-500 text-white px-3 py-1 rounded"
            onClick={adicionarLocal}
          >
            + ADICIONAR
          </button>
        </div>

        <div className="mt-2 text-sm text-green-700">
          Total de locais:{" "}
          {locaisOvos.length} • As alterações são
          salvas automaticamente
        </div>
      </div>

      {/* Backup */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">
          Backup
        </h2>

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
                onImport(
                  e.target.files[0]
                );
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
