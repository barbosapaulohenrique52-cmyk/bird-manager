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
  status: string;
  especie: string;
  sexo: string;
  corCabeca: string;
  corPeito: string;
  corDorso: string;
  anoAnilha: string;
  busca: string;
};

function obterHexDaCor(
  nome: string | undefined,
  cores: CorAve[] | undefined,
  padrao: string
): string {
  if (!nome || !nome.trim()) {
    return padrao;
  }

  const nomeNormalizado = nome.trim().toLowerCase();

  const corEncontrada = (cores || []).find(
    (cor) => cor.nome.trim().toLowerCase() === nomeNormalizado
  );

  return corEncontrada?.hex || padrao;
}

function obterValorAve(ave: Ave, campo: string): string {
  const registro = ave as Ave & Record<string, unknown>;
  const valor = registro[campo];

  if (valor === null || valor === undefined) {
    return '';
  }

  return String(valor);
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

  const [filtros, setFiltros] = useState<FiltrosAves>({
    status: 'todos',
    especie: '',
    sexo: '',
    corCabeca: '',
    corPeito: '',
    corDorso: '',
    anoAnilha: '',
    busca: ''
  });

  const atualizarFiltro = (
    campo: keyof FiltrosAves,
    valor: string
  ) => {
    setFiltros((anterior) => ({
      ...anterior,
      [campo]: valor
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      status: 'todos',
      especie: '',
      sexo: '',
      corCabeca: '',
      corPeito: '',
      corDorso: '',
      anoAnilha: '',
      busca: ''
    });
  };

  const especies = useMemo(() => {
    return Array.from(
      new Set(
        aves
          .map((ave) => ave.species)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [aves]);

  const sexos = useMemo(() => {
    const valores = aves
      .map((ave) => obterValorAve(ave, 'sex'))
      .filter(Boolean);

    return Array.from(new Set(valores)).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [aves]);

  const anosAnilha = useMemo(() => {
    const valores = aves
      .map((ave) => String(ave.ringYear || ''))
      .filter(Boolean);

    return Array.from(new Set(valores)).sort((a, b) =>
      b.localeCompare(a)
    );
  }, [aves]);

  const coresCabeca = config?.coresCabeca || [];
  const coresPeito = config?.coresPeito || [];
  const coresDorso = config?.coresDorso || [];

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
        filtros.status === 'todos' ||
        (filtros.status === 'ativos' && status === 'ativo') ||
        (filtros.status === 'inativos' && status !== 'ativo');

      const especieMatch =
        !filtros.especie ||
        ave.species === filtros.especie;

      const sexoMatch =
        !filtros.sexo ||
        sexo === filtros.sexo.toLowerCase();

      const corCabecaMatch =
        !filtros.corCabeca ||
        (ave.corCabeca || '').toLowerCase() ===
          filtros.corCabeca.toLowerCase();

      const corPeitoMatch =
        !filtros.corPeito ||
        (ave.corPeito || '').toLowerCase() ===
          filtros.corPeito.toLowerCase();

      const corDorsoMatch =
        !filtros.corDorso ||
        (ave.corDorso || '').toLowerCase() ===
          filtros.corDorso.toLowerCase();

      const anoAnilhaMatch =
        !filtros.anoAnilha ||
        String(ave.ringYear || '') === filtros.anoAnilha;

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
    filtros.status !== 'todos',
    Boolean(filtros.especie),
    Boolean(filtros.sexo),
    Boolean(filtros.corCabeca),
    Boolean(filtros.corPeito),
    Boolean(filtros.corDorso),
    Boolean(filtros.anoAnilha),
    Boolean(filtros.busca)
  ].filter(Boolean).length;

  const handleDelete = (
    e: React.MouseEvent,
    aveId: string
  ) => {
    e.stopPropagation();
    onDeleteAve(aveId);
  };

  const handlePhotoClick = (
    e: React.MouseEvent,
    photoUrl: string
  ) => {
    e.stopPropagation();

    if (onPhotoClick) {
      onPhotoClick(photoUrl);
    }
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
              onClick={() => onOpenModal('ave')}
              className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-black text-[10px]"
            >
              ADICIONAR AVE
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
                atualizarFiltro('busca', e.target.value)
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
                  Os filtros podem ser combinados
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
              {/* Status */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">
                  Status
                </label>

                <select
                  value={filtros.status}
                  onChange={(e) =>
                    atualizarFiltro('status', e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none"
                >
                  <option value="todos">Todas as aves</option>
                  <option value="ativos">Somente ativas</option>
                  <option value="inativos">Somente inativas</option>
                </select>
              </div>

              {/* Espécie */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">
                  Espécie
                </label>

                <select
                  value={filtros.especie}
                  onChange={(e) =>
                    atualizarFiltro('especie', e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none"
                >
                  <option value="">Todas as espécies</option>

                  {especies.map((especie) => (
                    <option key={especie} value={especie}>
                      {especie}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sexo */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">
                  Sexo
                </label>

                <select
                  value={filtros.sexo}
                  onChange={(e) =>
                    atualizarFiltro('sexo', e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none"
                >
                  <option value="">Todos os sexos</option>

                  {sexos.map((sexo) => (
                    <option key={sexo} value={sexo}>
                      {sexo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ano da anilha */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">
                  Ano da anilha
                </label>

                <select
                  value={filtros.anoAnilha}
                  onChange={(e) =>
                    atualizarFiltro('anoAnilha', e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none"
                >
                  <option value="">Todos os anos</option>

                  {anosAnilha.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cor da cabeça */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">
                  Cor da cabeça
                </label>

                <select
                  value={filtros.corCabeca}
                  onChange={(e) =>
                    atualizarFiltro('corCabeca', e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none"
                >
                  <option value="">Todas as cores</option>

                  {coresCabeca.map((cor) => (
                    <option key={cor.id} value={cor.nome}>
                      {cor.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cor do peito */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">
                  Cor do peito
                </label>

                <select
                  value={filtros.corPeito}
                  onChange={(e) =>
                    atualizarFiltro('corPeito', e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none"
                >
                  <option value="">Todas as cores</option>

                  {coresPeito.map((cor) => (
                    <option key={cor.id} value={cor.nome}>
                      {cor.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cor do dorso */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">
                  Cor do dorso
                </label>

                <select
                  value={filtros.corDorso}
                  onChange={(e) =>
                    atualizarFiltro('corDorso', e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none"
                >
                  <option value="">Todas as cores</option>

                  {coresDorso.map((cor) => (
                    <option key={cor.id} value={cor.nome}>
                      {cor.nome}
                    </option>
                  ))}
                </select>
              </div>
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
              {/* Foto da ave */}
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

              {/* Informações da ave */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() =>
                    onViewDetails && onViewDetails(ave.id)
                  }
                  className="font-black text-[11px] text-emerald-600 uppercase underline text-left"
                >
                  {ave.name || 'S/NOME'}
                </button>

                <p className="text-[8px] text-slate-400 font-bold">
                  {ave.species} • {ave.ring || 'S/A'} •{' '}
                  {ave.ringYear || '--'}
                </p>

                <span className="text-[8px] font-black">
                  {ave.status}
                </span>
              </div>

              {/* Representação visual das cores */}
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

              {/* Editar */}
              <button
                onClick={() => onOpenModal('ave', ave.id)}
                className="bg-slate-100 px-2 py-1 rounded-lg shrink-0"
                title="Editar ave"
              >
                <i className="fas fa-edit"></i>
              </button>

              {/* Excluir */}
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
