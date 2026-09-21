import type { Ave, Casal, Config, Ninho } from '../App';

interface DashboardSectionProps {
  aves: Ave[];
  casais: Casal[];
  ninhos: Ninho[];
  config: Config;
  onOpenOvo: (ninhoId: string, eggId: string) => void;
  onNavigate: (tab: 'dashboard' | 'ninhos' | 'aves' | 'casais' | 'calendario' | 'financeiro' | 'config') => void;
}

function formatarData(data?: string) {
  if (!data) return '—';
  const match = data.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) return `${match[3].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[1].slice(-2)}`;
  return data;
}

function diasAte(data: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(`${data}T00:00:00`);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

function textoPrazo(data: string) {
  const dias = diasAte(data);
  if (dias < 0) return `Atrasada ${Math.abs(dias)} dia(s)`;
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  return `Em ${dias} dias`;
}

export function DashboardSection({
  aves,
  casais,
  ninhos,
  config,
  onOpenOvo,
  onNavigate
}: DashboardSectionProps) {
  const avesAtivas = aves.filter(ave => ave.status === 'Ativo');
  const casaisAtivos = casais.filter(casal => {
    const macho = aves.find(ave => ave.id === casal.mId);
    const femea = aves.find(ave => ave.id === casal.fId);
    return macho?.status === 'Ativo' && femea?.status === 'Ativo';
  });

  const ninhosAtivos = ninhos.filter(ninho => ninho.active);
  const ovos = ninhos.flatMap(ninho =>
    (ninho.eggs || []).map(egg => ({ egg, ninho }))
  );

  const status = {
    espera: ovos.filter(item => item.egg.status === 'Em Espera').length,
    chocando: ovos.filter(item => item.egg.status === 'Chocando').length,
    ferteis: ovos.filter(item => item.egg.status === 'Fértil').length,
    inferteis: ovos.filter(item => item.egg.status === 'Infértil').length,
    eclodidos: ovos.filter(item => item.egg.status === 'Eclodido').length,
    perdidos: ovos.filter(item => item.egg.status === 'Perdido').length
  };

  const filhotes = casais.reduce(
    (total, casal) => total + (casal.historico?.length || 0),
    0
  );

  const navegarParaNinhosComFiltro = (
    filtro: 'todos' | 'ovos' | 'filhotes' | 'Em Espera' | 'Chocando' | 'Fértil' | 'Infértil' | 'Eclodido' | 'Perdido',
    expandir = false
  ) => {
    (window as any).__gouldproExpandirNinhos = expandir;
    onNavigate('ninhos');
    window.dispatchEvent(
      new CustomEvent('gouldpro-ninhos-filtro', {
        detail: { filtro }
      })
    );
  };

  const proximasAcoes = (() => {
    type AcaoBase = {
      titulo: string;
      data: string;
      detalhe: string;
      tipo: 'fertilidade' | 'eclosao' | 'anilhamento';
      eggId: string;
      ninhoId: string;
      especie: string;
    };

    const acoesIndividuais: AcaoBase[] = [];

    ovos.forEach(({ egg, ninho }) => {
      const especie = egg.species || '';
      const parametros =
        config.parametrosEspecies?.[especie] ||
        config.parametrosPadrao;

      if (
        egg.inicioChoca &&
        (egg.status === 'Chocando' || egg.status === 'Em Espera')
      ) {
        const data = new Date(`${egg.inicioChoca}T12:00:00`);
        data.setDate(data.getDate() + parametros.diasFertilidade);

        acoesIndividuais.push({
          titulo: 'Verificar fertilidade',
          data: data.toISOString().split('T')[0],
          detalhe: `Ninho ${ninho.name || 'Ninho sem nome'}`,
          tipo: 'fertilidade',
          eggId: egg.id,
          ninhoId: ninho.id,
          especie: egg.species || 'Espécie não informada'
        });
      }

      if (
        egg.inicioChoca &&
        (egg.status === 'Chocando' || egg.status === 'Fértil')
      ) {
        const data = egg.dataEclosao
          ? new Date(`${egg.dataEclosao}T12:00:00`)
          : new Date(`${egg.inicioChoca}T12:00:00`);

        if (!egg.dataEclosao) {
          data.setDate(data.getDate() + parametros.duracaoChoca);
        }

        acoesIndividuais.push({
          titulo: 'Previsão de eclosão',
          data: data.toISOString().split('T')[0],
          detalhe: `Ninho ${ninho.name || 'Ninho sem nome'}`,
          tipo: 'eclosao',
          eggId: egg.id,
          ninhoId: ninho.id,
          especie: egg.species || 'Espécie não informada'
        });
      }

      if (
        egg.dataEclosao &&
        egg.status === 'Eclodido' &&
        !egg.filhoteAnilhado &&
        !egg.naoAnilhar
      ) {
        const data = new Date(`${egg.dataEclosao}T12:00:00`);
        data.setDate(data.getDate() + parametros.diasAnilhamento);

        acoesIndividuais.push({
          titulo: 'Data de anilhamento',
          data: data.toISOString().split('T')[0],
          detalhe: `Ninho ${ninho.name || 'Ninho sem nome'}`,
          tipo: 'anilhamento',
          eggId: egg.id,
          ninhoId: ninho.id,
          especie: egg.species || 'Espécie não informada'
        });
      }
    });

    /*
     * Agrupa ações equivalentes pelo mesmo tipo + ninho + data.
     * Ex.: 4 ovos do N1 com fertilidade prevista para 25/09
     * passam a aparecer como uma única ação "4 ovos".
     */
    const grupos = new Map<string, AcaoBase[]>();

    acoesIndividuais.forEach((acao) => {
      const chave = `${acao.tipo}::${acao.ninhoId}::${acao.data}`;
      const grupo = grupos.get(chave);

      if (grupo) {
        grupo.push(acao);
      } else {
        grupos.set(chave, [acao]);
      }
    });

    return Array.from(grupos.values())
      .map((grupo) => {
        const primeira = grupo[0];
        const quantidade = grupo.length;

        return {
          ...primeira,
          quantidade,
          detalhe: `${primeira.detalhe} • ${quantidade} ${
            quantidade === 1 ? 'ovo' : 'ovos'
          }`
        };
      })
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 6);
  })();

  return (
    <section className="w-full space-y-5 pb-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.18em]">
          GouldPRO
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Visão geral
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Resumo do plantel e da reprodução
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('aves')}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-left hover:shadow-md transition-all"
        >
          <i className="fas fa-dove text-slate-600"></i>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-3">Aves ativas</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{avesAtivas.length}</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('casais')}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-left hover:shadow-md transition-all"
        >
          <i className="fas fa-heart text-rose-500"></i>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-3">Casais</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{casais.length}</p>
          <p className="text-[10px] text-slate-400">{casaisAtivos.length} ativos</p>
        </button>

        <button
          type="button"
          onClick={() => navegarParaNinhosComFiltro('todos')}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-left hover:shadow-md transition-all"
        >
          <i className="fas fa-home text-amber-500"></i>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-3">Ninhos</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{ninhos.length}</p>
          <p className="text-[10px] text-slate-400">{ninhosAtivos.length} ativos</p>
        </button>

        <button
          type="button"
          onClick={() => navegarParaNinhosComFiltro('ovos', true)}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-left hover:shadow-md transition-all"
        >
          <i className="fas fa-egg text-emerald-600"></i>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-3">Ovos</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{ovos.length}</p>
          <p className="text-[10px] text-slate-400">{status.chocando} chocando</p>
        </button>

        <button
          type="button"
          onClick={() => navegarParaNinhosComFiltro('filhotes')}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-left hover:shadow-md transition-all"
        >
          <i className="fas fa-feather text-violet-500"></i>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-3">Filhotes</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{filhotes}</p>
          <p className="text-[10px] text-slate-400">histórico</p>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800">Reprodução</h3>
          <p className="text-[11px] text-slate-400 mt-1 mb-5">
            Distribuição dos ovos cadastrados
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              ['Chocando', status.chocando, 'text-orange-500'],
              ['Férteis', status.ferteis, 'text-emerald-500'],
              ['Eclodidos', status.eclodidos, 'text-violet-500'],
              ['Em espera', status.espera, 'text-slate-400'],
              ['Inférteis', status.inferteis, 'text-blue-500'],
              ['Perdidos', status.perdidos, 'text-red-500']
            ].map(([label, valor, classe]) => (
              <button
                key={String(label)}
                type="button"
                onClick={() => navegarParaNinhosComFiltro(
                  label === 'Em espera' ? 'Em Espera' : String(label) as 'Chocando' | 'Fértil' | 'Eclodido' | 'Infértil' | 'Perdido'
                )}
                className="text-left rounded-xl p-2 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${classe}`}>{label}</span>
                  <span className="text-sm font-bold text-slate-700">{valor}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-current ${classe}`}
                    style={{ width: `${ovos.length ? (Number(valor) / ovos.length) * 100 : 0}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Próximas ações</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Clique para abrir o ovo correspondente
              </p>
            </div>
            <i className="fas fa-bell text-amber-500"></i>
          </div>

          {proximasAcoes.length === 0 ? (
            <div className="py-10 text-center">
              <i className="fas fa-check-circle text-slate-300 text-2xl"></i>
              <p className="text-xs font-semibold text-slate-500 mt-2">
                Nenhuma ação pendente
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {proximasAcoes.map((acao, index) => (
                <button
                  key={`${acao.ninhoId}-${acao.data}-${acao.tipo}-${index}`}
                  type="button"
                  onClick={() => onOpenOvo(acao.ninhoId, acao.eggId)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm p-3 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <i className={`fas ${
                        acao.tipo === 'fertilidade'
                          ? 'fa-search text-blue-500'
                          : acao.tipo === 'eclosao'
                            ? 'fa-egg text-emerald-500'
                            : 'fa-ring text-violet-500'
                      } text-xs`}></i>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-700">
                        {acao.titulo}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {acao.especie} • {acao.detalhe}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-slate-600">
                          {formatarData(acao.data)}
                        </span>
                        <span className="text-[9px] text-emerald-600 font-bold">
                          {textoPrazo(acao.data)}
                        </span>
                      </div>
                    </div>

                    <i className="fas fa-chevron-right text-[9px] text-slate-300 mt-2"></i>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
