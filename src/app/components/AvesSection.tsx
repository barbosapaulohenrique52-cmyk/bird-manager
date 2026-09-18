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
  onUpdateAvesBatch?: (ids: string[], updates: Partial<Ave>) => void;
  onPhotoClick?: (photoUrl: string) => void;
  onViewDetails?: (aveId: string) => void;
}

interface CheckboxFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  formatOption?: (value: string) => string;
  allLabel?: string;
  specialOption?: { value: string; label: string };
}

function CheckboxFilter({
  label,
  options,
  selected,
  onChange,
  formatOption = value => value,
  allLabel = 'Todos',
  specialOption
}: CheckboxFilterProps) {
  const [aberto, setAberto] = useState(false);
  const isAll = selected.length === 0;

  function alternarOpcao(value: string) {
    if (specialOption && value === specialOption.value) {
      onChange([specialOption.value]);
      return;
    }

    const semEspecial = specialOption
      ? selected.filter(item => item !== specialOption.value)
      : selected;

    const novosValores = semEspecial.includes(value)
      ? semEspecial.filter(item => item !== value)
      : [...semEspecial, value];

    onChange(novosValores);
  }

  function selecionarTodos() {
    onChange([]);
  }

  const quantidadeSelecionada = specialOption && selected.includes(specialOption.value)
    ? 0
    : selected.length;

  const textoResumo = specialOption && selected.includes(specialOption.value)
    ? specialOption.label
    : isAll
      ? allLabel
      : `${quantidadeSelecionada} sel.`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto(value => !value)}
        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all flex items-center justify-between gap-2 shadow-sm"
      >
        <span className="truncate">
          <strong className="text-slate-900 font-semibold">{label}:</strong> {textoResumo}
        </span>
        <i className={`fas fa-chevron-${aberto ? 'up' : 'down'} text-[10px] text-slate-400 shrink-0 transition-transform`}></i>
      </button>

      {aberto && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-2 max-h-64 overflow-y-auto min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-150">
          <label className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 cursor-pointer border-b border-slate-100 mb-1 transition-colors">
            <input
              type="checkbox"
              checked={isAll}
              onChange={selecionarTodos}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800">{allLabel}</span>
          </label>

          {specialOption && (
            <label className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selected.includes(specialOption.value)}
                onChange={() => alternarOpcao(specialOption.value)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700">{specialOption.label}</span>
            </label>
          )}

          {options.map(option => (
            <label key={option} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => alternarOpcao(option)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700">{formatOption(option)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function AvesSection({
  aves,
  ninhos,
  config,
  onOpenModal,
  onDeleteAve,
  onImportAves,
  onUpdateAvesBatch,
  onPhotoClick,
  onViewDetails
}: AvesSectionProps) {
  const [busca, setBusca] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filtroEspecie, setFiltroEspecie] = useState<string[]>([]);
  const [filtroSexo, setFiltroSexo] = useState<string[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string[]>(['__NAO_FALECIDAS__']);
  const [filtroCorCabeca, setFiltroCorCabeca] = useState<string[]>([]);
  const [filtroCorPeito, setFiltroCorPeito] = useState<string[]>([]);
  const [filtroCorDorso, setFiltroCorDorso] = useState<string[]>([]);
  const [filtroPorta, setFiltroPorta] = useState<string[]>([]);
  const [filtroLocal, setFiltroLocal] = useState<string[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const inputImportacaoRef = useRef<HTMLInputElement | null>(null);
  const [importandoPlanilha, setImportandoPlanilha] = useState(false);
  const [avesSelecionadas, setAvesSelecionadas] = useState<string[]>([]);
  const [mostrarEdicaoLote, setMostrarEdicaoLote] = useState(false);
  const [camposLote, setCamposLote] = useState({
    species: '',
    sex: '',
    status: '',
    corCabeca: '',
    corPeito: '',
    corDorso: '',
    porta: '',
    local: '',
    creator: '',
    acqYear: '',
    nota: ''
  });

  const handleImportarPlanilha = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const arquivo = event.target.files?.[0];
    event.target.value = '';

    if (!arquivo) return;

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
    () => Array.from(new Set(aves.map(ave => ave.species).filter(Boolean))).sort(),
    [aves]
  );

  const sexos = useMemo(
    () => Array.from(new Set(aves.map(ave => ave.sex).filter(Boolean))).sort(),
    [aves]
  );

  const status = useMemo(
    () => Array.from(new Set(aves.map(ave => ave.status).filter(Boolean))).sort(),
    [aves]
  );

  const coresCabeca = useMemo(
    () => Array.from(new Set(aves.map(ave => ave.corCabeca).filter(Boolean))).sort(),
    [aves]
  );

  const coresPeito = useMemo(
    () => Array.from(new Set(aves.map(ave => ave.corPeito).filter(Boolean))).sort(),
    [aves]
  );

  const coresDorso = useMemo(
    () => Array.from(new Set(aves.map(ave => ave.corDorso).filter(Boolean))).sort(),
    [aves]
  );

  const portas = useMemo(
    () => Array.from(new Set(aves.map(ave => ave.porta).filter(Boolean))).sort(),
    [aves]
  );

  const locais = useMemo(() => {
    const locaisCadastrados = config?.locaisOvos || [];
    const locaisDasAves = aves.map(ave => obterLocalAve(ave, ninhos)).filter(Boolean);
    const existeLocalNaoInformado = aves.some(
      ave => obterLocalAve(ave, ninhos) === 'Não informado'
    );

    const locaisDisponiveis = [
      ...locaisCadastrados,
      ...locaisDasAves,
      ...(existeLocalNaoInformado ? ['Não informado'] : [])
    ];

    return Array.from(new Set(locaisDisponiveis))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
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
          .some(value => String(value).toLowerCase().includes(termo));

      const correspondeEspecie =
        filtroEspecie.length === 0 || filtroEspecie.includes(ave.species || '');

      const correspondeSexo =
        filtroSexo.length === 0 || filtroSexo.includes(ave.sex || '');

      const statusNormalizado = String(ave.status || '').trim().toLowerCase();
      const eFalecida = ['óbito', 'obito', 'falecido', 'falecida', 'morto', 'morta'].includes(statusNormalizado);
      const correspondeStatus =
        filtroStatus.length === 0
          ? true
          : filtroStatus.includes('__NAO_FALECIDAS__')
            ? !eFalecida
            : filtroStatus.some(valor => String(ave.status || '').trim().toLowerCase() === valor.trim().toLowerCase());

      const correspondeCorCabeca =
        filtroCorCabeca.length === 0 || filtroCorCabeca.includes(ave.corCabeca || '');

      const correspondeCorPeito =
        filtroCorPeito.length === 0 || filtroCorPeito.includes(ave.corPeito || '');

      const correspondeCorDorso =
        filtroCorDorso.length === 0 || filtroCorDorso.includes(ave.corDorso || '');

      const correspondePorta =
        filtroPorta.length === 0 || filtroPorta.includes(ave.porta || '');

      const correspondeLocal =
        filtroLocal.length === 0 || filtroLocal.includes(obterLocalAve(ave, ninhos));

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
    filtroStatus.length === 1 && filtroStatus[0] === '__NAO_FALECIDAS__' ? [] : filtroStatus,
    filtroCorCabeca,
    filtroCorPeito,
    filtroCorDorso,
    filtroPorta,
    filtroLocal
  ].filter(values => values.length > 0).length;

  function limparFiltros() {
    setBusca('');
    setFiltroEspecie([]);
    setFiltroSexo([]);
    setFiltroStatus(['__NAO_FALECIDAS__']);
    setFiltroCorCabeca([]);
    setFiltroCorPeito([]);
    setFiltroCorDorso([]);
    setFiltroPorta([]);
    setFiltroLocal([]);
  }

  const todasFiltradasSelecionadas =
    avesFiltradas.length > 0 &&
    avesFiltradas.every(ave => avesSelecionadas.includes(ave.id));

  function alternarSelecaoAve(id: string) {
    setAvesSelecionadas(selecionadas =>
      selecionadas.includes(id)
        ? selecionadas.filter(aveId => aveId !== id)
        : [...selecionadas, id]
    );
  }

  function alternarSelecaoTodasFiltradas() {
    if (todasFiltradasSelecionadas) {
      const idsFiltrados = new Set(avesFiltradas.map(ave => ave.id));
      setAvesSelecionadas(selecionadas =>
        selecionadas.filter(id => !idsFiltrados.has(id))
      );
      return;
    }

    setAvesSelecionadas(selecionadas => [
      ...new Set([...selecionadas, ...avesFiltradas.map(ave => ave.id)])
    ]);
  }

  function atualizarCampoLote(campo: keyof typeof camposLote, valor: string) {
    setCamposLote(prev => ({ ...prev, [campo]: valor }));
  }

  function aplicarEdicaoEmLote() {
    if (!onUpdateAvesBatch) {
      window.alert('A edição em lote ainda não está conectada ao banco de dados.');
      return;
    }

    if (avesSelecionadas.length === 0) {
      window.alert('Selecione pelo menos uma ave.');
      return;
    }

    const updates: Record<string, string> = {};

    Object.entries(camposLote).forEach(([campo, valor]) => {
      if (valor !== '') {
        updates[campo] = valor;
      }
    });

    if (Object.keys(updates).length === 0) {
      window.alert('Escolha pelo menos um campo para alterar.');
      return;
    }

    if (updates.local === 'Não informado') {
      updates.local = 'Não informado';
      updates.localAtual = 'Não informado';
    }

    const confirmar = window.confirm(
      `Aplicar as alterações em ${avesSelecionadas.length} ave(s)?`
    );

    if (!confirmar) return;

    onUpdateAvesBatch(avesSelecionadas, updates as Partial<Ave>);
    setAvesSelecionadas([]);
    setMostrarEdicaoLote(false);
    setCamposLote({
      species: '',
      sex: '',
      status: '',
      corCabeca: '',
      corPeito: '',
      corDorso: '',
      porta: '',
      local: '',
      creator: '',
      acqYear: '',
      nota: ''
    });
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
    if (sexoNormalizado === 'macho') return '♂';
    if (sexoNormalizado === 'fêmea' || sexoNormalizado === 'femea') return '♀';
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

    if (localDireto) return String(localDireto).trim();

    for (const ninho of listaNinhos) {
      const ovo = ninho.eggs?.find(egg => {
        const eggAny = egg as typeof egg & {
          local?: string;
          localSaidaNinho?: string;
          localAtual?: string;
          location?: string;
          localCriacao?: string;
          localAlojamento?: string;
        };

        const normalizar = (valor: unknown) =>
          String(valor ?? '').trim().toLowerCase().replace(/\s+/g, '');

        const correspondePorId =
          Boolean(eggAny.filhoteId) && eggAny.filhoteId === ave.id;

        const correspondePorAnilha =
          Boolean(ave.ring) &&
          Boolean(eggAny.anilha) &&
          normalizar(eggAny.anilha) === normalizar(ave.ring) &&
          (!ave.ringYear ||
            !eggAny.anoAnilha ||
            normalizar(eggAny.anoAnilha) === normalizar(ave.ringYear));

        return correspondePorId || correspondePorAnilha;
      });

      if (ovo) {
        const ovoAny = ovo as typeof ovo & {
          local?: string;
          localSaidaNinho?: string;
          localAtual?: string;
          location?: string;
          localCriacao?: string;
          localAlojamento?: string;
        };

        const localOvo = [
          ovoAny.localSaidaNinho,
          ovoAny.local,
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

        if (localOvo) return localOvo;
      }
    }

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
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
    }
    if (statusNormalizado === 'vendido') {
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
    }
    if (statusNormalizado === 'falecido') {
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20';
    }
    if (statusNormalizado === 'doado') {
      return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20';
    }
    if (statusNormalizado === 'perdido') {
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
    }

    return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  }

  return (
    <section className="space-y-6 pb-12">
      {/* topo: Titulo e Botoes de Acao */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Plantel de Aves
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie o plantel, registros de genotipagem e histórico do criatório.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMostrarFiltros(value => !value)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 border ${
              mostrarFiltros || quantidadeFiltrosAtivos > 0
                ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/10'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-sliders-h text-sm"></i>
            <span>Filtros</span>
            {quantidadeFiltrosAtivos > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {quantidadeFiltrosAtivos}
              </span>
            )}
          </button>

          {avesSelecionadas.length > 0 && (
            <button
              type="button"
              onClick={() => setMostrarEdicaoLote(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm shadow-violet-600/20"
            >
              <i className="fas fa-layer-group"></i>
              <span>Editar ({avesSelecionadas.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenModal('ave')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/20"
          >
            <i className="fas fa-plus text-sm"></i>
            <span>Adicionar Ave</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

          <button
            type="button"
            onClick={() => inputImportacaoRef.current?.click()}
            disabled={importandoPlanilha}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            title="Importar planilha de aves"
          >
            <i className={importandoPlanilha ? 'fas fa-spinner fa-spin text-emerald-600' : 'fas fa-file-import text-indigo-600'}></i>
            <span className="hidden sm:inline">{importandoPlanilha ? 'Importando...' : 'Importar'}</span>
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
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            title="Exportar planilha completa"
          >
            <i className="fas fa-file-excel text-emerald-600"></i>
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <button
            type="button"
            onClick={() => gerarPlanilhaModeloAves(config, 200, aves)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            title="Baixar modelo em Excel"
          >
            <i className="fas fa-download text-amber-500"></i>
            <span className="hidden sm:inline">Modelo</span>
          </button>
        </div>
      </div>

      {/* Busca e painel de Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={busca}
            onChange={event => setBusca(event.target.value)}
            placeholder="Buscar por espécie, anilha, nome, sexo, status, criador..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-800 placeholder-slate-400 transition-all"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {mostrarFiltros && (
          <div className="pt-4 border-t border-slate-100 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
              <CheckboxFilter
                label="Espécie"
                options={especies}
                selected={filtroEspecie}
                onChange={setFiltroEspecie}
                allLabel="Todas"
              />
              <CheckboxFilter
                label="Sexo"
                options={sexos}
                selected={filtroSexo}
                onChange={setFiltroSexo}
                formatOption={formatarSexo}
                allLabel="Todos"
              />
              <CheckboxFilter
                label="Status"
                options={status}
                selected={filtroStatus}
                onChange={setFiltroStatus}
                formatOption={formatarStatus}
                allLabel="Todos"
                specialOption={{ value: '__NAO_FALECIDAS__', label: 'Não falecidas' }}
              />
              <CheckboxFilter
                label="Cabeça"
                options={coresCabeca}
                selected={filtroCorCabeca}
                onChange={setFiltroCorCabeca}
                allLabel="Todas"
              />
              <CheckboxFilter
                label="Peito"
                options={coresPeito}
                selected={filtroCorPeito}
                onChange={setFiltroCorPeito}
                allLabel="Todas"
              />
              <CheckboxFilter
                label="Dorso"
                options={coresDorso}
                selected={filtroCorDorso}
                onChange={setFiltroCorDorso}
                allLabel="Todas"
              />
              <CheckboxFilter
                label="Porta"
                options={portas}
                selected={filtroPorta}
                onChange={setFiltroPorta}
                allLabel="Todas"
              />
              <CheckboxFilter
                label="Local"
                options={locais}
                selected={filtroLocal}
                onChange={setFiltroLocal}
                allLabel="Todos"
              />
            </div>

            {quantidadeFiltrosAtivos > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <i className="fas fa-trash-alt text-[10px]"></i>
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bar de status de resultados & Alternador de Visualização */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold text-slate-500">
            Exibindo <span className="text-slate-900 font-bold">{avesFiltradas.length}</span> de <span className="text-slate-900 font-bold">{aves.length}</span> aves
          </p>
          {avesSelecionadas.length > 0 && (
            <button
              type="button"
              onClick={() => setAvesSelecionadas([])}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 px-2.5 py-1 rounded-md transition-colors"
            >
              Limpar seleção ({avesSelecionadas.length})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-200/60 p-0.5 rounded-lg flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em tabela"
            >
              <i className="fas fa-list text-[10px]"></i>
              <span className="hidden sm:inline">Tabela</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em cards"
            >
              <i className="fas fa-th-large text-[10px]"></i>
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estado Vazio */}
      {avesFiltradas.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-16 px-6 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600">
            <i className="fas fa-dove text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {aves.length === 0 ? 'Nenhuma ave cadastrada' : 'Nenhuma ave encontrada'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {aves.length === 0
              ? 'Comece cadastrando a primeira ave do seu plantel para acompanhar a genealogia e postura.'
              : 'Nenhum registro atende aos critérios dos filtros ou busca aplicados.'}
          </p>
          {aves.length === 0 ? (
            <button
              type="button"
              onClick={() => onOpenModal('ave')}
              className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Cadastrar primeira ave
            </button>
          ) : (
            <button
              type="button"
              onClick={limparFiltros}
              className="mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-2"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* VISUALIZAÇÃO EM CARDS (GRID VIEW) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {avesFiltradas.map(ave => (
            <div
              key={ave.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-md relative group ${
                avesSelecionadas.includes(ave.id)
                  ? 'border-violet-500 ring-2 ring-violet-500/20 bg-violet-50/10'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={avesSelecionadas.includes(ave.id)}
                      onChange={() => alternarSelecaoAve(ave.id)}
                      className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
                    />
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${obterClasseStatus(ave.status)}`}>
                      {formatarStatus(ave.status)}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      ave.sex?.trim().toLowerCase() === 'macho'
                        ? 'bg-blue-50 text-blue-600'
                        : ave.sex?.trim().toLowerCase() === 'fêmea' || ave.sex?.trim().toLowerCase() === 'femea'
                          ? 'bg-pink-50 text-pink-600'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                    title={`Sexo: ${formatarSexo(ave.sex)}`}
                  >
                    {simboloSexo(ave.sex)}
                  </span>
                </div>

                {/* Body Card com Avatar */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      if (ave.photo) onPhotoClick?.(ave.photo);
                      else onViewDetails?.(ave.id);
                    }}
                  >
                    {ave.photo ? (
                      <img
                        src={ave.photo}
                        alt={ave.name || ave.ring || 'Foto'}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.currentTarget.style.display = 'none';
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

                  <div className="min-w-0 flex-1">
                    <h4
                      onClick={() => onViewDetails?.(ave.id)}
                      className="font-bold text-sm text-slate-900 truncate hover:text-emerald-600 cursor-pointer transition-colors"
                      title={ave.name || ave.ring || 'Sem nome'}
                    >
                      {ave.name || ave.ring || 'Sem nome'}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{ave.species || 'Espécie não informada'}</p>
                    {ave.ring && <p className="text-[10px] font-mono font-medium text-slate-400 mt-0.5">Anilha: {ave.ring}</p>}
                  </div>
                </div>

                {/* Cores e Local */}
                <div className="bg-slate-50/80 rounded-xl p-2.5 space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">C/P/D:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[120px]" title={`${ave.corCabeca || '-'}/${ave.corPeito || '-'}/${ave.corDorso || '-'}`}>
                      {ave.corCabeca || '-'}/{ave.corPeito || '-'}/{ave.corDorso || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Local:</span>
                    <span className="font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200/60 truncate max-w-[120px]">
                      {obterLocalAve(ave, ninhos)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Ações */}
              <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-around">
                <button
                  type="button"
                  onClick={() => onViewDetails?.(ave.id)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-all"
                  title="Detalhes"
                >
                  <i className="fas fa-eye text-xs"></i>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenModal('ave', ave.id)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                  title="Editar"
                >
                  <i className="fas fa-pen text-xs"></i>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteAve(ave.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                  title="Excluir"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISUALIZAÇÃO EM TABELA (TABLE VIEW) */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="p-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={todasFiltradasSelecionadas}
                      onChange={alternarSelecaoTodasFiltradas}
                      aria-label="Selecionar todas"
                      className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Ave</th>
                  <th className="py-3 px-3 text-center">Sexo</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Genótipo / Cores</th>
                  <th className="py-3 px-3">Localização</th>
                  <th className="py-3 px-3 text-center w-28">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {avesFiltradas.map(ave => (
                  <tr
                    key={ave.id}
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      avesSelecionadas.includes(ave.id) ? 'bg-violet-50/30' : ''
                    }`}
                  >
                    <td className="p-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={avesSelecionadas.includes(ave.id)}
                        onChange={() => alternarSelecaoAve(ave.id)}
                        className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer border border-slate-200/60 shadow-sm"
                          onClick={() => {
                            if (ave.photo) onPhotoClick?.(ave.photo);
                            else onViewDetails?.(ave.id);
                          }}
                        >
                          {ave.photo ? (
                            <img
                              src={ave.photo}
                              alt={ave.name || ave.ring || 'Foto'}
                              className="w-full h-full object-cover"
                              onError={event => {
                                event.currentTarget.style.display = 'none';
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
                          <button
                            type="button"
                            onClick={() => onViewDetails?.(ave.id)}
                            className="font-bold text-slate-800 hover:text-emerald-600 text-left truncate block transition-colors"
                          >
                            {ave.name || 'Sem nome'}
                          </button>
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                            <span>{ave.species || '-'}</span>
                            {ave.ring && <span className="text-[10px] font-mono text-slate-400">({ave.ring})</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center align-middle">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                          ave.sex?.trim().toLowerCase() === 'macho'
                            ? 'bg-blue-50 text-blue-600'
                            : ave.sex?.trim().toLowerCase() === 'fêmea' || ave.sex?.trim().toLowerCase() === 'femea'
                              ? 'bg-pink-50 text-pink-600'
                              : 'bg-slate-100 text-slate-400'
                        }`}
                        title={`Sexo: ${formatarSexo(ave.sex)}`}
                      >
                        {simboloSexo(ave.sex)}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-middle">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${obterClasseStatus(ave.status)}`}>
                        {formatarStatus(ave.status)}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-middle">
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p><span className="text-slate-400 font-medium">C:</span> {ave.corCabeca || '-'}</p>
                        <p><span className="text-slate-400 font-medium">P:</span> {ave.corPeito || '-'}</p>
                        <p><span className="text-slate-400 font-medium">D:</span> {ave.corDorso || '-'}</p>
                      </div>
                    </td>

                    <td className="py-3 px-3 align-middle">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200/50">
                        {obterLocalAve(ave, ninhos)}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-middle text-center">
                      <div className="flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => onViewDetails?.(ave.id)}
                          title="Visualizar detalhes"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        >
                          <i className="fas fa-eye text-xs"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenModal('ave', ave.id)}
                          title="Editar ave"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <i className="fas fa-pen text-xs"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAve(ave.id)}
                          title="Excluir ave"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* Modal de Edicao em Lote Modernizado */}
      {mostrarEdicaoLote && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Editar aves em lote
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Modificando <span className="font-bold text-violet-600">{avesSelecionadas.length}</span> ave(s) selecionada(s).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarEdicaoLote(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['species', 'Espécie', 'text'],
                ['creator', 'Criador', 'text'],
                ['acqYear', 'Ano de aquisição', 'text'],
                ['nota', 'Observação', 'text']
              ].map(([campo, rotulo]) => (
                <label key={campo} className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">
                    {rotulo}
                  </span>
                  <input
                    type="text"
                    value={camposLote[campo as keyof typeof camposLote]}
                    onChange={event =>
                      atualizarCampoLote(
                        campo as keyof typeof camposLote,
                        event.target.value
                      )
                    }
                    placeholder="Manter original"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                </label>
              ))}

              {[
                ['sex', 'Sexo', ['Macho', 'Fêmea', 'Indefinido']],
                ['status', 'Status', ['Ativo', 'Vendido', 'Falecido', 'Doado', 'Perdido', 'Inativo']]
              ].map(([campo, rotulo, opcoes]) => (
                <label key={campo as string} className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">
                    {rotulo as string}
                  </span>
                  <select
                    value={camposLote[campo as keyof typeof camposLote]}
                    onChange={event =>
                      atualizarCampoLote(
                        campo as keyof typeof camposLote,
                        event.target.value
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all bg-white"
                  >
                    <option value="">Manter original</option>
                    {(opcoes as string[]).map(opcao => (
                      <option key={opcao} value={opcao}>{opcao}</option>
                    ))}
                  </select>
                </label>
              ))}

              {[
                ['corCabeca', 'Cor da cabeça', coresCabeca],
                ['corPeito', 'Cor do peito', coresPeito],
                ['corDorso', 'Cor do dorso', coresDorso],
                ['porta', 'Porta', portas],
                ['local', 'Local', locais]
              ].map(([campo, rotulo, opcoes]) => (
                <label key={campo as string} className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">
                    {rotulo as string}
                  </span>
                  <select
                    value={camposLote[campo as keyof typeof camposLote]}
                    onChange={event =>
                      atualizarCampoLote(
                        campo as keyof typeof camposLote,
                        event.target.value
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all bg-white"
                  >
                    <option value="">Manter original</option>
                    {(opcoes as string[]).map(opcao => (
                      <option key={opcao} value={opcao}>{opcao}</option>
                    ))}
                    {campo === 'local' && !locais.includes('Não informado') && (
                      <option value="Não informado">Não informado</option>
                    )}
                  </select>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setMostrarEdicaoLote(false)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={aplicarEdicaoEmLote}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm shadow-violet-600/20 transition-all flex items-center gap-2"
              >
                <i className="fas fa-check"></i>
                Aplicar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
