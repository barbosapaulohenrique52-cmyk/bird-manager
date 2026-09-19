import { useState } from 'react';
import type { Ave, Casal, Config, Ninho, TabType } from '../App';

interface DashboardSectionProps {
  aves: Ave[];
  casais: Casal[];
  ninhos: Ninho[];
  config: Config;
  onNavigate: (tab: TabType) => void;
}

function formatarData(data?: string) {
  if (!data) return '—';
  const d = new Date(`${data}T12:00:00`);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
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

function CardKpi({
  titulo,
  valor,
  detalhe,
  icon,
  iconClass,
  onClick
}: {
  titulo: string;
  valor: string | number;
  detalhe?: string;
  icon: string;
  iconClass: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <i className={`fas ${icon} text-base`}></i>
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
          {titulo}
        </p>
        <div className="flex items-end gap-2 mt-1">
          <h3 className="text-xl font-bold text-slate-800 leading-none">{valor}</h3>
          {detalhe && <span className="text-[10px] text-slate-400 mb-0.5 truncate">{detalhe}</span>}
        </div>
      </div>
      {onClick && <i className="fas fa-chevron-right text-[9px] text-slate-300 shrink-0"></i>}
    </>
  );

  if (!onClick) {
    return <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3 text-left hover:border-slate-300 hover:shadow-md transition-all"
    >
      {body}
    </button>
  );
}

function BarraStatus({
  label,
  valor,
  total,
  icon,
  iconClass,
  onClick
}: {
  label: string;
  valor: number;
  total: number;
  icon: string;
  iconClass: string;
  onClick?: () => void;
}) {
  const percentual = total > 0 ? Math.min(100, (valor / total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left ${onClick ? 'cursor-pointer hover:bg-slate-50 rounded-lg p-1 -m-1 transition-colors' : 'cursor-default'}`}
    >
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
    </button>
  );
}

function BuscaFiltros({
  aves,
  config,
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus
}: {
  aves: Ave[];
  config: Config;
  busca: string;
  setBusca: (v: string) => void;
  filtroStatus: string;
  setFiltroStatus: (v: string) => void;
}) {
  const especies = Array.from(new Set(aves.map(a => a.species).filter(Boolean))).sort();
  const locais = Array.from(new Set([
    ...(config.locaisOvos || []),
    ...aves.map(a => a.local).filter(Boolean)
  ])).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por espécie, anilha, nome, sexo ou local..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-800"
          />
        </div>

        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="sm:w-48 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
        >
          <option value="">Todos os status</option>
          <option value="Ativo">Ativas</option>
          <option value="Vendido">Vendidas</option>
          <option value="Óbito">Óbito</option>
          <option value="No Ninho">No ninho</option>
        </select>
      </div>

      {(especies.length > 0 || locais.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-[10px] text-slate-400 self-center">Dados disponíveis:</span>
          {especies.slice(0, 8).map(especie => (
            <span key={especie} className="px-2 py-1 rounded-lg bg-slate-50 text-[10px] text-slate-500">{especie}</span>
          ))}
          {locais.slice(0, 5).map(local => (
            <span key={local} className="px-2 py-1 rounded-lg bg-emerald-50 text-[10px] text-emerald-700">{local}</span>
          ))}
        </div>
      )}
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
  const [filtroStatus, setFiltroStatus] = useState('');

  const termo = busca.trim().toLowerCase();

  const avesFiltradas = aves.filter(ave => {
    if (filtroStatus && ave.status !== filtroStatus) return false;
    if (!termo) return true;

    return [
      ave.species,
      ave.ring,
      ave.name,
      ave.sex,
      ave.status,
      ave.local,
      ave.porta,
      ave.corCabeca,
      ave.corPeito,
      ave.corDorso
    ]
      .filter(v => v !== undefined && v !== null)
      .some(v => String(v).toLowerCase().includes(termo));
  });

  const avesAtivas = avesFiltradas.filter(a => a.status === 'Ativo');
  const machos = avesAtivas.filter(a => a.sex === 'Macho').length;
  const femeas = avesAtivas.filter(a => a.sex === 'Fêmea').length;

  const casaisAtivos = casais.filter(casal => {
    const macho = aves.find(a => a.id === casal.mId);
    const femea = aves.find(a => a.id === casal.fId);
    return macho?.status === 'Ativo' && femea?.status === 'Ativo';
  });

  const ninhosAtivos = ninhos.filter(n => n.active);
  const ovos = ninhos.flatMap(n => n.eggs || []);

  const ovosChocando = ovos.filter(e => e.status === 'Chocando').length;
  const ovosFerteis = ovos.filter(e => e.status === 'Fértil').length;
  const ovosEclodidos = ovos.filter(e => e.status === 'Eclodido').length;
  const ovosEmEspera = ovos.filter(e => e.status === 'Em Espera').length;
  const ovosInferteis = ovos.filter(e => e.status === 'Infértil').length;
  const ovosPerdidos = ovos.filter(e => e.status === 'Perdido').length;

  const filhotes = casais.reduce((total, casal) => total + (casal.historico?.length || 0), 0);

  const mesAtual = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  const atencoes = ovos
    .flatMap((egg, index) => {
      const acoes: Array<{
        titulo: string;
        detalhe: string;
        data: string;
        icon: string;
        className: string;
      }> = [];

      const params = config.parametrosEspecies[egg.species || ''] || config.parametrosPadrao;

      if (egg.inicioChoca && (egg.status === 'Chocando' || egg.status === 'Em Espera')) {
        const d = new Date(`${egg.inicioChoca}T12:00:00`);
        d.setDate(d.getDate() + params.diasFertilidade);
        const data = d.toISOString().split('T')[0];
        const dias = diferencaDias(data);

        acoes.push({
          titulo: 'Verificar fertilidade',
          detalhe: `${egg.species || 'Espécie não informada'} • Ovo ${index + 1}${dias < 0 ? ` • atrasada ${Math.abs(dias)} dia(s)` : dias === 0 ? ' • hoje' : ` • em ${dias} dia(s)`}`,
          data,
          icon: 'fa-search',
          className: dias <= 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
        });
      }

      if (egg.inicioChoca && (egg.status === 'Chocando' || egg.status === 'Fértil')) {
        const d = new Date(`${egg.inicioChoca}T12:00:00`);
        d.setDate(d.getDate() + params.duracaoChoca);
        const data = egg.dataEclosao || d.toISOString().split('T')[0];
        const dias = diferencaDias(data);

        acoes.push({
          titulo: 'Previsão de eclosão',
          detalhe: `${egg.species || 'Espécie não informada'} • Ovo ${index + 1}${dias < 0 ? ` • atrasada ${Math.abs(dias)} dia(s)` : dias === 0 ? ' • hoje' : ` • em ${dias} dia(s)`}`,
          data,
          icon: 'fa-egg',
          className: dias <= 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
        });
      }

      if (egg.dataEclosao && egg.status === 'Eclodido' && !egg.filhoteAnilhado) {
        const d = new Date(`${egg.dataEclosao}T12:00:00`);
        d.setDate(d.getDate() + params.diasAnilhamento);
        const data = d.toISOString().split('T')[0];
        const dias = diferencaDias(data);

        acoes.push({
          titulo: 'Data de anilhamento',
          detalhe: `${egg.species || 'Espécie não informada'} • Ovo ${index + 1}${dias < 0 ? ` • atrasada ${Math.abs(dias)} dia(s)` : dias === 0 ? ' • hoje' : ` • em ${dias} dia(s)`}`,
          data,
          icon: 'fa-ring',
          className: dias <= 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-violet-50 text-violet-700 border-violet-100'
        });
      }

      if (egg.status === 'Em Espera' && egg.postura) {
        const diasDesdePostura = -diferencaDias(egg.postura);
        const prazo = config.prazoAlertaPostura || 15;

        if (diasDesdePostura >= prazo) {
          acoes.push({
            titulo: 'Ovo aguardando ação',
            detalhe: `${egg.species || 'Espécie não informada'} • ${diasDesdePostura} dia(s) desde a postura`,
            data: egg.postura,
            icon: 'fa-clock',
            className: 'bg-orange-50 text-orange-700 border-orange-100'
          });
        }
      }

      return acoes;
    })
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 8);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between bg-white rounded-2xl border border-slate-200/80 shadow-sm px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-[0.18em]">GouldPRO</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-0.5">Visão geral</h2>
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

      <BuscaFiltros
        aves={aves}
        config={config}
        busca={busca}
        setBusca={setBusca}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <CardKpi
          titulo="Aves ativas"
          valor={avesAtivas.length}
          detalhe={`${machos} M / ${femeas} F`}
          icon="fa-dove"
          iconClass="bg-slate-100 text-slate-600"
          onClick={() => onNavigate('aves')}
        />
        <CardKpi
          titulo="Casais"
          valor={casais.length}
          detalhe={`${casaisAtivos.length} ativos`}
          icon="fa-heart"
          iconClass="bg-rose-50 text-rose-600"
          onClick={() => onNavigate('casais')}
        />
        <CardKpi
          titulo="Ninhos"
          valor={ninhos.length}
          detalhe={`${ninhosAtivos.length} ativos`}
          icon="fa-home"
          iconClass="bg-amber-50 text-amber-600"
          onClick={() => onNavigate('ninhos')}
        />
        <CardKpi
          titulo="Ovos"
          valor={ovos.length}
          detalhe={`${ovosChocando} chocando`}
          icon="fa-egg"
          iconClass="bg-emerald-50 text-emerald-600"
          onClick={() => onNavigate('ninhos')}
        />
        <CardKpi
          titulo="Filhotes"
          valor={filhotes}
          detalhe="histórico"
          icon="fa-feather"
          iconClass="bg-violet-50 text-violet-600"
          onClick={() => onNavigate('casais')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Reprodução</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Distribuição dos ovos cadastrados</p>
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
            <BarraStatus label="Chocando" valor={ovosChocando} total={ovos.length} icon="fa-fire" iconClass="text-orange-500" onClick={() => onNavigate('ninhos')} />
            <BarraStatus label="Férteis" valor={ovosFerteis} total={ovos.length} icon="fa-check-circle" iconClass="text-emerald-500" onClick={() => onNavigate('ninhos')} />
            <BarraStatus label="Eclodidos" valor={ovosEclodidos} total={ovos.length} icon="fa-feather-alt" iconClass="text-violet-500" onClick={() => onNavigate('ninhos')} />
            <BarraStatus label="Em espera" valor={ovosEmEspera} total={ovos.length} icon="fa-clock" iconClass="text-slate-400" onClick={() => onNavigate('ninhos')} />
            <BarraStatus label="Inférteis" valor={ovosInferteis} total={ovos.length} icon="fa-minus-circle" iconClass="text-blue-500" onClick={() => onNavigate('ninhos')} />
            <BarraStatus label="Perdidos" valor={ovosPerdidos} total={ovos.length} icon="fa-exclamation-circle" iconClass="text-red-500" onClick={() => onNavigate('ninhos')} />
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total de ovos</span>
            <span className="text-sm font-bold text-slate-700">{ovos.length}</span>
            <span className="text-[10px] text-slate-400">{ninhosAtivos.length} ninho(s) ativo(s)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Atenção</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Próximas ações relacionadas à reprodução</p>
            </div>
            <i className="fas fa-bell text-amber-500 text-sm"></i>
          </div>

          {atencoes.length > 0 ? (
            <div className="space-y-2.5">
              {atencoes.map((item, index) => (
                <button
                  key={`${item.titulo}-${item.data}-${index}`}
                  type="button"
                  onClick={() => onNavigate('ninhos')}
                  className={`w-full text-left rounded-xl border p-3 ${item.className} hover:shadow-sm transition-all`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
                      <i className={`fas ${item.icon} text-[11px]`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold">{item.titulo}</p>
                      <p className="text-[10px] mt-0.5 opacity-80">{item.detalhe}</p>
                      <p className="text-[9px] mt-1 opacity-60">{formatarData(item.data)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="min-h-[170px] flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center mb-2">
                <i className="fas fa-check text-sm"></i>
              </div>
              <p className="text-xs font-semibold text-slate-500">Nenhuma atenção pendente</p>
              <p className="text-[10px] text-slate-400 mt-1">O dashboard não identificou ações urgentes.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">Acesso rápido</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Vá direto para as áreas mais usadas</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { tab: 'aves' as TabType, label: 'Plantel', detalhe: `${avesAtivas.length} aves ativas`, icon: 'fa-dove', cls: 'bg-slate-50 text-slate-700 hover:bg-slate-100' },
            { tab: 'casais' as TabType, label: 'Casais', detalhe: `${casais.length} cadastrados`, icon: 'fa-heart', cls: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
            { tab: 'ninhos' as TabType, label: 'Ninhos', detalhe: `${ninhos.length} cadastrados`, icon: 'fa-egg', cls: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
            { tab: 'calendario' as TabType, label: 'Calendário', detalhe: 'Ver agenda', icon: 'fa-calendar-alt', cls: 'bg-blue-50 text-blue-700 hover:bg-blue-100' }
          ].map(item => (
            <button
              key={item.tab}
              type="button"
              onClick={() => onNavigate(item.tab)}
              className={`text-left rounded-xl p-3.5 transition-all ${item.cls}`}
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
