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
  const avesAtivas = aves.filter(ave => {
    const status = String(ave.status || 'Ativo').trim().toLowerCase();
    return status === 'ativo';
  });

  const machos = avesAtivas.filter(ave => ave.sex === 'Macho').length;
  const femeas = avesAtivas.filter(ave => ave.sex === 'Fêmea').length;

  const ninhosAtivos = ninhos.filter(ninho => ninho.active).length;
  const ovos = contarOvos(ninhos);

  const ovosChocando = ovos.filter(egg => egg.status === 'Chocando').length;
  const ovosFerteis = ovos.filter(egg => egg.status === 'Fértil').length;
  const ovosEclodidos = ovos.filter(egg => egg.status === 'Eclodido').length;
  const ovosPerdidos = ovos.filter(egg => egg.status === 'Perdido').length;
  const ovosEmEspera = ovos.filter(egg => egg.status === 'Em Espera').length;
  const ovosInferteis = ovos.filter(egg => egg.status === 'Infértil').length;

  const casaisAtivos = casais.filter(casal => {
    const macho = aves.find(ave => ave.id === casal.mId);
    const femea = aves.find(ave => ave.id === casal.fId);

    return (
      macho?.status === 'Ativo' &&
      femea?.status === 'Ativo'
    );
  }).length;

  const filhotes = casais.reduce(
    (total, casal) => total + (casal.historico?.length || 0),
    0
  );

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
