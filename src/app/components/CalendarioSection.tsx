import { useState, useEffect } from 'react';
import type { Ave, Casal, Ninho, Config } from '../App';

interface CalendarioSectionProps {
  aves: Ave[];
  casais: Casal[];
  ninhos: Ninho[];
  config: Config;
  onNavigate: (tab: string) => void;
}

interface Evento {
  id: string;
  tipo: 'fertilidade' | 'eclosao' | 'saida' | 'alerta_postura' | 'manual';
  data: string;
  titulo: string;
  descricao: string;
  casalId?: string;
  ninhoId?: string;
  urgencia: 'baixa' | 'media' | 'alta';
  diasPassados?: number;
  manual?: boolean;
  hora?: string;
  recorrencia?: 'nao' | 'diaria' | 'semanal' | 'mensal' | 'anual';
  categoria?: string;
}

export function CalendarioSection({ aves, casais, ninhos, config, onNavigate }: CalendarioSectionProps) {
  const hoje = new Date();

  // Estados para eventos manuais
  const [eventosManuais, setEventosManuais] = useState<Evento[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);

  // Carregar eventos manuais do localStorage
  useEffect(() => {
    const salvos = localStorage.getItem('gpro_v19_eventos_manuais');
    if (salvos) {
      setEventosManuais(JSON.parse(salvos));
    }
  }, []);

  // Salvar eventos manuais no localStorage
  const salvarEventosManuais = (eventos: Evento[]) => {
    localStorage.setItem('gpro_v19_eventos_manuais', JSON.stringify(eventos));
    setEventosManuais(eventos);
  };

  // Gerar eventos recorrentes
  const gerarEventosRecorrentes = (evento: Evento): Evento[] => {
    if (!evento.recorrencia || evento.recorrencia === 'nao') {
      return [evento];
    }

    const eventos: Evento[] = [];
    const dataInicial = new Date(evento.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Gerar próximas 10 ocorrências futuras
    for (let i = 0; i < 10; i++) {
      const novaData = new Date(dataInicial);

      switch (evento.recorrencia) {
        case 'diaria':
          novaData.setDate(novaData.getDate() + i);
          break;
        case 'semanal':
          novaData.setDate(novaData.getDate() + (i * 7));
          break;
        case 'mensal':
          novaData.setMonth(novaData.getMonth() + i);
          break;
        case 'anual':
          novaData.setFullYear(novaData.getFullYear() + i);
          break;
      }

      // Só adicionar se for futuro
      if (novaData >= hoje) {
        eventos.push({
          ...evento,
          id: `${evento.id}-rec-${i}`,
          data: novaData.toISOString().split('T')[0]
        });
      }
    }

    return eventos;
  };

  // Adicionar novo evento manual
  const adicionarEventoManual = (dados: Partial<Evento>) => {
    const novoEvento: Evento = {
      id: Date.now().toString(),
      tipo: 'manual',
      data: dados.data || hoje.toISOString().split('T')[0],
      titulo: dados.titulo || '',
      descricao: dados.descricao || '',
      urgencia: dados.urgencia || 'media',
      manual: true,
      hora: dados.hora,
      recorrencia: dados.recorrencia || 'nao',
      categoria: dados.categoria
    };

    const novosEventos = [...eventosManuais, novoEvento];
    salvarEventosManuais(novosEventos);
    setModalAberto(false);
  };

  // Editar evento manual
  const editarEventoManual = (id: string, dados: Partial<Evento>) => {
    const novosEventos = eventosManuais.map(e =>
      e.id === id ? { ...e, ...dados } : e
    );
    salvarEventosManuais(novosEventos);
    setEventoEditando(null);
    setModalAberto(false);
  };

  // Deletar evento manual
  const deletarEventoManual = (id: string) => {
    if (confirm('Deseja excluir este evento?')) {
      const novosEventos = eventosManuais.filter(e => e.id !== id);
      salvarEventosManuais(novosEventos);
    }
  };
  
  // Obter parâmetros para uma espécie específica
  const getParametrosEspecie = (especie?: string) => {
    if (!especie) return config.parametrosPadrao;
    return config.parametrosEspecies[especie] || config.parametrosPadrao;
  };
  
  // Calcular eventos reais baseados nos dados
  const calcularEventos = (): Evento[] => {
    const eventos: Evento[] = [];
    
    // 1. Eventos de verificação de fertilidade (ovos em choca há X dias)
    ninhos.forEach(ninho => {
      ninho.eggs.forEach((egg, idx) => {
        if (egg.inicioChoca && (egg.status === 'Chocando' || egg.status === 'Em Espera')) {
          const params = getParametrosEspecie(egg.species);
          const inicioChoca = new Date(egg.inicioChoca);
          const dataFertilidade = new Date(inicioChoca);
          dataFertilidade.setDate(dataFertilidade.getDate() + params.diasFertilidade);
          
          eventos.push({
            id: `fert-${ninho.id}-${idx}`,
            tipo: 'fertilidade',
            data: dataFertilidade.toISOString().split('T')[0],
            titulo: 'Verificar Fertilidade',
            descricao: `${ninho.name || 'Ninho'} - Ovo ${idx + 1}`,
            ninhoId: ninho.id,
            urgencia: 'media'
          });
        }
      });
    });
    
    // 2. Eventos de previsão de eclosão
    ninhos.forEach(ninho => {
      ninho.eggs.forEach((egg, idx) => {
        if (egg.inicioChoca && (egg.status === 'Chocando' || egg.status === 'Fértil')) {
          const params = getParametrosEspecie(egg.species);
          const inicioChoca = new Date(egg.inicioChoca);
          const dataEclosao = new Date(inicioChoca);
          dataEclosao.setDate(dataEclosao.getDate() + params.duracaoChoca);
          
          eventos.push({
            id: `eclo-${ninho.id}-${idx}`,
            tipo: 'eclosao',
            data: dataEclosao.toISOString().split('T')[0],
            titulo: 'Previsão de Eclosão',
            descricao: `${ninho.name || 'Ninho'} - Ovo ${idx + 1}`,
            ninhoId: ninho.id,
            urgencia: 'alta'
          });
        }
      });
    });
    
    // 3. Eventos de saída do ninho (anilhamento)
    ninhos.forEach(ninho => {
      ninho.eggs.forEach((egg, idx) => {
        if (egg.dataEclosao && egg.status === 'Eclodido' && !egg.filhoteAnilhado) {
          const params = getParametrosEspecie(egg.species);
          const eclosao = new Date(egg.dataEclosao);
          const dataSaida = new Date(eclosao);
          dataSaida.setDate(dataSaida.getDate() + params.diasAnilhamento);
          
          eventos.push({
            id: `saida-${ninho.id}-${idx}`,
            tipo: 'saida',
            data: dataSaida.toISOString().split('T')[0],
            titulo: 'Saída do Ninho',
            descricao: `${ninho.name || 'Ninho'} - Filhote pronto para anilhar`,
            ninhoId: ninho.id,
            urgencia: 'alta'
          });
        }
      });
    });
    
    // 4. Alertas de postura (casais sem botar há X dias)
    casais.forEach(casal => {
      // Buscar a última postura deste casal em qualquer ninho
      let ultimaPostura: Date | null = null;
      
      ninhos.forEach(ninho => {
        if (ninho.casalId === casal.id) {
          ninho.eggs.forEach(egg => {
            if (egg.postura) {
              const dataPostura = new Date(egg.postura);
              if (!ultimaPostura || dataPostura > ultimaPostura) {
                ultimaPostura = dataPostura;
              }
            }
          });
        }
      });
      
      // Calcular dias desde a última postura
      const diasSemBotar = ultimaPostura 
        ? Math.floor((hoje.getTime() - ultimaPostura.getTime()) / (1000 * 60 * 60 * 24))
        : 999; // Se nunca botou, consideramos muitos dias
      
      // Se ultrapassou o prazo configurado, gerar alerta
      if (diasSemBotar >= config.prazoAlertaPostura) {
        const macho = aves.find(a => a.id === casal.mId);
        const femea = aves.find(a => a.id === casal.fId);
        const nomeCasal = `${macho?.ring || macho?.name || 'Macho'} + ${femea?.ring || femea?.name || 'Fêmea'}`;
        
        // Define urgência baseada em quantos dias passaram do prazo
        let urgencia: 'baixa' | 'media' | 'alta' = 'media';
        const diasAcimaLimite = diasSemBotar - config.prazoAlertaPostura;
        if (diasAcimaLimite > 15) urgencia = 'alta';
        else if (diasAcimaLimite < 5) urgencia = 'baixa';
        
        eventos.push({
          id: `alerta-${casal.id}`,
          tipo: 'alerta_postura',
          data: hoje.toISOString().split('T')[0],
          titulo: 'Alerta: Sem Postura',
          descricao: `${nomeCasal} - Gaiola ${casal.cage} - ${diasSemBotar} dias sem postura`,
          casalId: casal.id,
          urgencia: urgencia,
          diasPassados: diasSemBotar
        });
      }
    });
    
    // 5. Adicionar eventos manuais com recorrência
    eventosManuais.forEach(evento => {
      const eventosRec = gerarEventosRecorrentes(evento);
      eventos.push(...eventosRec);
    });

    return eventos;
  };

  const eventos = calcularEventos();

  const proximosEventos = eventos
    .filter(e => new Date(e.data) >= hoje)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 10);

  const calcularDiasRestantes = (data: string) => {
    const diff = new Date(data).getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getIcone = (tipo: string) => {
    switch(tipo) {
      case 'fertilidade': return 'fa-search';
      case 'eclosao': return 'fa-egg';
      case 'saida': return 'fa-door-open';
      case 'alerta_postura': return 'fa-exclamation-triangle';
      case 'manual': return 'fa-calendar-plus';
      default: return 'fa-calendar';
    }
  };

  const getCor = (urgencia: string) => {
    switch(urgencia) {
      case 'baixa': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'media': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'alta': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const handleEventoClick = (evento: Evento) => {
    // Se for evento manual, abrir para edição
    if (evento.manual) {
      // Encontrar o evento original (sem -rec-X no id)
      const eventoOriginal = eventosManuais.find(e =>
        e.id === evento.id || evento.id.startsWith(e.id + '-rec-')
      );
      if (eventoOriginal) {
        setEventoEditando(eventoOriginal);
        setModalAberto(true);
      }
      return;
    }

    // Navega para a aba correspondente ao tipo de evento automático
    if (evento.tipo === 'fertilidade' || evento.tipo === 'eclosao' || evento.tipo === 'saida') {
      onNavigate('ninhos');
    } else if (evento.tipo === 'alerta_postura') {
      onNavigate('casais');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
          Calendário de Eventos
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEventoEditando(null);
              setModalAberto(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span className="hidden sm:inline">Adicionar Evento</span>
          </button>
          <div className="text-xs text-slate-500 font-bold hidden md:block">
            {hoje.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-blue-50 p-3 rounded-2xl text-center">
          <div className="text-2xl font-black text-blue-600">
            {eventos.filter(e => e.tipo === 'fertilidade').length}
          </div>
          <div className="text-[9px] font-black text-blue-600 uppercase mt-1">Fertilidade</div>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl text-center">
          <div className="text-2xl font-black text-emerald-600">
            {eventos.filter(e => e.tipo === 'eclosao').length}
          </div>
          <div className="text-[9px] font-black text-emerald-600 uppercase mt-1">Eclosão</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-2xl text-center">
          <div className="text-2xl font-black text-purple-600">
            {eventos.filter(e => e.tipo === 'saida').length}
          </div>
          <div className="text-[9px] font-black text-purple-600 uppercase mt-1">Saída</div>
        </div>
        <div className="bg-amber-50 p-3 rounded-2xl text-center">
          <div className="text-2xl font-black text-amber-600">
            {eventos.filter(e => e.tipo === 'alerta_postura').length}
          </div>
          <div className="text-[9px] font-black text-amber-600 uppercase mt-1">Alertas</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl text-center border-2 border-slate-200">
          <div className="text-2xl font-black text-slate-700">
            {eventosManuais.length}
          </div>
          <div className="text-[9px] font-black text-slate-700 uppercase mt-1">Meus Eventos</div>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="space-y-2">
        <h3 className="text-sm font-black text-slate-700 uppercase">Próximos Eventos</h3>
        
        {proximosEventos.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border-2 border-slate-100">
            <i className="fas fa-calendar-check text-4xl text-slate-300 mb-3"></i>
            <p className="text-slate-500 text-sm font-bold">Nenhum evento próximo</p>
          </div>
        ) : (
          proximosEventos.map((evento) => {
            const diasRestantes = calcularDiasRestantes(evento.data);
            
            return (
              <div 
                key={evento.id} 
                className={`bg-white border-2 rounded-2xl p-4 ${getCor(evento.urgencia)} cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5`}
                onClick={() => handleEventoClick(evento)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    evento.urgencia === 'baixa' ? 'bg-blue-100' :
                    evento.urgencia === 'media' ? 'bg-amber-100' :
                    'bg-rose-100'
                  }`}>
                    <i className={`fas ${getIcone(evento.tipo)} text-lg`}></i>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-black text-sm">{evento.titulo}</h4>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-black shrink-0">
                          {diasRestantes === 0 ? 'HOJE' : 
                           diasRestantes === 1 ? 'AMANHÃ' :
                           `${diasRestantes} DIAS`}
                        </div>
                        <i className="fas fa-chevron-right text-xs opacity-50"></i>
                      </div>
                    </div>
                    <p className="text-xs mb-2">{evento.descricao}</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold opacity-70 flex-wrap">
                      <span>
                        <i className="far fa-calendar mr-1"></i>
                        {new Date(evento.data).toLocaleDateString('pt-BR')}
                      </span>
                      {evento.hora && (
                        <span>
                          <i className="far fa-clock mr-1"></i>
                          {evento.hora}
                        </span>
                      )}
                      {evento.recorrencia && evento.recorrencia !== 'nao' && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          <i className="fas fa-repeat mr-1"></i>
                          {evento.recorrencia === 'diaria' ? 'Diário' :
                           evento.recorrencia === 'semanal' ? 'Semanal' :
                           evento.recorrencia === 'mensal' ? 'Mensal' : 'Anual'}
                        </span>
                      )}
                      {evento.categoria && (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          <i className="fas fa-tag mr-1"></i>
                          {evento.categoria}
                        </span>
                      )}
                      {evento.manual && (
                        <span className="text-emerald-600">
                          <i className="fas fa-pencil mr-1"></i>
                          Clique para editar
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ações rápidas */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4">
        <h3 className="text-sm font-black text-indigo-800 uppercase mb-3 flex items-center gap-2">
          <i className="fas fa-bolt"></i>
          Ações Sugeridas
        </h3>
        <div className="space-y-2">
          {eventos.filter(e => e.tipo === 'alerta_postura').length > 0 && (
            <button 
              onClick={() => onNavigate('casais')}
              className="w-full bg-amber-500 text-white py-3 px-4 rounded-xl font-bold text-xs text-left flex items-center justify-between hover:bg-amber-600 transition-all"
            >
              <span>
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {eventos.filter(e => e.tipo === 'alerta_postura').length} casal(is) sem postura - Iniciar choca!
              </span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
          )}
          {eventos.filter(e => e.tipo === 'fertilidade').length > 0 && (
            <button 
              onClick={() => onNavigate('ninhos')}
              className="w-full bg-white text-indigo-700 py-3 px-4 rounded-xl font-bold text-xs text-left flex items-center justify-between hover:bg-indigo-100 transition-all"
            >
              <span>
                <i className="fas fa-search mr-2"></i>
                Verificar ovos prontos para mirar ({eventos.filter(e => e.tipo === 'fertilidade').length})
              </span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
          )}
          {eventos.filter(e => e.tipo === 'saida').length > 0 && (
            <button 
              onClick={() => onNavigate('ninhos')}
              className="w-full bg-white text-indigo-700 py-3 px-4 rounded-xl font-bold text-xs text-left flex items-center justify-between hover:bg-indigo-100 transition-all"
            >
              <span>
                <i className="fas fa-ring mr-2"></i>
                Anilhar filhotes prontos ({eventos.filter(e => e.tipo === 'saida').length})
              </span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
          )}
          {eventos.filter(e => e.tipo === 'eclosao').length > 0 && (
            <button 
              onClick={() => onNavigate('ninhos')}
              className="w-full bg-white text-indigo-700 py-3 px-4 rounded-xl font-bold text-xs text-left flex items-center justify-between hover:bg-indigo-100 transition-all"
            >
              <span>
                <i className="fas fa-egg mr-2"></i>
                Ovos próximos a eclodir ({eventos.filter(e => e.tipo === 'eclosao').length})
              </span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
          )}
          {eventos.length === 0 && (
            <div className="text-center text-indigo-600 text-xs py-2">
              <i className="fas fa-check-circle mr-2"></i>
              Tudo sob controle!
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criar/Editar Evento */}
      {modalAberto && <ModalEventoManual />}
    </section>
  );

  function ModalEventoManual() {
    const [titulo, setTitulo] = useState(eventoEditando?.titulo || '');
    const [descricao, setDescricao] = useState(eventoEditando?.descricao || '');
    const [data, setData] = useState(eventoEditando?.data || hoje.toISOString().split('T')[0]);
    const [hora, setHora] = useState(eventoEditando?.hora || '');
    const [urgencia, setUrgencia] = useState<'baixa' | 'media' | 'alta'>(eventoEditando?.urgencia || 'media');
    const [recorrencia, setRecorrencia] = useState<'nao' | 'diaria' | 'semanal' | 'mensal' | 'anual'>(eventoEditando?.recorrencia || 'nao');
    const [categoria, setCategoria] = useState(eventoEditando?.categoria || '');

    const handleSalvar = () => {
      if (!titulo.trim()) {
        alert('Por favor, preencha o título do evento');
        return;
      }

      const dados = {
        titulo,
        descricao,
        data,
        hora,
        urgencia,
        recorrencia,
        categoria
      };

      if (eventoEditando) {
        editarEventoManual(eventoEditando.id, dados);
      } else {
        adicionarEventoManual(dados);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl uppercase tracking-tight flex items-center gap-2">
                <i className="fas fa-calendar-plus"></i>
                {eventoEditando ? 'Editar Evento' : 'Novo Evento'}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 w-10 h-10 rounded-xl transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Título */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                Título *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold"
                placeholder="Ex: Consulta veterinária"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold resize-none"
                rows={3}
                placeholder="Detalhes do evento..."
              />
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                  Hora (Opcional)
                </label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Urgência */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                Urgência
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setUrgencia('baixa')}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                    urgencia === 'baixa'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <i className="fas fa-circle mr-2"></i>
                  Baixa
                </button>
                <button
                  onClick={() => setUrgencia('media')}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                    urgencia === 'media'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  }`}
                >
                  <i className="fas fa-circle mr-2"></i>
                  Média
                </button>
                <button
                  onClick={() => setUrgencia('alta')}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                    urgencia === 'alta'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  <i className="fas fa-circle mr-2"></i>
                  Alta
                </button>
              </div>
            </div>

            {/* Recorrência */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                <i className="fas fa-repeat mr-2"></i>
                Recorrência
              </label>
              <select
                value={recorrencia}
                onChange={(e) => setRecorrencia(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold"
              >
                <option value="nao">Não repetir</option>
                <option value="diaria">Diariamente</option>
                <option value="semanal">Semanalmente</option>
                <option value="mensal">Mensalmente</option>
                <option value="anual">Anualmente</option>
              </select>
              {recorrencia !== 'nao' && (
                <p className="text-xs text-slate-500 mt-2 font-bold">
                  <i className="fas fa-info-circle mr-1"></i>
                  Este evento se repetirá automaticamente
                </p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                Categoria (Opcional)
              </label>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold"
                placeholder="Ex: Saúde, Alimentação, Limpeza..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 rounded-b-2xl flex gap-3 justify-end">
            {eventoEditando && (
              <button
                onClick={() => {
                  deletarEventoManual(eventoEditando.id);
                  setModalAberto(false);
                }}
                className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all"
              >
                <i className="fas fa-trash mr-2"></i>
                Excluir
              </button>
            )}
            <button
              onClick={() => setModalAberto(false)}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
            >
              <i className="fas fa-check mr-2"></i>
              {eventoEditando ? 'Salvar' : 'Criar Evento'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}