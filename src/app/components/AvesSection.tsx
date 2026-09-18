import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Ave, ModalType, Config, Ninho } from '../App';
import BirdColorDiagram from './BirdColorDiagram';
import {
  gerarPlanilhaAves,
  gerarPlanilhaModeloAves,
  importarPlanilhaAves
} from '../../services/excelService';

interface AvesSectionProps {
  aves: Ave[];
  ninhos: Ninho[];
  config?: Config;
  onOpenModal: (type: ModalType, id?: string | null) => void;
  onDeleteAve: (id: string) => void;
  onImportAves: (avesData: Array<Omit<Ave, 'id'>>) => number;
  onPhotoClick?: (photoUrl: string) => void;
  onViewDetails?: (aveId: string) => void;
}

export function AvesSection({
  aves,
  ninhos,
  config,
  onOpenModal,
  onDeleteAve,
  onImportAves,
  onPhotoClick,
  onViewDetails
}: AvesSectionProps) {
  const [busca, setBusca] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroSexo, setFiltroSexo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCorCabeca, setFiltroCorCabeca] = useState('');
  const [filtroCorPeito, setFiltroCorPeito] = useState('');
  const [filtroCorDorso, setFiltroCorDorso] = useState('');
  const [filtroPorta, setFiltroPorta] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const inputImportacaoRef = useRef<HTMLInputElement | null>(null);
  const [importandoPlanilha, setImportandoPlanilha] = useState(false);

  const handleImportarPlanilha = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const arquivo = event.target.files?.[0];

    event.target.value = '';

    if (!arquivo) {
      return;
    }

    if (!arquivo.name.toLowerCase().endsWith('.xlsx')) {
      window.alert('Selecione um arquivo Excel no formato .xlsx.');
      return;
    }

    try {
      setImportandoPlanilha(true);

      const resultado = await importarPlanilhaAves(arquivo);

      if (resultado.aves.length > 0) {
        onImportAves(resultado.aves);
      }

      let mensagem = `${resultado.aves.length} ave(s) importada(s) com sucesso.`;

      if (resultado.linhasIgnoradas > 0) {
        mensagem += `\n${resultado.linhasIgnoradas} linha(s) ignorada(s).`;
      }

      if (resultado.erros.length > 0) {
        mensagem += `\n\nDetalhes:\n${resultado.erros.slice(0, 5).join('\n')}`;

        if (resultado.erros.length > 5) {
          mensagem += `\n... e mais ${resultado.erros.length - 5} erro(s).`;
        }
      }

      window.alert(mensagem);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível importar a planilha.';

      window.alert(mensagem);
    } finally {
      setImportandoPlanilha(false);
    }
  };

  const especies = useMemo(
    () =>
      Array.from(
        new Set(
          aves
            .map(ave => ave.species)
            .filter(Boolean)
        )
      ).sort(),
    [aves]
  );

  const sexos = useMemo(
    () =>
      Array.from(
        new Set(
          aves
            .map(ave => ave.sex)
            .filter(Boolean)
        )
      ).sort(),
    [aves]
  );

  const status = useMemo(
    () =>
      Array.from(
        new Set(
          aves
            .map(ave => ave.status)
            .filter(Boolean)
        )
      ).sort(),
    [aves]
  );

  const coresCabeca = useMemo(
    () =>
      Array.from(
        new Set(
          aves
            .map(ave => ave.corCabeca)
            .filter(Boolean)
        )
      ).sort(),
    [aves]
  );

  const coresPeito = useMemo(
    () =>
      Array.from(
        new Set(
          aves
            .map(ave => ave.corPeito)
            .filter(Boolean)
        )
      ).sort(),
    [aves]
  );

  const coresDorso = useMemo(
    () =>
      Array.from(
        new Set(
          aves
            .map(ave => ave.corDorso)
            .filter(Boolean)
        )
      ).sort(),
    [aves]
  );

  const portas = useMemo(
    () =>
      Array.from(
        new Set(
          aves
            .map(ave => ave.porta)
            .filter(Boolean)
        )
      ).sort(),
    [aves]
  );

  const locais = useMemo(() => {
    const locaisCadastrados = config?.locaisOvos || [];
    const locaisDasAves = aves
      .map(ave => obterLocalAve(ave, ninhos))
      .filter(local => local && local !== 'Não informado');

    return Array.from(new Set([...locaisCadastrados, ...locaisDasAves])).sort();
  }, [config?.locaisOvos, aves, ninhos]);

  const avesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return aves.filter(ave => {
      const correspondeBusca =
        !termo ||
        [
          ave.species,
          ave.ring,
          ave.name,
          ave.sex,
          ave.status,
          ave.creator,
          ave.ringYear,
          ave.acqYear,
          ave.corCabeca,
          ave.corPeito,
          ave.corDorso,
          ave.nota,
          ave.porta,
          (ave as any).localAtual,
          (ave as any).local,
          (ave as any).location,
          (ave as any).localSaidaNinho
        ]
          .filter(value => value !== undefined && value !== null)
          .some(value =>
            String(value).toLowerCase().includes(termo)
          );

      const correspondeEspecie =
        !filtroEspecie || ave.species === filtroEspecie;

      const correspondeSexo =
        !filtroSexo || ave.sex === filtroSexo;

      const correspondeStatus =
        !filtroStatus || ave.status === filtroStatus;

      const correspondeCorCabeca =
        !filtroCorCabeca || ave.corCabeca === filtroCorCabeca;

      const correspondeCorPeito =
        !filtroCorPeito || ave.corPeito === filtroCorPeito;

      const correspondeCorDorso =
        !filtroCorDorso || ave.corDorso === filtroCorDorso;

      const correspondePorta =
        !filtroPorta || ave.porta === filtroPorta;

      const correspondeLocal =
        !filtroLocal || obterLocalAve(ave, ninhos) === filtroLocal;

      return (
        correspondeBusca &&
        correspondeEspecie &&
        correspondeSexo &&
        correspondeStatus &&
        correspondeCorCabeca &&
        correspondeCorPeito &&
        correspondeCorDorso &&
        correspondePorta &&
        correspondeLocal
      );
    });
  }, [
    aves,
    ninhos,
    busca,
    filtroEspecie,
    filtroSexo,
    filtroStatus,
    filtroCorCabeca,
    filtroCorPeito,
    filtroCorDorso,
    filtroPorta,
    filtroLocal
  ]);

  const quantidadeFiltrosAtivos = [
    filtroEspecie,
    filtroSexo,
    filtroStatus,
    filtroCorCabeca,
    filtroCorPeito,
    filtroCorDorso,
    filtroPorta,
    filtroLocal
  ].filter(Boolean).length;

  function limparFiltros() {
    setBusca('');
    setFiltroEspecie('');
    setFiltroSexo('');
    setFiltroStatus('');
    setFiltroCorCabeca('');
    setFiltroCorPeito('');
    setFiltroCorDorso('');
    setFiltroPorta('');
    setFiltroLocal('');
  }

  function formatarSexo(sexo?: string) {
    if (!sexo) return '-';

    const mapa: Record<string, string> = {
      macho: 'Macho',
      fêmea: 'Fêmea',
      femea: 'Fêmea',
      indefinido: 'Indefinido'
    };

    return mapa[sexo.toLowerCase()] || sexo;
  }

  function simboloSexo(sexo?: string) {
    const sexoNormalizado = sexo?.trim().toLowerCase();

    if (sexoNormalizado === 'macho') {
      return '♂';
    }

    if (sexoNormalizado === 'fêmea' || sexoNormalizado === 'femea') {
      return '♀';
    }

    return '—';
  }

  function formatarStatus(statusAve?: string) {
    if (!statusAve) return '-';

    const mapa: Record<string, string> = {
      ativo: 'Ativo',
      vendido: 'Vendido',
      falecido: 'Falecido',
      doado: 'Doado',
      perdido: 'Perdido',
      inativo: 'Inativo'
    };

    return mapa[statusAve.toLowerCase()] || statusAve;
  }

  function obterLocalAve(ave: Ave, listaNinhos: Ninho[] = []) {
    const aveAny = ave as Ave & {
      localAtual?: string;
      local?: string;
      location?: string;
      localSaidaNinho?: string;
      localCriacao?: string;
      localAlojamento?: string;
    };

    const localDireto = [
      aveAny.localAtual,
      aveAny.localSaidaNinho,
      aveAny.localCriacao,
      aveAny.localAlojamento,
      aveAny.location,
      aveAny.local
    ].find(valor => {
      if (!valor) return false;

      const valorNormalizado = String(valor).trim().toLowerCase();

      return (
        valorNormalizado !== 'ninho' &&
        valorNormalizado !== 'caixa' &&
        valorNormalizado !== 'não informado' &&
        valorNormalizado !== 'nao informado'
      );
    });

    if (localDireto) {
      return String(localDireto).trim();
    }

    // Filhotes originados de ovos podem não possuir o local gravado
    // diretamente no registro da ave. Nesse caso, recuperamos o ovo
    // correspondente pelo filhoteId, anilha ou ano da anilha.
    for (const ninho of listaNinhos) {
      const ovo = ninho.eggs?.find(egg => {
        const eggAny = egg as typeof egg & {
          localSaidaNinho?: string;
          localAtual?: string;
          location?: string;
          localCriacao?: string;
          localAlojamento?: string;
        };

        const correspondePorId =
          eggAny.filhoteId === ave.id ||
          (ave.birthNestId && ninho.id === ave.birthNestId);

        const correspondePorAnilha =
          Boolean(ave.ring) &&
          eggAny.anilha === ave.ring &&
          (!ave.ringYear ||
            !eggAny.anoAnilha ||
            eggAny.anoAnilha === ave.ringYear);

        return correspondePorId || correspondePorAnilha;
      });

      if (ovo) {
        const ovoAny = ovo as typeof ovo & {
          localSaidaNinho?: string;
          localAtual?: string;
          location?: string;
          localCriacao?: string;
          localAlojamento?: string;
        };

        const localOvo = [
          ovoAny.localSaidaNinho,
          ovoAny.localAtual,
          ovoAny.localCriacao,
          ovoAny.localAlojamento,
          ovoAny.location
        ].find(valor => {
          if (!valor) return false;

          const valorNormalizado = String(valor).trim().toLowerCase();

          return (
            valorNormalizado !== 'ninho' &&
            valorNormalizado !== 'caixa' &&
            valorNormalizado !== 'não informado' &&
            valorNormalizado !== 'nao informado'
          );
        });

        if (localOvo) {
          return localOvo;
        }

        if (ovo.status === 'Eclodido' || ovo.filhoteAnilhado) {
          return ninho.name || `Ninho ${ninho.id}`;
        }
      }
    }

    // "ninho" e "caixa" são classificações do ovo, não locais físicos.
    const localSemantico = (aveAny.local || '').trim();
    if (
      localSemantico &&
      localSemantico.toLowerCase() !== 'ninho' &&
      localSemantico.toLowerCase() !== 'caixa'
    ) {
      return localSemantico;
    }

    return 'Não informado';
  }

  function obterClasseStatus(statusAve?: string) {
    const statusNormalizado = statusAve?.toLowerCase();

    if (statusNormalizado === 'ativo') {
      return 'bg-emerald-100 text-emerald-700';
    }

    if (statusNormalizado === 'vendido') {
      return 'bg-blue-100 text-blue-700';
    }

    if (statusNormalizado === 'falecido') {
      return 'bg-red-100 text-red-700';
    }

    if (statusNormalizado === 'doado') {
      return 'bg-purple-100 text-purple-700';
    }

    if (statusNormalizado === 'perdido') {
      return 'bg-orange-100 text-orange-700';
    }

    return 'bg-slate-100 text-slate-600';
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            Plantel de Aves
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Gerencie, consulte e exporte os registros do seu plantel.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMostrarFiltros(value => !value)}
            className={`px-4 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 transition ${
              mostrarFiltros || quantidadeFiltrosAtivos > 0
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-filter"></i>
            FILTROS

            {quantidadeFiltrosAtivos > 0 && (
              <span className="bg-white text-slate-800 rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {quantidadeFiltrosAtivos}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenModal('ave')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 transition"
          >
            <i className="fas fa-plus"></i>
            ADICIONAR AVE
          </button>

          <button
            type="button"
            onClick={() => inputImportacaoRef.current?.click()}
            disabled={importandoPlanilha}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 transition"
          >
            <i className={importandoPlanilha ? 'fas fa-spinner fa-spin' : 'fas fa-file-import'}></i>
            {importandoPlanilha ? 'IMPORTANDO...' : 'IMPORTAR PLANILHA'}
          </button>

          <input
            ref={inputImportacaoRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleImportarPlanilha}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => gerarPlanilhaAves(aves, config)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 transition"
          >
            <i className="fas fa-file-excel"></i>
            GERAR PLANILHA
          </button>

          <button
            type="button"
            onClick={() => gerarPlanilhaModeloAves(config, 200, aves)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 transition"
          >
            <i className="fas fa-file-download"></i>
            BAIXAR MODELO
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>

          <input
            type="text"
            value={busca}
            onChange={event => setBusca(event.target.value)}
            placeholder="Buscar por espécie, anilha, nome, sexo, status, criador..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              <select
                value={filtroEspecie}
                onChange={event => setFiltroEspecie(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas as espécies</option>

                {especies.map(especie => (
                  <option key={especie} value={especie}>
                    {especie}
                  </option>
                ))}
              </select>

              <select
                value={filtroSexo}
                onChange={event => setFiltroSexo(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos os sexos</option>

                {sexos.map(sexo => (
                  <option key={sexo} value={sexo}>
                    {formatarSexo(sexo)}
                  </option>
                ))}
              </select>

              <select
                value={filtroStatus}
                onChange={event => setFiltroStatus(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos os status</option>

                {status.map(statusAve => (
                  <option key={statusAve} value={statusAve}>
                    {formatarStatus(statusAve)}
                  </option>
                ))}
              </select>

              <select
                value={filtroCorCabeca}
                onChange={event => setFiltroCorCabeca(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Cor da cabeça</option>

                {coresCabeca.map(cor => (
                  <option key={cor} value={cor}>
                    {cor}
                  </option>
                ))}
              </select>

              <select
                value={filtroCorPeito}
                onChange={event => setFiltroCorPeito(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Cor do peito</option>

                {coresPeito.map(cor => (
                  <option key={cor} value={cor}>
                    {cor}
                  </option>
                ))}
              </select>

              <select
                value={filtroCorDorso}
                onChange={event => setFiltroCorDorso(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Cor do dorso</option>

                {coresDorso.map(cor => (
                  <option key={cor} value={cor}>
                    {cor}
                  </option>
                ))}
              </select>

              <select
                value={filtroPorta}
                onChange={event => setFiltroPorta(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas as portas</option>

                {portas.map(porta => (
                  <option key={porta} value={porta}>
                    {porta}
                  </option>
                ))}
              </select>

              <select
                value={filtroLocal}
                onChange={event => setFiltroLocal(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos os locais</option>

                {locais.map(local => (
                  <option key={local} value={local}>
                    {local}
                  </option>
                ))}
              </select>
            </div>

            {quantidadeFiltrosAtivos > 0 && (
              <button
                type="button"
                onClick={limparFiltros}
                className="mt-3 text-xs font-bold text-red-600 hover:text-red-700"
              >
                <i className="fas fa-times mr-1"></i>
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500">
          Exibindo {avesFiltradas.length} de {aves.length} aves
        </p>

        {avesFiltradas.length > 0 && (
          <p className="text-xs text-slate-400">
            Clique em uma ave para visualizar os detalhes
          </p>
        )}
      </div>

      {avesFiltradas.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-16 px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <i className="fas fa-dove text-2xl text-slate-400"></i>
          </div>

          <h3 className="text-lg font-black text-slate-700">
            {aves.length === 0
              ? 'Nenhuma ave cadastrada'
              : 'Nenhuma ave encontrada'}
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            {aves.length === 0
              ? 'Comece cadastrando a primeira ave do seu plantel.'
              : 'Tente alterar os filtros ou o termo de busca.'}
          </p>

          {aves.length === 0 && (
            <button
              type="button"
              onClick={() => onOpenModal('ave')}
              className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black text-xs"
            >
              <i className="fas fa-plus mr-2"></i>
              CADASTRAR PRIMEIRA AVE
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left">
              <colgroup>
                <col className="w-[38%]" />
                <col className="w-[7%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[17%]" />
                <col className="w-[8%]" />
              </colgroup>

              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-2 sm:px-3 py-3 text-[9px] sm:text-[10px] font-black uppercase text-slate-500">
                    Ave
                  </th>

                  <th className="px-2 sm:px-3 py-3 text-[9px] sm:text-[10px] font-black uppercase text-slate-500">
                    Sexo
                  </th>

                  <th className="px-2 sm:px-3 py-3 text-[9px] sm:text-[10px] font-black uppercase text-slate-500">
                    Status
                  </th>

                  <th className="px-2 sm:px-3 py-3 text-[9px] sm:text-[10px] font-black uppercase text-slate-500">
                    Cores
                  </th>

                  <th className="px-2 sm:px-3 py-3 text-[9px] sm:text-[10px] font-black uppercase text-slate-500">
                    Local
                  </th>

                  <th className="px-1 sm:px-2 py-3 text-[9px] sm:text-[10px] font-black uppercase text-slate-500 text-center">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {avesFiltradas.map(ave => (
                  <tr
                    key={ave.id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-2 sm:px-3 py-3 align-middle">
                      <button
                        type="button"
                        onClick={() => onViewDetails?.(ave.id)}
                        className="flex items-center gap-2 text-left min-w-0 w-full"
                      >
                        <div
                          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                          onClick={event => {
                            event.stopPropagation();
                            if (ave.photo) {
                              onPhotoClick?.(ave.photo);
                            }
                          }}
                          title={
                            ave.photo
                              ? 'Clique para ampliar a foto'
                              : 'Representação visual das cores da ave'
                          }
                        >
                          {ave.photo ? (
                            <img
                              src={ave.photo}
                              alt={ave.name || ave.ring || 'Foto da ave'}
                              className="w-full h-full object-cover"
                              onError={event => {
                                event.currentTarget.style.display = 'none';
                                event.currentTarget.parentElement?.classList.add(
                                  'bg-emerald-50'
                                );
                              }}
                            />
                          ) : (
                            <BirdColorDiagram
                              corCabeca={ave.corCabeca}
                              corPeito={ave.corPeito}
                              corDorso={ave.corDorso}
                              className="w-full h-full"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-black text-xs sm:text-sm text-slate-800 truncate">
                            {ave.name || 'Sem nome'}
                          </p>

                          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                            {ave.species || '-'}
                          </p>
                        </div>
                      </button>
                    </td>

                    <td className="px-1 sm:px-2 py-3 text-center align-middle">
                      <span
                        className={`inline-flex items-center justify-center text-lg font-black leading-none ${
                          ave.sex?.trim().toLowerCase() === 'macho'
                            ? 'text-blue-500'
                            : ave.sex?.trim().toLowerCase() === 'fêmea' ||
                                ave.sex?.trim().toLowerCase() === 'femea'
                              ? 'text-pink-500'
                              : 'text-slate-400'
                        }`}
                        title={`Sexo: ${formatarSexo(ave.sex)}`}
                        aria-label={`Sexo: ${formatarSexo(ave.sex)}`}
                      >
                        {simboloSexo(ave.sex)}
                      </span>
                    </td>

                    <td className="px-2 sm:px-3 py-3 align-middle">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-black ${obterClasseStatus(
                          ave.status
                        )}`}
                      >
                        {formatarStatus(ave.status)}
                      </span>
                    </td>

                    <td className="px-2 sm:px-3 py-3 align-middle">
                      <div className="text-[9px] sm:text-[10px] text-slate-500 leading-4 break-words">
                          <p>
                            <strong>C:</strong>{' '}
                            {ave.corCabeca || '-'}
                          </p>

                          <p>
                            <strong>P:</strong>{' '}
                            {ave.corPeito || '-'}
                          </p>

                          <p>
                            <strong>D:</strong>{' '}
                            {ave.corDorso || '-'}
                          </p>
                        </div>
                    </td>

                    <td className="px-2 sm:px-3 py-3 align-middle">
                      <span className="inline-flex max-w-full px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[9px] sm:text-[10px] font-bold break-words">
                        {obterLocalAve(ave, ninhos)}
                      </span>
                    </td>

                    <td className="px-0.5 sm:px-1 py-2 align-middle">
                      <div className="flex flex-col items-center justify-center gap-0">
                        <button
                          type="button"
                          onClick={() => onViewDetails?.(ave.id)}
                          title="Visualizar detalhes"
                          className="w-6 h-5 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                        >
                          <i className="fas fa-eye text-xs"></i>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenModal('ave', ave.id)}
                          title="Editar ave"
                          className="w-6 h-5 rounded-md flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition"
                        >
                          <i className="fas fa-pen text-xs"></i>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteAve(ave.id)}
                          title="Excluir ave"
                          className="w-6 h-5 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
