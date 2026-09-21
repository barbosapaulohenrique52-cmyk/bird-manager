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

  const dadosGraficoStatus = [
    { label: 'Chocando', valor: status.chocando, classe: 'bg-orange-400' },
    { label: 'Férteis', valor: status.ferteis, classe: 'bg-emerald-500' },
    { label: 'Eclodidos', valor: status.eclodidos, classe: 'bg-violet-500' },
    { label: 'Em espera', valor: status.espera, classe: 'bg-slate-400' },
    { label: 'Inférteis', valor: status.inferteis, classe: 'bg-blue-500' },
    { label: 'Perdidos', valor: status.perdidos, classe: 'bg-red-500' }
  ];

  const dadosGraficoEspecies = Array.from(
    ovos.reduce((mapa, item) => {
      const especie = item.egg.species?.trim() || 'Não informada';
      mapa.set(especie, (mapa.get(especie) || 0) + 1);
      return mapa;
    }, new Map<string, number>())
  )
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 6);

  const maiorValorEspecie = Math.max(1, ...dadosGraficoEspecies.map(item => item.valor));

  const formatarMesGrafico = (data: Date) =>
    data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

  const chaveMesGrafico = (data: string) => {
    const match = data.match(/^(\d{4})-(\d{1,2})/);
    if (!match) return null;
    return `${match[1]}-${match[2].padStart(2, '0')}`;
  };

  const mesesEvolucao = Array.from({ length: 6 }, (_, index) => {
    const data = new Date();
    data.setDate(1);
    data.setMonth(data.getMonth() - (5 - index));
    return {
      chave: `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`,
      label: formatarMesGrafico(data)
    };
  });

  const dadosGraficoEvolucao = mesesEvolucao.map((mes) => {
    const ovosPostados = ovos.filter(({ egg }) =>
      egg.postura && chaveMesGrafico(egg.postura) === mes.chave
    ).length;

    const eclodidos = ovos.filter(({ egg }) =>
      egg.dataEclosao && chaveMesGrafico(egg.dataEclosao) === mes.chave
    ).length;

    const filhotesRegistrados = ovos.filter(({ egg }) =>
      egg.dataEclosao &&
      egg.filhoteId &&
      chaveMesGrafico(egg.dataEclosao) === mes.chave
    ).length;

    return {
      ...mes,
      ovosPostados,
      eclodidos,
      filhotes: filhotesRegistrados
    };
  });

  const maiorValorEvolucao = Math.max(
    1,
    ...dadosGraficoEvolucao.flatMap((item) => [
      item.ovosPostados,
      item.eclodidos,
      item.filhotes
    ])
  );

  const navegarParaNinhosComFiltro = (
    filtro: 'todos' | 'ovos' | 'filhotes' | 'Em Espera' | 'Chocando' | 'Fértil' | 'Infértil' | 'Eclodido' | 'Perdido',
    expandir = false
  ) => {
    (window as any).__gouldproExpandirNinhos = expandir;
    // O Dashboard pode estar montado enquanto Ninhos está desmontado.
    // Portanto, o filtro precisa ficar disponível antes da navegação.
    (window as any).__gouldproNinhosFiltro = filtro;
    window.dispatchEvent(
      new CustomEvent('gouldpro-ninhos-filtro', {
        detail: { filtro }
      })
    );
    onNavigate('ninhos');
  };

  const proximasAcoes = (() => {
    type AcaoBase = {
      titulo: string;
      data: string;
      detalhe: string;
      tipo: 'fertilidade' | 'eclosao' | 'anilhamento';
      eggId: string;
      eggIds?: string[];
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
        !egg.filhoteAnilhado
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
     * Agrupa ações equivalentes pelo mesmo tipo + nome de ninho + data.
     * Ex.: 4 ovos do mesmo ninho com fertilidade prevista para 25/09
     * passam a aparecer como uma única ação "4 ovos".
     */
    const grupos = new Map<string, AcaoBase[]>();

    acoesIndividuais.forEach((acao) => {
      /*
       * O agrupamento usa a identidade REAL do ninho (ninhoId),
       * e não apenas o nome exibido. Isso é importante porque podem
       * existir dois ninhos com o mesmo nome, por exemplo "N1" ou
       * "Ninho sem nome". Nesse caso eles não devem ser misturados.
       *
       * A data calculada da ação também é obrigatória na chave.
       * Portanto, ovos do mesmo ninho só são agrupados quando
       * pertencem à mesma ação e possuem a mesma data.
       */
      const chave = [
        acao.tipo,
        acao.titulo.trim().toLowerCase(),
        acao.ninhoId,
        acao.data
      ].join('::');

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
          eggIds: grupo.map((acao) => acao.eggId),
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
                onClick={() => {
                  const filtroPorLabel: Record<string, 'Em Espera' | 'Chocando' | 'Fértil' | 'Infértil' | 'Eclodido' | 'Perdido'> = {
                    'Chocando': 'Chocando',
                    'Férteis': 'Fértil',
                    'Eclodidos': 'Eclodido',
                    'Em espera': 'Em Espera',
                    'Inférteis': 'Infértil',
                    'Perdidos': 'Perdido',
                  };

                  const filtro = filtroPorLabel[String(label)];
                  if (filtro) navegarParaNinhosComFiltro(filtro);
                }}
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
                  onClick={() => {
                    // Quando a ação foi agrupada, guarda todos os ovos do grupo
                    // para que a tela de Ninhos possa destacar/piscar todos.
                    (window as any).__gouldproOvosAlvos = acao.eggIds?.length
                      ? acao.eggIds.map((eggId) => ({ ninhoId: acao.ninhoId, eggId }))
                      : [{ ninhoId: acao.ninhoId, eggId: acao.eggId }];

                    onOpenOvo(acao.ninhoId, acao.eggId);
                  }}
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


      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Evolução da reprodução</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Últimos 6 meses: postura, eclosão e filhotes registrados
            </p>
          </div>
          <i className="fas fa-chart-line text-emerald-500"></i>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Ovos
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
            Eclodidos
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Filhotes
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2 items-end h-48">
          {dadosGraficoEvolucao.map((item) => (
            <div key={item.chave} className="h-full flex flex-col justify-end min-w-0">
              <div className="flex-1 flex items-end justify-center gap-0.5 sm:gap-1">
                <div
                  title={`${item.ovosPostados} ovos`}
                  className="w-1/3 max-w-5 rounded-t bg-emerald-500 transition-all"
                  style={{ height: `${Math.max(item.ovosPostados ? 6 : 1, (item.ovosPostados / maiorValorEvolucao) * 100)}%` }}
                />
                <div
                  title={`${item.eclodidos} eclodidos`}
                  className="w-1/3 max-w-5 rounded-t bg-violet-500 transition-all"
                  style={{ height: `${Math.max(item.eclodidos ? 6 : 1, (item.eclodidos / maiorValorEvolucao) * 100)}%` }}
                />
                <div
                  title={`${item.filhotes} filhotes`}
                  className="w-1/3 max-w-5 rounded-t bg-amber-500 transition-all"
                  style={{ height: `${Math.max(item.filhotes ? 6 : 1, (item.filhotes / maiorValorEvolucao) * 100)}%` }}
                />
              </div>
              <div className="text-center mt-2">
                <span className="text-[9px] font-semibold text-slate-500 capitalize">{item.label}</span>
              </div>
              <div className="text-center mt-0.5 text-[8px] text-slate-400">
                {item.ovosPostados}/{item.eclodidos}/{item.filhotes}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-slate-400 mt-4">
          Filhotes no gráfico = ovos eclodidos que possuem filhote registrado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Gráfico de reprodução</h3>
              <p className="text-[11px] text-slate-400 mt-1">Quantidade de ovos por estado</p>
            </div>
            <i className="fas fa-chart-bar text-emerald-500"></i>
          </div>

          <div className="space-y-3">
            {dadosGraficoStatus.map((item) => {
              const percentual = ovos.length ? (item.valor / ovos.length) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-slate-600">{item.label}</span>
                    <span className="text-[10px] font-bold text-slate-700">{item.valor}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.classe} transition-all`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Ovos por espécie</h3>
              <p className="text-[11px] text-slate-400 mt-1">Distribuição dos ovos cadastrados</p>
            </div>
            <i className="fas fa-chart-column text-emerald-500"></i>
          </div>

          {dadosGraficoEspecies.length === 0 ? (
            <div className="py-8 text-center">
              <i className="fas fa-chart-column text-slate-200 text-2xl"></i>
              <p className="text-xs text-slate-400 mt-2">Nenhum ovo cadastrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dadosGraficoEspecies.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1 gap-3">
                    <span className="text-[10px] font-semibold text-slate-600 truncate">{item.label}</span>
                    <span className="text-[10px] font-bold text-slate-700 shrink-0">{item.valor}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${(item.valor / maiorValorEspecie) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
