import { useState } from 'react';
import type { Ave, Casal, Config, Egg, Ninho, TabType } from '../App';

interface DashboardSectionProps {
  aves: Ave[];
  casais: Casal[];
  ninhos: Ninho[];
  config: Config;
  onNavigate: (tab: TabType) => void;
}

function formatarData(data?: string) {
  if (!data) return '—';

  const dataObj = new Date(`${data}T12:00:00`);
  if (Number.isNaN(dataObj.getTime())) return '—';

  return dataObj.toLocaleDateString('pt-BR');
}

function diferencaDias(data: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const alvo = new Date(`${data}T00:00:00`);
  alvo.setHours(0, 0, 0, 0);

  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

function nomeAve(ave?: Ave) {
  if (!ave) return 'Ave não identificada';
  return ave.name?.trim() || ave.ring?.trim() || 'Ave sem identificação';
}

function nomeCasal(casal: Casal | undefined, aves: Ave[]) {
  if (!casal) return 'Casal não definido';

  const macho = aves.find(ave => ave.id === casal.mId);
  const femea = aves.find(ave => ave.id === casal.fId);

  return `${nomeAve(macho)} × ${nomeAve(femea)}`;
}

function contarOvos(ninhos: Ninho[]) {
  return ninhos.flatMap(ninho => ninho.eggs || []);
}


interface CheckboxFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  allLabel?: string;
  specialOption?: { value: string; label: string };
}

