import React, { useRef, useState } from "react";
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
}: Props) {
  const [novoLocal, setNovoLocal] = useState("");
  const [novoEspecie, setNovoEspecie] = useState("");

  // Referência para o campo de seleção de arquivo
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const locaisOvos = Array.isArray(config.locaisOvos)
    ? config.locaisOvos
    : [];

  const adicionarLocal = () => {
    const local = novoLocal.trim();

    if (!local) {
      return;
    }

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

  const selecionarArquivo = () => {
    inputArquivoRef.current?.click();
  };

  const importarArquivo = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const arquivo = e.target.files?.[0];

    if (!arquivo) {
      return;
    }

    if (
      arquivo.type !== "application/json" &&
      !arquivo.name.toLowerCase().endsWith(".json")
    ) {
      alert("Selecione um arquivo de backup .json.");
      e.target.value = "";
      return;
    }

    const confirmar = confirm(
      "ATENÇÃO!\n\nA importação do backup irá substituir os dados atuais deste dispositivo pelos dados do arquivo selecionado.\n\nDeseja continuar?"
    );

    if (!confirmar) {
      e.target.value = "";
      return;
    }

    onImport(arquivo);

    // Permite selecionar novamente o mesmo arquivo posteriormente
    e.target.value = "";
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
            placeholder="Digite o nome da espécie..."
            className="border rounded px-2 py-1 flex-1"
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

      {/* Locais de ovos */}
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
        <h2 className="text-lg font-bold mb-3">
          Backup
        </h2>

        {/* Campo real de arquivo - fica oculto */}
        <input
          ref={inputArquivoRef}
          type="file"
          accept=".json,application/json"
          onChange={importarArquivo}
          className="hidden"
        />

        <div className="flex flex-wrap gap-2">
          {/* Exportar */}
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold"
            onClick={onExport}
          >
            ↓ EXPORTAR BACKUP
          </button>

          {/* Importar */}
          <button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-bold"
            onClick={selecionarArquivo}
          >
            ↑ IMPORTAR BACKUP
          </button>

          {/* Limpar tudo */}
          <button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold"
            onClick={onClear}
          >
            LIMPAR TUDO
          </button>
        </div>

        <div className="mt-3 text-sm text-slate-500">
          Use <strong>Exportar Backup</strong> para salvar
          seus dados em um arquivo .json.
          <br />
          Use <strong>Importar Backup</strong> para restaurar
          os dados em outro celular ou computador.
        </div>
      </div>
    </div>
  );
}
