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
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

function diasAte(data: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(`${data}T00:00:00`);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
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
  detalhe: string;
  icon: string;
  iconClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 text-left hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <i className={`fas ${icon} text-base`}></i>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">{titulo}</p>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-xl font-bold text-slate-800 leading-none">{valor}</span>
          <span className="text-[10px] text-slate-400 truncate">{detalhe}</span>
        </div>
      </div>
      <i className="fas fa-chevron-right text-[9px] text-slate-300 shrink-0"></i>
    </button>
  );
}

function StatusItem({
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
  onClick: () => void;
}) {
  const percentual = total ? Math.min(100, (valor / total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-2 -m-2 rounded-xl hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <i className={`fas ${icon} text-[11px] ${iconClass}`}></i>
          {label}
        </span>
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

export function DashboardSection({
  aves: avesProp,
  casais: casaisProp,
  ninhos: ninhosProp,
  config: configProp,
  onNavigate
}: DashboardSectionProps) {
  /*
   * O Dashboard é deliberadamente independente das estruturas opcionais
   * de configuração. Isso evita que uma configuração antiga ou incompleta
   * impeça a tela Inicial de renderizar.
   */
  const aves = Array.isArray(avesProp) ? avesProp : [];
  const casais = Array.isArray(casaisProp) ? casaisProp : [];
  const ninhos = Array.isArray(ninhosProp) ? ninhosProp : [];
  const config = configProp || ({} as Config);

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
      ave.corDorso,
      ave.nota
    ]
      .filter(v => v !== undefined && v !== null)
      .some(v => String(v).toLowerCase().includes(termo));
  });

  const avesAtivas = avesFiltradas.filter(ave => ave.status === 'Ativo');
  const machos = avesAtivas.filter(ave => ave.sex === 'Macho').length;
  const femeas = avesAtivas.filter(ave => ave.sex === 'Fêmea').length;

  const casaisAtivos = casais.filter(casal => {
    const macho = aves.find(ave => ave.id === casal.mId);
    const femea = aves.find(ave => ave.id === casal.fId);
    return macho?.status === 'Ativo' && femea?.status === 'Ativo';
  });

  const ninhosAtivos = ninhos.filter(ninho => ninho.active);
  const ovos = ninhos.flatMap(ninho => Array.isArray(ninho.eggs) ? ninho.eggs : []);

  const ovosChocando = ovos.filter(egg => egg.status === 'Chocando').length;
  const ovosFerteis = ovos.filter(egg => egg.status === 'Fértil').length;
  const ovosEclodidos = ovos.filter(egg => egg.status === 'Eclodido').length;
  const ovosEspera = ovos.filter(egg => egg.status === 'Em Espera').length;
  const ovosInferteis = ovos.filter(egg => egg.status === 'Infértil').length;
  const ovosPerdidos = ovos.filter(egg => egg.status === 'Perdido').length;

  const filhotes = casais.reduce(
    (total, casal) => total + (Array.isArray(casal.historico) ? casal.historico.length : 0),
    0
  );

  const mesAtual = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  /*
   * Próximas ações.
   * Os valores padrão abaixo mantêm o Dashboard funcional mesmo quando
   * a configuração de parâmetros ainda não estiver disponível.
   */
  const parametrosPadrao = {
    diasFertilidade: Number(config.parametrosPadrao?.diasFertilidade) || 7,
    duracaoChoca: Number(config.parametrosPadrao?.duracaoChoca) || 14,
    diasAnilhamento: Number(config.parametrosPadrao?.diasAnilhamento) || 7
  };

  const acoes = ovos.flatMap((egg, index) => {
    const parametros = config.parametrosEspecies?.[egg.species || ''] || parametrosPadrao;
    const resultado: Array<{
      titulo: string;
      detalhe: string;
      data: string;
      icon: string;
      classe: string;
    }> = [];

    if (egg.inicioChoca && (egg.status === 'Chocando' || egg.status === 'Em Espera')) {
      const data = new Date(`${egg.inicioChoca}T12:00:00`);
      data.setDate(data.getDate() + parametros.diasFertilidade);
      const dataTexto = data.toISOString().split('T')[0];
      const dias = diasAte(dataTexto);

      resultado.push({
        titulo: 'Verificar fertilidade',
        detalhe: `${egg.species || 'Espécie não informada'} • Ovo ${index + 1}`,
        data: dataTexto,
        icon: 'fa-search',
        classe: dias <= 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
      });
    }

    if (egg.inicioChoca && (egg.status === 'Chocando' || egg.status === 'Fértil')) {
      const data = new Date(`${egg.inicioChoca}T12:00:00`);
      data.setDate(data.getDate() + parametros.duracaoChoca);
      const dataTexto = egg.dataEclosao || data.toISOString().split('T')[0];
      const dias = diasAte(dataTexto);

      resultado.push({
        titulo: 'Previsão de eclosão',
        detalhe: `${egg.species || 'Espécie não informada'} • Ovo ${index + 1}`,
        data: dataTexto,
        icon: 'fa-egg',
        classe: dias <= 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
      });
    }

    if (egg.dataEclosao && egg.status === 'Eclodido' && !egg.filhoteAnilhado) {
      const data = new Date(`${egg.dataEclosao}T12:00:00`);
      data.setDate(data.getDate() + parametros.diasAnilhamento);
      const dataTexto = data.toISOString().split('T')[0];
      const dias = diasAte(dataTexto);

      resultado.push({
        titulo: 'Data de anilhamento',
        detalhe: `${egg.species || 'Espécie não informada'} • Ovo ${index + 1}`,
        data: dataTexto,
        icon: 'fa-ring',
        classe: dias <= 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-violet-50 text-violet-700 border-violet-100'
      });
    }

    return resultado;
  })
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 6);

  return (
    <section className="space-y-5 pb-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.18em]">GouldPRO</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">Visão geral</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 capitalize">
            Resumo do seu plantel e da reprodução • {mesAtual}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('calendario')}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-2"
        >
          <i className="fas fa-calendar-alt text-emerald-600"></i>
          VER CALENDÁRIO
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar no plantel por espécie, anilha, nome, sexo, status ou local..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="sm:w-44 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="">Todos os status</option>
            <option value="Ativo">Ativas</option>
            <option value="No Ninho">No ninho</option>
            <option value="Vendido">Vendidas</option>
            <option value="Óbito">Óbito</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
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

      {/* Reprodução + Atenção */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Reprodução</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Distribuição dos ovos cadastrados</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ninhos')}
              className="text-[10px] font-bold text-emerald-600 uppercase"
            >
              Ver ninhos
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
            <StatusItem label="Chocando" valor={ovosChocando} total={ovos.length} icon="fa-fire" iconClass="text-orange-500" onClick={() => onNavigate('ninhos')} />
            <StatusItem label="Férteis" valor={ovosFerteis} total={ovos.length} icon="fa-check-circle" iconClass="text-emerald-500" onClick={() => onNavigate('ninhos')} />
            <StatusItem label="Eclodidos" valor={ovosEclodidos} total={ovos.length} icon="fa-feather-alt" iconClass="text-violet-500" onClick={() => onNavigate('ninhos')} />
            <StatusItem label="Em espera" valor={ovosEspera} total={ovos.length} icon="fa-clock" iconClass="text-slate-400" onClick={() => onNavigate('ninhos')} />
            <StatusItem label="Inférteis" valor={ovosInferteis} total={ovos.length} icon="fa-minus-circle" iconClass="text-blue-500" onClick={() => onNavigate('ninhos')} />
            <StatusItem label="Perdidos" valor={ovosPerdidos} total={ovos.length} icon="fa-exclamation-circle" iconClass="text-red-500" onClick={() => onNavigate('ninhos')} />
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex gap-5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total de ovos</span>
            <span className="text-sm font-bold text-slate-700">{ovos.length}</span>
            <span className="text-[10px] text-slate-400">{ninhosAtivos.length} ninho(s) ativo(s)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Atenção</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Próximas ações relacionadas à reprodução</p>
            </div>
            <i className="fas fa-bell text-amber-500 text-sm"></i>
          </div>

          {acoes.length > 0 ? (
            <div className="space-y-2.5">
              {acoes.map((item, index) => (
                <button
                  key={`${item.titulo}-${item.data}-${index}`}
                  type="button"
                  onClick={() => onNavigate('ninhos')}
                  className={`w-full text-left rounded-xl border p-3 ${item.classe} hover:shadow-sm transition-all`}
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
              <p className="text-[10px] text-slate-400 mt-1">O dashboard não identificou ações pendentes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Acesso rápido */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">Acesso rápido</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Vá direto para as áreas mais usadas</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { tab: 'aves' as TabType, label: 'Plantel', detalhe: `${avesAtivas.length} aves ativas`, icon: 'fa-dove', classe: 'bg-slate-50 text-slate-700 hover:bg-slate-100' },
            { tab: 'casais' as TabType, label: 'Casais', detalhe: `${casais.length} cadastrados`, icon: 'fa-heart', classe: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
            { tab: 'ninhos' as TabType, label: 'Ninhos', detalhe: `${ninhos.length} cadastrados`, icon: 'fa-egg', classe: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
            { tab: 'calendario' as TabType, label: 'Calendário', detalhe: 'Ver agenda', icon: 'fa-calendar-alt', classe: 'bg-blue-50 text-blue-700 hover:bg-blue-100' }
          ].map(item => (
            <button
              key={item.tab}
              type="button"
              onClick={() => onNavigate(item.tab)}
              className={`text-left rounded-xl p-3.5 transition-all ${item.classe}`}
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
