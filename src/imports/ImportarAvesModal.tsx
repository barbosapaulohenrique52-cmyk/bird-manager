import { useRef, useState } from "react";
import type { Ave, Casal, Config, Ninho } from "../app/App";
import {
  baixarPlanilhaModelo,
  lerPlanilhaAves,
  type AveImportada,
} from "../services/excelService";

interface ImportarAvesModalProps {
  aves: Ave[];
  casais: Casal[];
  ninhos: Ninho[];
  config: Config;
  onClose: () => void;
  onImportar: (aves: AveImportada[]) => void;
}

export function ImportarAvesModal({
  aves,
  casais,
  ninhos,
  config,
  onClose,
  onImportar,
}: ImportarAvesModalProps) {
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [avesImportadas, setAvesImportadas] = useState<AveImportada[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [etapa, setEtapa] = useState<"inicio" | "previa">("inicio");

  const baixarModelo = async () => {
    setErro("");

    try {
      await baixarPlanilhaModelo({
        aves,
        casais,
        ninhos,
        config,
      });
    } catch (error) {
      console.error(error);
      setErro("Não foi possível gerar a planilha modelo.");
    }
  };

  const selecionarArquivo = async (
    evento: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const novoArquivo = evento.target.files?.[0];

    if (!novoArquivo) {
      return;
    }

    setArquivo(novoArquivo);
    setErro("");
    setCarregando(true);

    try {
      const registros = await lerPlanilhaAves(novoArquivo);

      if (registros.length === 0) {
        setErro(
          "A planilha não possui registros preenchidos. Verifique a aba Aves.",
        );
        setAvesImportadas([]);
        setEtapa("inicio");
        return;
      }

      setAvesImportadas(registros);
      setEtapa("previa");
    } catch (error) {
      console.error(error);

      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível ler a planilha.";

      setErro(mensagem);
      setAvesImportadas([]);
      setEtapa("inicio");
    } finally {
      setCarregando(false);

      // Permite selecionar novamente o mesmo arquivo
      if (inputArquivoRef.current) {
        inputArquivoRef.current.value = "";
      }
    }
  };

  const confirmarImportacao = () => {
    if (avesImportadas.length === 0) {
      setErro("Nenhuma ave foi encontrada para importar.");
      return;
    }

    onImportar(avesImportadas);
  };

  const voltarInicio = () => {
    setEtapa("inicio");
    setArquivo(null);
    setAvesImportadas([]);
    setErro("");
  };

  const nomeAve = (ave: AveImportada) => {
    return ave.name || ave.ring || "Sem identificação";
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl max-h-[94vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black uppercase italic">
              Importar aves por planilha
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Baixe o modelo, preencha os dados e importe o arquivo Excel.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white text-xl"
            title="Fechar"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {etapa === "inicio" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="border-2 border-emerald-100 bg-emerald-50 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                    <i className="fas fa-file-excel text-xl" />
                  </div>

                  <h3 className="font-black text-slate-800 uppercase text-sm">
                    1. Baixar planilha modelo
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    O modelo conterá todos os campos disponíveis para o
                    cadastro de aves, além de listas suspensas com os dados já
                    cadastrados no sistema.
                  </p>

                  <button
                    type="button"
                    onClick={baixarModelo}
                    className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-black text-xs uppercase transition"
                  >
                    <i className="fas fa-download mr-2" />
                    Baixar modelo Excel
                  </button>
                </div>

                <div className="border-2 border-blue-100 bg-blue-50 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                    <i className="fas fa-upload text-xl" />
                  </div>

                  <h3 className="font-black text-slate-800 uppercase text-sm">
                    2. Enviar planilha preenchida
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Selecione o arquivo Excel preenchido para que o sistema
                    faça a leitura e apresente uma prévia antes da importação.
                  </p>

                  <input
                    ref={inputArquivoRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={selecionarArquivo}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => inputArquivoRef.current?.click()}
                    disabled={carregando}
                    className="mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-5 py-3 rounded-xl font-black text-xs uppercase transition"
                  >
                    <i
                      className={`fas ${
                        carregando ? "fa-spinner fa-spin" : "fa-folder-open"
                      } mr-2`}
                    />
                    {carregando ? "Lendo planilha..." : "Selecionar arquivo"}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex gap-3">
                  <i className="fas fa-circle-info text-amber-600 mt-0.5" />

                  <div className="text-xs text-amber-800 leading-relaxed">
                    <p className="font-black uppercase mb-2">
                      Como a importação funcionará
                    </p>

                    <ul className="list-disc ml-4 space-y-1">
                      <li>
                        Registros novos serão identificados como novas aves.
                      </li>
                      <li>
                        Espécies, cores e outros dados ainda não cadastrados
                        serão apresentados para análise.
                      </li>
                      <li>
                        Dados semelhantes serão identificados antes da
                        confirmação.
                      </li>
                      <li>
                        Nenhuma alteração será feita antes da sua confirmação.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-xs font-bold">
                  <i className="fas fa-exclamation-triangle mr-2" />
                  {erro}
                </div>
              )}
            </div>
          )}

          {etapa === "previa" && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-800 uppercase text-sm">
                    Prévia da importação
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Arquivo:{" "}
                    <span className="font-bold">{arquivo?.name}</span>
                  </p>
                </div>

                <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-xs font-black">
                  {avesImportadas.length}{" "}
                  {avesImportadas.length === 1 ? "ave encontrada" : "aves encontradas"}
                </div>
              </div>

              <div className="border-2 border-slate-100 rounded-2xl overflow-hidden">
                <div className="overflow-auto max-h-[55vh]">
                  <table className="min-w-[1500px] w-full border-collapse text-left">
                    <thead className="sticky top-0 z-10 bg-slate-900 text-white">
                      <tr>
                        <th className="p-3 text-[10px] font-black uppercase">
                          #
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Espécie
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Anilha
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Nome
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Sexo
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Status
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Criador
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Ano aquisição
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Pai
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Mãe
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Cor cabeça
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Cor peito
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase">
                          Cor dorso
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {avesImportadas.map((ave, index) => (
                        <tr
                          key={`${ave.id || "nova"}-${index}`}
                          className="hover:bg-slate-50"
                        >
                          <td className="p-3 text-xs font-black text-slate-400">
                            {index + 1}
                          </td>
                          <td className="p-3 text-xs font-bold">
                            {ave.species || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {ave.ring || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {nomeAve(ave)}
                          </td>
                          <td className="p-3 text-xs">
                            {ave.sex || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {ave.status || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {ave.creator || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {ave.acqYear || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {ave.parentMaleId || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {ave.parentFemaleId || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {ave.corCabeca || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {ave.corPeito || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {ave.corDorso || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-xs font-bold">
                  <i className="fas fa-exclamation-triangle mr-2" />
                  {erro}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={voltarInicio}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-black uppercase text-xs transition"
                >
                  <i className="fas fa-arrow-left mr-2" />
                  Escolher outro arquivo
                </button>

                <button
                  type="button"
                  onClick={confirmarImportacao}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black uppercase text-xs shadow-lg transition"
                >
                  <i className="fas fa-check mr-2" />
                  Continuar importação
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-black uppercase text-xs transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}