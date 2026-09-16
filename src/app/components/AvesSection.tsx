import { useMemo, useState } from 'react';
import type { Ave, ModalType, Config, CorAve } from '../App';
import BirdColorDiagram from './BirdColorDiagram';

interface AvesSectionProps {
  aves: Ave[];
  config?: Config;
  onOpenModal: (type: ModalType, id?: string | null) => void;
  onDeleteAve: (id: string) => void;
  onPhotoClick?: (photoUrl: string) => void;
  onViewDetails?: (aveId: string) => void;
}

type FiltrosAves = {
  status: string[];
  especies: string[];
  sexos: string[];
  coresCabeca: string[];
  coresPeito: string[];
  coresDorso: string[];
  anosAnilha: string[];
  busca: string;
};

function obterHexDaCor(
  nome: string | undefined,
  cores: CorAve[] | undefined,
  padrao: string
): string {
  if (!nome || !nome.trim()) return padrao;

  const nomeNormalizado = nome.trim().toLowerCase();
  const corEncontrada = (cores || []).find(
    (cor) => cor.nome.trim().toLowerCase() === nomeNormalizado
  );

  return corEncontrada?.hex || padrao;
}

function obterValorAve(ave: Ave, campo: string): string {
  const registro = ave as Ave & Record<string, unknown>;
  const valor = registro[campo];

  if (valor === null || valor === undefined) return '';
  return String(valor);
}

interface FiltroMultiploProps {
  label: string;
  placeholder: string;
  opcoes: string[];
  selecionados: string[];
  aberto: boolean;
  onAbrir: () => void;
  onAlternar: (valor: string) => void;
  onSelecionarTodos: () => void;
}