function CheckboxFilter({
  label,
  options,
  selected,
  onChange,
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto(value => !value)}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all flex items-center justify-between gap-2 shadow-sm"
      >
        <span className="truncate">
          <strong className="text-slate-900 font-semibold">{label}:</strong>{' '}
          {specialOption && selected.includes(specialOption.value)
            ? specialOption.label
            : isAll
              ? allLabel
              : `${selected.length} sel.`}
        </span>
        <i className={`fas fa-chevron-${aberto ? 'up' : 'down'} text-[10px] text-slate-400 shrink-0`}></i>
      </button>

      {aberto && (
        <div className="absolute z-40 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-64 overflow-y-auto min-w-[210px]">
          <label className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 cursor-pointer border-b border-slate-100 mb-1">
            <input
              type="checkbox"
              checked={isAll}
              onChange={() => onChange([])}
              className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800">{allLabel}</span>
          </label>

          {specialOption && (
            <label className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(specialOption.value)}
                onChange={() => alternarOpcao(specialOption.value)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700">{specialOption.label}</span>
            </label>
          )}

          {options.map(option => (
            <label key={option} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => alternarOpcao(option)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function CardKpi({
  titulo,
  valor,
  detalhe,
  icon,
  iconClass
}: {
  titulo: string;
  valor: string | number;
  detalhe?: string;
  icon: string;
  iconClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <i className={`fas ${icon} text-base`}></i>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
          {titulo}
        </p>
        <div className="flex items-end gap-2 mt-1">
          <h3 className="text-xl font-bold text-slate-800 leading-none">
            {valor}
          </h3>
          {detalhe && (
            <span className="text-[10px] text-slate-400 mb-0.5 truncate">
              {detalhe}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function BarraStatus({
  label,
  valor,
  total,
  icon,
  iconClass
}: {
  label: string;
  valor: number;
  total: number;
  icon: string;
  iconClass: string;
}) {
  const percentual = total > 0 ? Math.min(100, (valor / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <i className={`fas ${icon} text-[11px] ${iconClass}`}></i>
          <span className="text-xs font-medium text-slate-600 truncate">{label}</span>
        </div>
        <span className="text-xs font-bold text-slate-700">{valor}</span>
      </div>

      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${iconClass.replace('text-', 'bg-')}`}
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}

export function DashboardSection({
  aves,
  casais,
  ninhos,
  config,
  onNavigate
}: DashboardSectionProps) {
  const [busca, setBusca] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState<string[]>([]);
  const [filtroSexo, setFiltroSexo] = useState<string[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string[]>(['__NAO_FALECIDAS__']);
  const [filtroCorCabeca, setFiltroCorCabeca] = useState<string[]>([]);
  const [filtroCorPeito, setFiltroCorPeito] = useState<string[]>([]);
  const [filtroCorDorso, setFiltroCorDorso] = useState<string[]>([]);
  const [filtroPorta, setFiltroPorta] = useState<string[]>([]);
  const [filtroLocal, setFiltroLocal] = useState<string[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const obterLocalAve = (ave: Ave) => {
    const aveAny = ave as Ave & {
      localAtual?: string;
      location?: string;
      localSaidaNinho?: string;
    };

    const direto = [ave.local, aveAny.localAtual, aveAny.location, aveAny.localSaidaNinho]
      .find(valor => valor && String(valor).trim());

    return direto ? String(direto).trim() : 'Não informado';
  };

  const especies = Array.from(new Set(aves.map(ave => ave.species).filter(Boolean))).sort();
  const sexos = Array.from(new Set(aves.map(ave => ave.sex).filter(Boolean))).sort();
  const status = Array.from(new Set(aves.map(ave => ave.status).filter(Boolean))).sort();
  const coresCabeca = Array.from(new Set(aves.map(ave => ave.corCabeca).filter(Boolean))).sort();
  const coresPeito = Array.from(new Set(aves.map(ave => ave.corPeito).filter(Boolean))).sort();
  const coresDorso = Array.from(new Set(aves.map(ave => ave.corDorso).filter(Boolean))).sort();
  const portas = Array.from(new Set(aves.map(ave => ave.porta).filter(Boolean))).sort();
  const locais = Array.from(new Set([
    ...(config.locaisOvos || []),
    ...aves.map(obterLocalAve)
  ])).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const avesFiltradas = aves.filter(ave => {
    const termo = busca.trim().toLowerCase();
    const correspondeBusca = !termo || [
      ave.species, ave.ring, ave.name, ave.sex, ave.status, ave.creator,
      ave.ringYear, ave.acqYear, ave.corCabeca, ave.corPeito, ave.corDorso,
      ave.nota, ave.porta, obterLocalAve(ave)
    ].filter(value => value !== undefined && value !== null)
      .some(value => String(value).toLowerCase().includes(termo));

    const statusNormalizado = String(ave.status || '').trim().toLowerCase();
    const eFalecida = ['óbito', 'obito', 'falecido', 'falecida', 'morto', 'morta'].includes(statusNormalizado);

    return (
      correspondeBusca &&
      (filtroEspecie.length === 0 || filtroEspecie.includes(ave.species || '')) &&
      (filtroSexo.length === 0 || filtroSexo.includes(ave.sex || '')) &&
      (filtroStatus.length === 0 ||
        (filtroStatus.includes('__NAO_FALECIDAS__') ? !eFalecida :
          filtroStatus.some(valor => statusNormalizado === valor.trim().toLowerCase()))) &&
      (filtroCorCabeca.length === 0 || filtroCorCabeca.includes(ave.corCabeca || '')) &&
      (filtroCorPeito.length === 0 || filtroCorPeito.includes(ave.corPeito || '')) &&
      (filtroCorDorso.length === 0 || filtroCorDorso.includes(ave.corDorso || '')) &&
      (filtroPorta.length === 0 || filtroPorta.includes(ave.porta || '')) &&
      (filtroLocal.length === 0 || filtroLocal.includes(obterLocalAve(ave)))
    );
  });

  const idsAvesFiltradas = new Set(avesFiltradas.map(ave => ave.id));

  // Um casal entra no recorte quando pelo menos um dos seus integrantes
  // pertence ao conjunto filtrado. Assim, por exemplo, o filtro "Macho"
  // continua mostrando os casais dos machos selecionados.
  const casaisFiltrados = casais.filter(casal =>
    idsAvesFiltradas.has(casal.mId) || idsAvesFiltradas.has(casal.fId)
  );

  const idsCasaisFiltrados = new Set(casaisFiltrados.map(casal => casal.id));
  const ninhosFiltrados = ninhos.filter(ninho => idsCasaisFiltrados.has(ninho.casalId));

  const avesAtivas = avesFiltradas.filter(ave => {
    const statusAve = String(ave.status || 'Ativo').trim().toLowerCase();
    return statusAve === 'ativo';
  });

  const machos = avesAtivas.filter(ave => ave.sex === 'Macho').length;
  const femeas = avesAtivas.filter(ave => ave.sex === 'Fêmea').length;

  const ninhosAtivos = ninhosFiltrados.filter(ninho => ninho.active).length;
  const ovos = contarOvos(ninhosFiltrados);

  const ovosChocando = ovos.filter(egg => egg.status === 'Chocando').length;
  const ovosFerteis = ovos.filter(egg => egg.status === 'Fértil').length;
  const ovosEclodidos = ovos.filter(egg => egg.status === 'Eclodido').length;
  const ovosPerdidos = ovos.filter(egg => egg.status === 'Perdido').length;
  const ovosEmEspera = ovos.filter(egg => egg.status === 'Em Espera').length;
  const ovosInferteis = ovos.filter(egg => egg.status === 'Infértil').length;

  const casaisAtivos = casaisFiltrados.filter(casal => {
    const macho = aves.find(ave => ave.id === casal.mId);
    const femea = aves.find(ave => ave.id === casal.fId);
    return macho?.status === 'Ativo' && femea?.status === 'Ativo';
  }).length;

  const filhotes = casaisFiltrados.reduce(
    (total, casal) => total + (casal.historico?.length || 0),
    0
  );

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

  const hoje = new Date();
  const mesAtual = hoje.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  const atencoes = ovos
    .map(egg => {
      if (egg.status === 'Chocando' && egg.inicioChoca) {
        const inicio = new Date(`${egg.inicioChoca}T00:00:00`);
        const diasChoca = config.parametrosPadrao?.duracaoChoca || 14;
        const dataPrevista = new Date(inicio);
        dataPrevista.setDate(dataPrevista.getDate() + diasChoca);

        const data = dataPrevista.toISOString().split('T')[0];
        const dias = diferencaDias(data);

        return {
          tipo: 'Eclosão',
          titulo: 'Eclosão prevista',
          detalhe: `${dias < 0 ? `Atrasada ${Math.abs(dias)} dia(s)` : dias === 0 ? 'Prevista para hoje' : `Em ${dias} dia(s)`}`,
          data,
          icon: 'fa-egg',
          className: dias <= 0
            ? 'bg-amber-50 text-amber-700 border-amber-100'
            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
        };
      }

      if (egg.status === 'Em Espera' && egg.postura) {
        const diasDesdePostura = -diferencaDias(egg.postura);
        const prazo = config.prazoAlertaPostura || 15;

        if (diasDesdePostura >= prazo) {
          return {
            tipo: 'Postura',
            titulo: 'Ovo aguardando ação',
            detalhe: `${diasDesdePostura} dia(s) desde a postura`,
            data: egg.postura,
            icon: 'fa-clock',
            className: 'bg-orange-50 text-orange-700 border-orange-100'
          };
        }
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (!a || !b) return 0;
      return a.data.localeCompare(b.data);
    })
    .slice(0, 5) as Array<{
      tipo: string;
      titulo: string;
      detalhe: string;
      data: string;
      icon: string;
      className: string;
    }>;

  return (
    <section className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between bg-white rounded-2xl border border-slate-200/80 shadow-sm px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-[0.18em]">
            GouldPRO
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-0.5">
            Visão geral
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 capitalize">
            Resumo do seu plantel e da reprodução • {mesAtual}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('calendario')}
          className="self-start xl:self-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-[11px] flex items-center gap-2 transition-all"
        >
          <i className="fas fa-calendar-alt text-emerald-600"></i>
          VER CALENDÁRIO
        </button>
      </div>

      {/* Busca e filtros — mesmos critérios do Plantel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              value={busca}
              onChange={event => setBusca(event.target.value)}
              placeholder="Buscar por espécie, anilha, nome, sexo, status, local..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setMostrarFiltros(value => !value)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 border ${
              mostrarFiltros || quantidadeFiltrosAtivos > 0
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-sliders-h text-sm"></i>
            Filtros
            {quantidadeFiltrosAtivos > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {quantidadeFiltrosAtivos}
              </span>
            )}
          </button>
        </div>

        {mostrarFiltros && (
          <div className="pt-3 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2.5">
              <CheckboxFilter label="Espécie" options={especies} selected={filtroEspecie} onChange={setFiltroEspecie} allLabel="Todas" />
              <CheckboxFilter label="Sexo" options={sexos} selected={filtroSexo} onChange={setFiltroSexo} allLabel="Todos" />
              <CheckboxFilter label="Status" options={status} selected={filtroStatus} onChange={setFiltroStatus} allLabel="Todos" specialOption={{ value: '__NAO_FALECIDAS__', label: 'Não falecidas' }} />
              <CheckboxFilter label="Cabeça" options={coresCabeca} selected={filtroCorCabeca} onChange={setFiltroCorCabeca} allLabel="Todas" />
              <CheckboxFilter label="Peito" options={coresPeito} selected={filtroCorPeito} onChange={setFiltroCorPeito} allLabel="Todas" />
              <CheckboxFilter label="Dorso" options={coresDorso} selected={filtroCorDorso} onChange={setFiltroCorDorso} allLabel="Todas" />
              <CheckboxFilter label="Porta" options={portas} selected={filtroPorta} onChange={setFiltroPorta} allLabel="Todas" />
              <CheckboxFilter label="Local" options={locais} selected={filtroLocal} onChange={setFiltroLocal} allLabel="Todos" />
            </div>

            {(quantidadeFiltrosAtivos > 0 || busca) && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] text-slate-400">
                  Exibindo <strong className="text-slate-700">{avesFiltradas.length}</strong> de {aves.length} aves • {casaisFiltrados.length} casal(is) relacionado(s) • {ninhosFiltrados.length} ninho(s)
                </p>
                <button type="button" onClick={limparFiltros} className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50">
                  <i className="fas fa-times text-[10px]"></i>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <CardKpi
          titulo="Aves ativas"
          valor={avesAtivas.length}
          detalhe={`${machos} M / ${femeas} F`}
          icon="fa-dove"
          iconClass="bg-slate-100 text-slate-600"
        />

        <CardKpi
          titulo="Casais"
          valor={casais.length}
          detalhe={`${casaisAtivos} ativos`}
          icon="fa-heart"
          iconClass="bg-rose-50 text-rose-600"
        />

        <CardKpi
          titulo="Ninhos"
          valor={ninhos.length}
          detalhe={`${ninhosAtivos} ativos`}
          icon="fa-home"
          iconClass="bg-amber-50 text-amber-600"
        />

        <CardKpi
          titulo="Ovos"
          valor={ovos.length}
          detalhe={`${ovosChocando} chocando`}
          icon="fa-egg"
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <CardKpi
          titulo="Filhotes"
          valor={filhotes}
          detalhe="histórico"
          icon="fa-feather"
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Reprodução */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Reprodução</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Distribuição dos ovos cadastrados
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('ninhos')}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase"
            >
              Ver ninhos
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
            <BarraStatus
              label="Chocando"
              valor={ovosChocando}
              total={ovos.length}
              icon="fa-fire"
              iconClass="text-orange-500"
            />

            <BarraStatus
              label="Férteis"
              valor={ovosFerteis}
              total={ovos.length}
              icon="fa-check-circle"
              iconClass="text-emerald-500"
            />

            <BarraStatus
              label="Eclodidos"
              valor={ovosEclodidos}
              total={ovos.length}
              icon="fa-feather-alt"
              iconClass="text-violet-500"
            />

            <BarraStatus
              label="Em espera"
              valor={ovosEmEspera}
              total={ovos.length}
              icon="fa-clock"
              iconClass="text-slate-400"
            />

            <BarraStatus
              label="Inférteis"
              valor={ovosInferteis}
              total={ovos.length}
              icon="fa-minus-circle"
              iconClass="text-blue-500"
            />

            <BarraStatus
              label="Perdidos"
              valor={ovosPerdidos}
              total={ovos.length}
              icon="fa-exclamation-circle"
              iconClass="text-red-500"
            />
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Total de ovos
            </span>
            <span className="text-sm font-bold text-slate-700">{ovos.length}</span>
            <span className="text-[10px] text-slate-400">
              {ninhosAtivos} ninho(s) ativo(s)
            </span>
          </div>
        </div>

        {/* Atenções */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Atenção</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Próximas ações relacionadas à reprodução
              </p>
            </div>

            <i className="fas fa-bell text-amber-500 text-sm"></i>
          </div>

          {atencoes.length > 0 ? (
            <div className="space-y-2.5">
              {atencoes.map((item, index) => (
                <div
                  key={`${item.tipo}-${item.data}-${index}`}
                  className={`rounded-xl border p-3 ${item.className}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
                      <i className={`fas ${item.icon} text-[11px]`}></i>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-bold">{item.titulo}</p>
                      <p className="text-[10px] mt-0.5 opacity-80">{item.detalhe}</p>
                      <p className="text-[9px] mt-1 opacity-60">
                        {formatarData(item.data)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="min-h-[170px] flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center mb-2">
                <i className="fas fa-check text-sm"></i>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Nenhuma atenção pendente
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                O dashboard não identificou ações urgentes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Atalhos */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">Acesso rápido</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Vá direto para as áreas mais usadas
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              tab: 'aves' as TabType,
              label: 'Plantel',
              detalhe: `${avesAtivas.length} aves ativas`,
              icon: 'fa-dove',
              className: 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            },
            {
              tab: 'casais' as TabType,
              label: 'Casais',
              detalhe: `${casais.length} cadastrados`,
              icon: 'fa-heart',
              className: 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            },
            {
              tab: 'ninhos' as TabType,
              label: 'Ninhos',
              detalhe: `${ninhos.length} cadastrados`,
              icon: 'fa-egg',
              className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            },
            {
              tab: 'calendario' as TabType,
              label: 'Calendário',
              detalhe: 'Ver agenda',
              icon: 'fa-calendar-alt',
              className: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }
          ].map(item => (
            <button
              key={item.tab}
              type="button"
              onClick={() => onNavigate(item.tab)}
              className={`text-left rounded-xl p-3.5 transition-all ${item.className}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold">{item.label}</span>
                <i className={`fas ${item.icon} text-xs opacity-70`}></i>
              </div>
              <p className="text-[10px] mt-1 opacity-70">{item.detalhe}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