function FiltroMultiplo({
  label,
  placeholder,
  opcoes,
  selecionados,
  aberto,
  onAbrir,
  onAlternar,
  onSelecionarTodos
}: FiltroMultiploProps) {
  const textoSelecionados = () => {
    if (selecionados.length === 0) return placeholder;
    if (selecionados.length === 1) return selecionados[0];
    if (selecionados.length === opcoes.length) return `Todas (${opcoes.length})`;
    return `${selecionados.length} selecionados`;
  };

  const todosSelecionados =
    opcoes.length > 0 && selecionados.length === opcoes.length;

  return (
    <div className="relative">
      <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">
        {label}
      </label>

      <button
        type="button"
        onClick={onAbrir}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none text-left flex items-center justify-between gap-2"
      >
        <span className="truncate">{textoSelecionados()}</span>
        <i
          className={`fas fa-chevron-down text-slate-400 transition-transform ${
            aberto ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {aberto && (
        <div className="absolute z-40 mt-1 w-full min-w-[220px] bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-64 overflow-y-auto">
          <label className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer border-b border-slate-100 mb-1">
            <input
              type="checkbox"
              checked={todosSelecionados}
              onChange={onSelecionarTodos}
              className="accent-emerald-600"
            />
            <span className="text-[10px] font-black text-slate-700 uppercase">
              {opcoes.length > 0 ? 'Selecionar todas' : 'Nenhuma opção'}
            </span>
          </label>

          {opcoes.map((opcao) => (
            <label
              key={opcao}
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selecionados.includes(opcao)}
                onChange={() => onAlternar(opcao)}
                className="accent-emerald-600"
              />
              <span className="text-[10px] font-bold text-slate-700">
                {opcao}
              </span>
            </label>
          ))}

          {opcoes.length === 0 && (
            <p className="text-[10px] text-slate-400 font-bold p-2">
              Nenhuma opção cadastrada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function AvesSection({
  aves,
  config,
  onOpenModal,
  onDeleteAve,
  onPhotoClick,
  onViewDetails
}: AvesSectionProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filtroAberto, setFiltroAberto] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosAves>({
    status: [],
    especies: [],
    sexos: [],
    coresCabeca: [],
    coresPeito: [],
    coresDorso: [],
    anosAnilha: [],
    busca: ''
  });

  const especies = useMemo(() => {
    return Array.from(
      new Set(aves.map((ave) => ave.species).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [aves]);

  const sexos = useMemo(() => {
    return Array.from(
      new Set(aves.map((ave) => obterValorAve(ave, 'sex')).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [aves]);

  const anosAnilha = useMemo(() => {
    return Array.from(
      new Set(aves.map((ave) => String(ave.ringYear || '')).filter(Boolean))
    ).sort((a, b) => b.localeCompare(a));
  }, [aves]);

  const coresCabeca = (config?.coresCabeca || []).map((cor) => cor.nome);
  const coresPeito = (config?.coresPeito || []).map((cor) => cor.nome);
  const coresDorso = (config?.coresDorso || []).map((cor) => cor.nome);
  const statusOpcoes = ['Ativo', 'Vendido', 'Óbito', 'No Ninho'];

  const alternarFiltro = (
    campo: Exclude<keyof FiltrosAves, 'busca'>,
    valor: string
  ) => {
    setFiltros((anterior) => {
      const listaAtual = anterior[campo] as string[];
      const existe = listaAtual.includes(valor);

      return {
        ...anterior,
        [campo]: existe
          ? listaAtual.filter((item) => item !== valor)
          : [...listaAtual, valor]
      };
    });
  };

  const selecionarTodos = (
    campo: Exclude<keyof FiltrosAves, 'busca'>,
    opcoes: string[]
  ) => {
    setFiltros((anterior) => {
      const listaAtual = anterior[campo] as string[];
      const todosSelecionados =
        opcoes.length > 0 && listaAtual.length === opcoes.length;

      return {
        ...anterior,
        [campo]: todosSelecionados ? [] : [...opcoes]
      };
    });
  };

  const limparFiltros = () => {
    setFiltros({
      status: [],
      especies: [],
      sexos: [],
      coresCabeca: [],
      coresPeito: [],
      coresDorso: [],
      anosAnilha: [],
      busca: ''
    });
    setFiltroAberto(null);
  };

  const filteredAves = useMemo(() => {
    const buscaNormalizada = filtros.busca.trim().toLowerCase();

    return aves.filter((ave) => {
      const nome = (ave.name || '').toLowerCase();
      const anilha = (ave.ring || '').toLowerCase();
      const especie = (ave.species || '').toLowerCase();
      const status = (ave.status || '').toLowerCase();
      const sexo = obterValorAve(ave, 'sex').toLowerCase();

      const buscaMatch =
        !buscaNormalizada ||
        nome.includes(buscaNormalizada) ||
        anilha.includes(buscaNormalizada) ||
        especie.includes(buscaNormalizada);

      const statusMatch =
        filtros.status.length === 0 ||
        filtros.status.some((item) => item.toLowerCase() === status);

      const especieMatch =
        filtros.especies.length === 0 ||
        filtros.especies.some(
          (item) => item.toLowerCase() === especie
        );

      const sexoMatch =
        filtros.sexos.length === 0 ||
        filtros.sexos.some((item) => item.toLowerCase() === sexo);

      const corCabeca = (ave.corCabeca || '').toLowerCase();
      const corPeito = (ave.corPeito || '').toLowerCase();
      const corDorso = (ave.corDorso || '').toLowerCase();

      const corCabecaMatch =
        filtros.coresCabeca.length === 0 ||
        filtros.coresCabeca.some((item) => item.toLowerCase() === corCabeca);

      const corPeitoMatch =
        filtros.coresPeito.length === 0 ||
        filtros.coresPeito.some((item) => item.toLowerCase() === corPeito);

      const corDorsoMatch =
        filtros.coresDorso.length === 0 ||
        filtros.coresDorso.some((item) => item.toLowerCase() === corDorso);

      const anoAnilhaMatch =
        filtros.anosAnilha.length === 0 ||
        filtros.anosAnilha.includes(String(ave.ringYear || ''));

      return (
        buscaMatch &&
        statusMatch &&
        especieMatch &&
        sexoMatch &&
        corCabecaMatch &&
        corPeitoMatch &&
        corDorsoMatch &&
        anoAnilhaMatch
      );
    });
  }, [aves, filtros]);

  const quantidadeFiltrosAtivos = [
    filtros.status.length > 0,
    filtros.especies.length > 0,
    filtros.sexos.length > 0,
    filtros.coresCabeca.length > 0,
    filtros.coresPeito.length > 0,
    filtros.coresDorso.length > 0,
    filtros.anosAnilha.length > 0,
    Boolean(filtros.busca)
  ].filter(Boolean).length;

  const alternarDropdown = (nome: string) => {
    setFiltroAberto((anterior) => (anterior === nome ? null : nome));
  };

  const handleDelete = (e: React.MouseEvent, aveId: string) => {
    e.stopPropagation();
    onDeleteAve(aveId);
  };

  const handlePhotoClick = (e: React.MouseEvent, photoUrl: string) => {
    e.stopPropagation();
    onPhotoClick?.(photoUrl);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
              Plantel
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              {filteredAves.length} de {aves.length} aves encontradas
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 ${
                showFilters || quantidadeFiltrosAtivos > 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <i className="fas fa-filter"></i>
              FILTROS
              {quantidadeFiltrosAtivos > 0 && (
                <span className="bg-white text-emerald-700 rounded-full px-1.5 py-0.5 text-[9px]">
                  {quantidadeFiltrosAtivos}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onOpenModal('ave')}
              className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-black text-[10px]"
            >
              ADICIONAR AVE
            </button>

            <button
              type="button"
              onClick={() => onOpenModal('aves-lote')}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2"
            >
              <i className="fas fa-layer-group"></i>
              ADICIONAR EM LOTE
            </button>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={filtros.busca}
              onChange={(e) =>
                setFiltros((anterior) => ({
                  ...anterior,
                  busca: e.target.value
                }))
              }
              placeholder="Buscar por nome, anilha ou espécie..."
              className="w-full bg-slate-50 rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold uppercase outline-none border border-transparent focus:border-emerald-300"
            />
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase">
                  Filtrar plantel
                </h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                  Selecione uma ou várias opções em cada filtro
                </p>
              </div>

              <button
                type="button"
                onClick={limparFiltros}
                className="text-[10px] font-black text-red-500 uppercase hover:text-red-700"
              >
                <i className="fas fa-eraser mr-1"></i>
                Limpar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <FiltroMultiplo
                label="Status"
                placeholder="Todos os status"
                opcoes={statusOpcoes}
                selecionados={filtros.status}
                aberto={filtroAberto === 'status'}
                onAbrir={() => alternarDropdown('status')}
                onAlternar={(valor) => alternarFiltro('status', valor)}
                onSelecionarTodos={() => selecionarTodos('status', statusOpcoes)}
              />

              <FiltroMultiplo
                label="Espécie"
                placeholder="Todas as espécies"
                opcoes={especies}
                selecionados={filtros.especies}
                aberto={filtroAberto === 'especies'}
                onAbrir={() => alternarDropdown('especies')}
                onAlternar={(valor) => alternarFiltro('especies', valor)}
                onSelecionarTodos={() => selecionarTodos('especies', especies)}
              />

              <FiltroMultiplo
                label="Sexo"
                placeholder="Todos os sexos"
                opcoes={sexos}
                selecionados={filtros.sexos}
                aberto={filtroAberto === 'sexos'}
                onAbrir={() => alternarDropdown('sexos')}
                onAlternar={(valor) => alternarFiltro('sexos', valor)}
                onSelecionarTodos={() => selecionarTodos('sexos', sexos)}
              />

              <FiltroMultiplo
                label="Ano da anilha"
                placeholder="Todos os anos"
                opcoes={anosAnilha}
                selecionados={filtros.anosAnilha}
                aberto={filtroAberto === 'anosAnilha'}
                onAbrir={() => alternarDropdown('anosAnilha')}
                onAlternar={(valor) => alternarFiltro('anosAnilha', valor)}
                onSelecionarTodos={() => selecionarTodos('anosAnilha', anosAnilha)}
              />

              <FiltroMultiplo
                label="Cor da cabeça"
                placeholder="Todas as cores"
                opcoes={coresCabeca}
                selecionados={filtros.coresCabeca}
                aberto={filtroAberto === 'coresCabeca'}
                onAbrir={() => alternarDropdown('coresCabeca')}
                onAlternar={(valor) => alternarFiltro('coresCabeca', valor)}
                onSelecionarTodos={() => selecionarTodos('coresCabeca', coresCabeca)}
              />

              <FiltroMultiplo
                label="Cor do peito"
                placeholder="Todas as cores"
                opcoes={coresPeito}
                selecionados={filtros.coresPeito}
                aberto={filtroAberto === 'coresPeito'}
                onAbrir={() => alternarDropdown('coresPeito')}
                onAlternar={(valor) => alternarFiltro('coresPeito', valor)}
                onSelecionarTodos={() => selecionarTodos('coresPeito', coresPeito)}
              />

              <FiltroMultiplo
                label="Cor do dorso"
                placeholder="Todas as cores"
                opcoes={coresDorso}
                selecionados={filtros.coresDorso}
                aberto={filtroAberto === 'coresDorso'}
                onAbrir={() => alternarDropdown('coresDorso')}
                onAlternar={(valor) => alternarFiltro('coresDorso', valor)}
                onSelecionarTodos={() => selecionarTodos('coresDorso', coresDorso)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {filteredAves.map((ave) => {
          const hexCabeca = obterHexDaCor(
            ave.corCabeca,
            config?.coresCabeca,
            '#f1f3f5'
          );
          const hexPeito = obterHexDaCor(
            ave.corPeito,
            config?.coresPeito,
            '#f1f3f5'
          );
          const hexDorso = obterHexDaCor(
            ave.corDorso,
            config?.coresDorso,
            '#f1f3f5'
          );

          return (
            <div
              key={ave.id}
              className="bg-white rounded-xl border border-slate-100 p-2 flex items-center gap-3 shadow-sm"
            >
              <div className="shrink-0">
                {ave.photo ? (
                  <img
                    src={ave.photo}
                    alt={ave.name}
                    className="w-10 h-10 rounded-lg object-cover cursor-pointer"
                    onClick={(e) => handlePhotoClick(e, ave.photo!)}
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-kiwi-bird text-slate-400"></i>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onViewDetails?.(ave.id)}
                  className="font-black text-[11px] text-emerald-600 uppercase underline text-left"
                >
                  {ave.name || 'S/NOME'}
                </button>
                <p className="text-[8px] text-slate-400 font-bold">
                  {ave.species} • {ave.ring || 'S/A'} • {ave.ringYear || '--'}
                </p>
                <span className="text-[8px] font-black">{ave.status}</span>
              </div>

              <div
                className="w-16 h-16 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100"
                title="Representação visual das cores"
              >
                <BirdColorDiagram
                  corCabeca={hexCabeca}
                  corPeito={hexPeito}
                  corDorso={hexDorso}
                  className="w-14 h-14"
                />
              </div>

              <button
                onClick={() => onOpenModal('ave', ave.id)}
                className="bg-slate-100 px-2 py-1 rounded-lg shrink-0"
                title="Editar ave"
              >
                <i className="fas fa-edit"></i>
              </button>

              <button
                onClick={(e) => handleDelete(e, ave.id)}
                className="bg-red-500 text-white px-2 py-1 rounded-lg shrink-0"
                title="Excluir ave"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          );
        })}

        {filteredAves.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <i className="fas fa-dove text-2xl text-slate-300 mb-2"></i>
            <p className="text-xs font-bold text-slate-400">
              Nenhuma ave encontrada.
            </p>
            {quantidadeFiltrosAtivos > 0 && (
              <button
                type="button"
                onClick={limparFiltros}
                className="mt-3 text-[10px] font-black text-emerald-600 uppercase"
              >
                Limpar filtros e mostrar todas
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default AvesSection;
