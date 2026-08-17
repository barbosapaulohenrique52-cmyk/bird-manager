import { useState, useEffect, useRef } from 'react';
import type { Ninho, Casal, Egg, ModalType, Config, Ave } from '../App';
import { CasalSelector } from './CasalSelector';
import { AveSelector } from './AveSelector';

// Formata datas para a visualização compacta: DD/MM/AA.
// Mantém sempre dois dígitos para dia e mês.
const formatarDataCurta = (value?: string | null): string => {
  if (!value) return '--';

  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const [, ano, mes, dia] = match;
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano.slice(-2)}`;
  }

  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return value;

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = String(data.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
};

interface DataCompactaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}

// Exibe DD/MM/AA, mas mantém o seletor nativo de calendário para edição.
function DataCompacta({
  value,
  onChange,
  className = '',
  ariaLabel = 'Selecionar data'
}: DataCompactaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between gap-1 w-full h-full">
        <span className="truncate">
          {formatarDataCurta(value)}
        </span>
        <i className="fas fa-calendar text-slate-400 text-[8px] shrink-0"></i>
      </div>

      <input
        ref={inputRef}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}


interface StatusSelectorProps {
  status: Egg['status'];
  onChange: (status: Egg['status']) => void;
  onChocar: () => void;
}

function StatusIcon({ status }: { status: Egg['status'] }) {
  if (status === 'Em Espera') {
    return <span className="text-[14px] leading-none" title="Em Espera">⏳</span>;
  }

  if (status === 'Eclodido') {
    return <span className="text-[16px] leading-none" title="Eclodido">🐣</span>;
  }

  if (status === 'Perdido') {
    return <span className="text-[14px] leading-none" title="Perdido">⚠️</span>;
  }

  return (
    <svg
      width="22"
      height="25"
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={status}
      role="img"
    >
      {/* Ovo */}
      <path
        d="M14 2.5C9.1 2.5 4.5 11.5 4.5 19.3C4.5 25.5 8.5 29.5 14 29.5C19.5 29.5 23.5 25.5 23.5 19.3C23.5 11.5 18.9 2.5 14 2.5Z"
        fill={status === 'Fértil' ? '#FFF7ED' : 'white'}
        stroke={status === 'Chocando' ? '#C2410C' : status === 'Fértil' ? '#F59E0B' : '#64748B'}
        strokeWidth="1.7"
      />

      {/* Gema do ovo fértil */}
      {status === 'Fértil' && (
        <circle
          cx="14"
          cy="19"
          r="5"
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth="1"
        />
      )}

      {/* Ave sobre o ovo quando está chocando */}
      {status === 'Chocando' && (
        <>
          <circle cx="14" cy="5.5" r="3.2" fill="#FBBF24" />
          <ellipse cx="14" cy="9.2" rx="5.2" ry="3.1" fill="#FBBF24" />
          <circle cx="15.1" cy="5" r="0.65" fill="#1E293B" />
          <path d="M17.2 6L20 7.2L17.2 8Z" fill="#F97316" />
          <path d="M10.5 8.2L7.5 6.7L8.4 9.6Z" fill="#F59E0B" />
        </>
      )}
    </svg>
  );
}

function StatusSelector({ status, onChange, onChocar }: StatusSelectorProps) {
  const [open, setOpen] = useState(false);

  const opcoes: Array<{ value: Egg['status']; label: string }> = [
    { value: 'Em Espera', label: 'Em Espera' },
    { value: 'Chocando', label: 'Chocando' },
    { value: 'Fértil', label: 'Fértil' },
    { value: 'Infértil', label: 'Infértil' },
    { value: 'Eclodido', label: 'Eclodido' },
    { value: 'Perdido', label: 'Perdido' },
  ];

  const selecionar = (novoStatus: Egg['status']) => {
    setOpen(false);

    if (novoStatus === 'Chocando') {
      onChocar();
      return;
    }

    onChange(novoStatus);
  };

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((valor) => !valor)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-9 h-9 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        title={status}
        aria-label={`Status: ${status}`}
      >
        <StatusIcon status={status} />
      </button>

      {open && (
        <div className="absolute z-40 top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-1 min-w-[125px]">
          {opcoes.map((opcao) => (
            <button
              key={opcao.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selecionar(opcao.value)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-[9px] font-bold hover:bg-slate-50 ${
                status === opcao.value ? 'bg-slate-100' : ''
              }`}
              title={opcao.label}
            >
              <span className="w-6 flex justify-center">
                <StatusIcon status={opcao.value} />
              </span>
              <span>{opcao.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface NinhosSectionProps {
  ninhos: Ninho[];
  casais: Casal[];
  config: Config;
  aves: Ave[];
  onOpenModal: (type: ModalType, id?: string | null) => void;
  onAddEgg: (ninhoId: string) => void;
  onRemoveEgg: (ninhoId: string, eggIdx: number) => void;
  onUpdateEgg: (ninhoId: string, eggIdx: number, field: keyof Egg, value: any) => void;
  onEclodirOvo: (ninhoId: string, eggIdx: number, dataEclosao: string) => void;
  onAnilharFilhote: (ninhoId: string, eggIdx: number, anilha: string, anoAnilha: number) => void;
  onReverterEclosao: (ninhoId: string, eggIdx: number) => void;
  onUpdateNinhoCasal: (ninhoId: string, casalId: string) => void;
  onSaveCasal: (data: Omit<Casal, 'id'>) => string;
  onDeleteNinho: (ninhoId: string) => void;
  onUpdateNinho?: (ninhoId: string, field: keyof Ninho, value: any) => void;
  onSaveConfig: (config: Config) => void;
  onViewDetails?: (aveId: string) => void;
}

export function NinhosSection({
  ninhos,
  casais,
  config,
  aves,
  onOpenModal,
  onAddEgg,
  onRemoveEgg,
  onUpdateEgg,
  onEclodirOvo,
  onAnilharFilhote,
  onReverterEclosao,
  onUpdateNinhoCasal,
  onSaveCasal,
  onDeleteNinho,
  onUpdateNinho,
  onSaveConfig,
  onViewDetails
}: NinhosSectionProps) {
  const [eclosaoModal, setEclosaoModal] = useState<{ ninhoId: string; eggIdx: number } | null>(null);
  const [chocaModal, setChocaModal] = useState<{ ninhoId: string; eggIdx: number } | null>(null);
  const [anilhamentoModal, setAnilhamentoModal] = useState<{ ninhoId: string; eggIdx: number } | null>(null);
  const [editCasalNinhoId, setEditCasalNinhoId] = useState<string | null>(null);
  const [dataEclosao, setDataEclosao] = useState(new Date().toISOString().split('T')[0]);
  const [chocaData, setChocaData] = useState({
    tipo: 'pais' as 'pais' | 'amas',
    dataInicio: new Date().toISOString().split('T')[0],
    casalAmasId: '',
    localChoca: ''
  });
  const [anilhaData, setAnilhaData] = useState({
    numero: '',
    ano: new Date().getFullYear()
  });
  
  // Estados para criar casal de amas no modal de choca
  const [criandoCasalAmas, setCriandoCasalAmas] = useState(false);
  const [novoCasalAmasMacho, setNovoCasalAmasMacho] = useState('');
  const [novoCasalAmasFemea, setNovoCasalAmasFemea] = useState('');
  const [novoCasalAmasGaiola, setNovoCasalAmasGaiola] = useState('');
  
  // Estados para criar casal no dropdown de seleção
  const [criandoCasalDropdown, setCriandoCasalDropdown] = useState<string | null>(null);
  const [novoCasalDropdownMacho, setNovoCasalDropdownMacho] = useState('');
  const [novoCasalDropdownFemea, setNovoCasalDropdownFemea] = useState('');
  const [novoCasalDropdownGaiola, setNovoCasalDropdownGaiola] = useState('');
  
  // Estados para edição inline do nome do ninho
  const [editandoNomeNinho, setEditandoNomeNinho] = useState<string | null>(null);
  const [nomeNinhoTemp, setNomeNinhoTemp] = useState('');
  
  // Estados para criar nova espécie
  const [criarEspecieModal, setCriarEspecieModal] = useState<{ ninhoId: string; eggIdx: number } | null>(null);
  const [novaEspecieData, setNovaEspecieData] = useState({
    nome: '',
    diasFertilidade: 7,
    duracaoChoca: 14,
    diasAnilhamento: 7,
    diasSaidaNinho: 21
  });
  
  // Estados para dropdown de seleção de espécie
  const [especieDropdownAberto, setEspecieDropdownAberto] = useState<{ ninhoId: string; eggIdx: number } | null>(null);
  const [especieBusca, setEspecieBusca] = useState('');

  // Estado para controlar quais ninhos estão expandidos
  const [ninhosExpandidos, setNinhosExpandidos] = useState<Set<string>>(new Set());

  const toggleNinhoExpandido = (ninhoId: string) => {
    const novoSet = new Set(ninhosExpandidos);
    if (novoSet.has(ninhoId)) {
      novoSet.delete(ninhoId);
    } else {
      novoSet.add(ninhoId);
    }
    setNinhosExpandidos(novoSet);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Se clicar fora do dropdown, fechar
      if (especieDropdownAberto && !target.closest('.especie-dropdown-container')) {
        setEspecieDropdownAberto(null);
        setEspecieBusca('');
      }
    };
    
    if (especieDropdownAberto) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [especieDropdownAberto]);

  // Filtra aves que ainda não estão em casais ativos
  const getAvesDisponiveis = (sexo: 'Macho' | 'Fêmea') => {
    const avesEmCasais = new Set([
      ...casais.map(c => c.mId),
      ...casais.map(c => c.fId)
    ]);
    
    return aves.filter(a => 
      a.sex === sexo && 
      a.status === 'Ativo' && 
      !avesEmCasais.has(a.id)
    );
  };
  
  // Estados para edição em lote
  // Seleção de ovos para edição em lote
  // A chave usa o ID do ninho + ID do ovo (ou índice como fallback),
  // garantindo que a seleção continue correta mesmo com os ovos agrupados por local.
  const [ovosSelecionados, setOvosSelecionados] = useState<Set<string>>(new Set());

  const getChaveOvo = (ninhoId: string, egg: Egg, eggIdx: number) =>
    `${ninhoId}::${egg.id || `idx-${eggIdx}`}`;

  const todosOvos = ninhos.flatMap((ninho) =>
    ninho.eggs.map((egg, eggIdx) => ({
      ninho,
      egg,
      eggIdx,
      chave: getChaveOvo(ninho.id, egg, eggIdx),
    }))
  );

  const toggleOvoSelecionado = (chave: string) => {
    setOvosSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) {
        novo.delete(chave);
      } else {
        novo.add(chave);
      }
      return novo;
    });
  };

  const toggleTodosOvos = () => {
    setOvosSelecionados((atual) => {
      if (atual.size === todosOvos.length) {
        return new Set();
      }

      return new Set(todosOvos.map((item) => item.chave));
    });
  };

  const toggleTodosOvosDoNinho = (ninhoId: string) => {
    const ovosDoNinho = todosOvos.filter((item) => item.ninho.id === ninhoId);
    setOvosSelecionados((atual) => {
      const novo = new Set(atual);
      const todosSelecionados = ovosDoNinho.every((item) => novo.has(item.chave));

      ovosDoNinho.forEach((item) => {
        if (todosSelecionados) {
          novo.delete(item.chave);
        } else {
          novo.add(item.chave);
        }
      });

      return novo;
    });
  };

  const limparSelecaoOvos = () => {
    setOvosSelecionados(new Set());
  };

  // Mantém a seleção sincronizada quando um ovo é excluído ou os dados mudam.
  useEffect(() => {
    const chavesValidas = new Set(
      ninhos.flatMap((ninho) =>
        ninho.eggs.map((egg, eggIdx) => getChaveOvo(ninho.id, egg, eggIdx))
      )
    );

    setOvosSelecionados((atual) => {
      const filtrado = new Set(
        Array.from(atual).filter((chave) => chavesValidas.has(chave))
      );

      if (filtrado.size === atual.size) {
        return atual;
      }

      return filtrado;
    });
  }, [ninhos]);

  
  // Obter todas as espécies disponíveis (usa lista do config)
  const getEspeciesDisponiveis = () => {
    return config.especies || [];
  };
  
  // Obter parâmetros para uma espécie específica
  const getParametrosEspecie = (especie?: string) => {
    if (!especie) return config.parametrosPadrao;
    return config.parametrosEspecies[especie] || config.parametrosPadrao;
  };
  
  const calcularDataFertilidade = (egg: Egg): string | null => {
    if (!egg.inicioChoca) return null;
    const params = getParametrosEspecie(egg.species);
    const inicio = new Date(egg.inicioChoca);
    inicio.setDate(inicio.getDate() + params.diasFertilidade);
    return inicio.toISOString().split('T')[0];
  };

  const calcularDataEclosao = (egg: Egg): string | null => {
    if (!egg.inicioChoca) return null;
    const params = getParametrosEspecie(egg.species);
    const inicio = new Date(egg.inicioChoca);
    inicio.setDate(inicio.getDate() + params.duracaoChoca);
    return inicio.toISOString().split('T')[0];
  };

  const calcularDataAnilhamento = (egg: Egg): string | null => {
    if (!egg.dataEclosao) return null;
    const params = getParametrosEspecie(egg.species);
    const eclosao = new Date(egg.dataEclosao);
    eclosao.setDate(eclosao.getDate() + params.diasAnilhamento);
    return eclosao.toISOString().split('T')[0];
  };

  const handleIniciarChoca = (ninhoId: string, eggIdx: number) => {
    const hoje = new Date().toISOString().split('T')[0];
    onUpdateEgg(ninhoId, eggIdx, 'inicioChoca', hoje);
    onUpdateEgg(ninhoId, eggIdx, 'status', 'Chocando');
  };

  const handleConfirmarChoca = () => {
    if (chocaModal) {
      // Buscar o ninho para validação
      const ninho = ninhos.find(n => n.id === chocaModal.ninhoId);
      
      let casalIdParaUsar = chocaData.casalAmasId;
      
      // Validar se o casal de amas não é o mesmo casal que botou os ovos
      if (chocaData.tipo === 'amas' && ninho && casalIdParaUsar === ninho.casalId) {
        alert('⚠️ O casal de amas não pode ser o mesmo casal que botou os ovos!');
        return;
      }
      
      // Se está criando novo casal de amas
      if (chocaData.tipo === 'amas' && criandoCasalAmas) {
        const machoAve = aves.find(a => a.id === novoCasalAmasMacho);
        const femeaAve = aves.find(a => a.id === novoCasalAmasFemea);
        
        if (!machoAve || !femeaAve || !novoCasalAmasGaiola.trim()) {
          alert('Por favor, preencha todos os dados do casal de amas');
          return;
        }
        
        casalIdParaUsar = onSaveCasal({
          mId: machoAve.id,
          fId: femeaAve.id,
          cage: novoCasalAmasGaiola,
        });
        
        // Reseta estados de criação de casal
        setCriandoCasalAmas(false);
        setNovoCasalAmasMacho('');
        setNovoCasalAmasFemea('');
        setNovoCasalAmasGaiola('');
      }
      
      onUpdateEgg(chocaModal.ninhoId, chocaModal.eggIdx, 'inicioChoca', chocaData.dataInicio);
      onUpdateEgg(chocaModal.ninhoId, chocaModal.eggIdx, 'status', 'Chocando');
      
      if (chocaData.tipo === 'amas') {
        onUpdateEgg(chocaModal.ninhoId, chocaModal.eggIdx, 'casalChocandoId', casalIdParaUsar);
        onUpdateEgg(chocaModal.ninhoId, chocaModal.eggIdx, 'localChoca', chocaData.localChoca);
      } else {
        // Se for pelos pais, usa o casal original do ninho
        const ninho = ninhos.find(n => n.id === chocaModal.ninhoId);
        if (ninho) {
          onUpdateEgg(chocaModal.ninhoId, chocaModal.eggIdx, 'casalChocandoId', ninho.casalId);
        }
      }
      
      setChocaModal(null);
      setChocaData({
        tipo: 'pais',
        dataInicio: new Date().toISOString().split('T')[0],
        casalAmasId: '',
        localChoca: ''
      });
    }
  };

  const handleEclodir = () => {
    if (eclosaoModal) {
      onEclodirOvo(eclosaoModal.ninhoId, eclosaoModal.eggIdx, dataEclosao);
      setEclosaoModal(null);
      setDataEclosao(new Date().toISOString().split('T')[0]);
    }
  };

  const handleAnilhar = () => {
    if (anilhamentoModal && anilhaData.numero) {
      onAnilharFilhote(anilhamentoModal.ninhoId, anilhamentoModal.eggIdx, anilhaData.numero, anilhaData.ano);
      setAnilhamentoModal(null);
      setAnilhaData({ numero: '', ano: new Date().getFullYear() });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Em Espera': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Chocando': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Fértil': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Infértil': return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'Eclodido': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Perdido': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Agrupar todos os ovos pelo local onde estão atualmente.
  // Mantemos ninhoId + eggIdx para que todas as ações continuem
  // operando sobre o ovo original, sem duplicar ou mover dados.
  const ovosPorLocal = new Map<string, Array<{ egg: Egg; ninho: Ninho; eggIdx: number }>>();

  ninhos.forEach((ninho) => {
    ninho.eggs.forEach((egg, eggIdx) => {
      const local = egg.local?.trim() || 'Sem local definido';

      if (!ovosPorLocal.has(local)) {
        ovosPorLocal.set(local, []);
      }

      ovosPorLocal.get(local)!.push({
        egg,
        ninho,
        eggIdx
      });
    });
  });

  const locaisOrdenados = Array.from(ovosPorLocal.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], 'pt-BR')
  );

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
          Ninhos Ativos
        </h2>
        <button
          onClick={() => onOpenModal('ninho')}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] shadow-lg"
        >
          <i className="fas fa-plus mr-1"></i>
          NOVO NINHO
        </button>
      </div>

      {/* Ninhos continuam sendo usados para definir a origem dos ovos.
          A visualização dos ovos abaixo é agrupada pelo local atual. */}
      <div className="space-y-4">
        {ninhos.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border-2 border-slate-100">
            <i className="fas fa-dove text-5xl text-slate-200 mb-4"></i>
            <p className="text-slate-500 font-bold">Nenhum ninho ativo</p>
            <p className="text-xs text-slate-400 mt-1">Crie um ninho para começar</p>
          </div>
        ) : (
          ninhos.map((ninho) => (
            <div
              key={ninho.id}
              className="bg-white rounded-[24px] border-2 border-slate-200 overflow-hidden shadow-sm"
            >
              {/* Header do Ninho */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-white flex-1">
                    {editandoNomeNinho === ninho.id ? (
                      <input
                        type="text"
                        value={nomeNinhoTemp}
                        onChange={(e) => setNomeNinhoTemp(e.target.value)}
                        onBlur={() => {
                          if (onUpdateNinho) {
                            onUpdateNinho(ninho.id, 'name', nomeNinhoTemp);
                          }
                          setEditandoNomeNinho(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (onUpdateNinho) {
                              onUpdateNinho(ninho.id, 'name', nomeNinhoTemp);
                            }
                            setEditandoNomeNinho(null);
                          }
                        }}
                        autoFocus
                        className="bg-white text-emerald-600 px-2 py-1 rounded text-sm font-black uppercase outline-none"
                        placeholder="Nome do ninho..."
                      />
                    ) : (
                      <h3
                        className="text-sm font-black uppercase cursor-pointer hover:underline"
                        onClick={() => {
                          setEditandoNomeNinho(ninho.id);
                          setNomeNinhoTemp(ninho.name || '');
                        }}
                      >
                        {ninho.name || 'Ninho s/ nome'}
                        <i className="fas fa-pencil-alt ml-2 text-xs opacity-70"></i>
                      </h3>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {ninho.eggs.length > 0 && (
                      <button
                        onClick={() => toggleTodosOvosDoNinho(ninho.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl font-black text-[10px] uppercase shadow-md transition-all"
                        title="Selecionar/desselecionar todos os ovos deste ninho para edição em lote"
                      >
                        <i className="fas fa-check-square mr-1"></i>
                        {ninho.eggs.every((egg, eggIdx) =>
                          ovosSelecionados.has(getChaveOvo(ninho.id, egg, eggIdx))
                        )
                          ? 'DESMARCAR'
                          : 'SELECIONAR'}
                      </button>
                    )}

                    <button
                      onClick={() => onAddEgg(ninho.id)}
                      className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-emerald-50 transition-all"
                    >
                      <i className="fas fa-plus mr-1"></i>
                      Ovo
                    </button>

                    <button
                      onClick={() => onDeleteNinho(ninho.id)}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-xl font-black text-[10px] uppercase shadow-md transition-all"
                      title="Excluir ninho"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                {/* Seletor de Casal */}
                <div className="flex items-center gap-2">
                  <i className="fas fa-door-open text-white text-xs"></i>
                  <div className="flex-1">
                    <CasalSelector
                      casais={casais}
                      aves={aves}
                      value={ninho.casalId || ''}
                      onChange={(casalId) => onUpdateNinhoCasal(ninho.id, casalId)}
                      placeholder="⚠️ Clique para adicionar casal ao ninho"
                      allowEmpty={true}
                      onCreateNew={() => setCriandoCasalDropdown(ninho.id)}
                    />
                  </div>
                </div>
              </div>

              {/* Resumo / expansão dos ovos do casal */}
              <div className="p-2">
                {ninho.eggs.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <i className="fas fa-egg text-2xl mb-2"></i>
                    <p className="text-sm">Nenhum ovo registrado</p>
                  </div>
                ) : !ninhosExpandidos.has(ninho.id) ? (
                  <div
                    onClick={() => toggleNinhoExpandido(ninho.id)}
                    className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          <i className="fas fa-egg text-emerald-600 text-lg"></i>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 uppercase text-xs">
                            Ovos deste casal
                          </h4>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                            {ninho.eggs.length} {ninho.eggs.length === 1 ? 'ovo registrado' : 'ovos registrados'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNinhoExpandido(ninho.id);
                        }}
                        className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-black text-[9px] uppercase flex items-center gap-1.5 shadow-sm"
                      >
                        <i className="fas fa-chevron-down"></i>
                        Expandir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-emerald-200 rounded-2xl overflow-hidden">
                    <div className="bg-emerald-50 px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-egg text-emerald-600 text-xs"></i>
                        <span className="text-[10px] font-black text-emerald-700 uppercase">
                          Ovos deste casal ({ninho.eggs.length})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleNinhoExpandido(ninho.id)}
                        className="text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded-lg hover:bg-white transition-colors"
                        title="Recolher ovos"
                      >
                        <i className="fas fa-chevron-up text-[10px]"></i>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-2 px-2 text-left text-[8px] font-black text-slate-500 uppercase">Postura</th>
                            <th className="py-2 px-2 text-left text-[8px] font-black text-slate-500 uppercase">Espécie</th>
                            <th className="py-2 px-2 text-left text-[8px] font-black text-slate-500 uppercase">Local</th>
                            <th className="py-2 px-2 text-center text-[8px] font-black text-slate-500 uppercase">Status</th>
                            <th className="py-2 px-2 text-center text-[8px] font-black text-slate-500 uppercase">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ninho.eggs.map((egg, eggIdx) => (
                            <tr
                              key={`${ninho.id}-resumo-${egg.id || eggIdx}`}
                              className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                            >
                              <td className="py-2 px-2">
                                <DataCompacta
                                  value={egg.postura || ''}
                                  onChange={(value) =>
                                    onUpdateEgg(ninho.id, eggIdx, 'postura', value)
                                  }
                                  className="text-[9px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-1 w-[88px] h-7"
                                  ariaLabel="Data da postura"
                                />
                              </td>

                              <td className="py-2 px-2">
                                <span className="text-[9px] font-bold text-slate-700">
                                  {egg.species || '--'}
                                </span>
                              </td>

                              <td className="py-2 px-2">
                                <select
                                  value={egg.local || ''}
                                  onChange={(e) =>
                                    onUpdateEgg(ninho.id, eggIdx, 'local', e.target.value)
                                  }
                                  className="text-[9px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-1 max-w-[120px]"
                                >
                                  <option value="">Sem local</option>
                                  {(config.locaisOvos || []).map((localCadastrado) => (
                                    <option key={localCadastrado} value={localCadastrado}>
                                      {localCadastrado}
                                    </option>
                                  ))}
                                  {egg.local && !(config.locaisOvos || []).includes(egg.local) && (
                                    <option value={egg.local}>{egg.local}</option>
                                  )}
                                </select>
                              </td>

                              <td className="py-2 px-2 text-center">
                                <StatusSelector
                                  status={egg.status}
                                  onChange={(novoStatus) =>
                                    onUpdateEgg(ninho.id, eggIdx, 'status', novoStatus)
                                  }
                                  onChocar={() => {
                                    setChocaModal({
                                      ninhoId: ninho.id,
                                      eggIdx
                                    });
                                    setChocaData({
                                      tipo: 'pais',
                                      dataInicio: new Date().toISOString().split('T')[0],
                                      casalAmasId: '',
                                      localChoca: ''
                                    });
                                  }}
                                />
                              </td>

                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => onRemoveEgg(ninho.id, eggIdx)}
                                  className="w-7 h-7 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Excluir ovo"
                                >
                                  <i className="fas fa-trash text-[9px]"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ============================================================
          OVOS AGRUPADOS PELO LOCAL ATUAL
          ============================================================ */}
      {ninhos.some(n => n.eggs.length > 0) && (
        <div className="pt-2">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
                Ovos por Local
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase">
                {ninhos.reduce((total, ninho) => total + ninho.eggs.length, 0)} ovos
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-white border-2 border-slate-200 rounded-2xl p-2">
              <label className="flex items-center gap-2 px-2 py-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={todosOvos.length > 0 && ovosSelecionados.size === todosOvos.length}
                  onChange={toggleTodosOvos}
                  className="w-4 h-4 rounded border-2 border-amber-300 text-amber-500 focus:ring-2 focus:ring-amber-400 cursor-pointer"
                />
                <span className="text-[9px] font-black text-slate-600 uppercase">
                  Selecionar todos
                </span>
              </label>

              <span className="text-[9px] font-black text-amber-600 uppercase px-2">
                {ovosSelecionados.size} {ovosSelecionados.size === 1 ? 'ovo selecionado' : 'ovos selecionados'}
              </span>

              {ovosSelecionados.size > 0 && (
                <button
                  type="button"
                  onClick={limparSelecaoOvos}
                  className="ml-auto text-[9px] font-black text-slate-500 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors uppercase"
                >
                  <i className="fas fa-times mr-1"></i>
                  Limpar seleção
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {locaisOrdenados.map(([local, ovos]) => (
              <div
                key={local}
                className="bg-white rounded-[24px] border-2 border-slate-200 overflow-hidden shadow-sm"
              >
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <h3 className="text-sm font-black uppercase flex items-center gap-2">
                        <i className="fas fa-map-marker-alt"></i>
                        {local}
                      </h3>
                      <p className="text-[10px] font-bold text-emerald-100 mt-1 uppercase">
                        {ovos.length} {ovos.length === 1 ? 'ovo' : 'ovos'}
                      </p>
                    </div>
                    <i className="fas fa-egg text-white text-xl opacity-80"></i>
                  </div>
                </div>

                <div className="p-2">
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="py-2 px-1 text-center text-[9px] font-black text-slate-600 uppercase">
                            <i className="fas fa-check-square"></i>
                          </th>
                          <th className="py-2 px-1 text-left text-[9px] font-black text-slate-600 uppercase">Postura</th>
                          <th className="py-2 px-1 text-left text-[9px] font-black text-slate-600 uppercase">Espécie</th>
                          <th className="py-2 px-1 text-left text-[9px] font-black text-slate-600 uppercase">Origem / Casal</th>
                          <th className="py-2 px-1 text-left text-[9px] font-black text-slate-600 uppercase">Local</th>
                          <th className="py-2 px-1 text-left text-[9px] font-black text-slate-600 uppercase">Status</th>
                          <th className="py-2 px-1 text-left text-[9px] font-black text-slate-600 uppercase">Início</th>
                          <th className="py-2 px-1 text-left text-[9px] font-black text-slate-600 uppercase">Fertil.</th>
                          <th className="py-2 px-1 text-left text-[9px] font-black text-slate-600 uppercase">Eclosão</th>
                          <th className="py-2 px-1 text-left text-[9px] font-black text-slate-600 uppercase">Anilhar</th>
                          <th className="py-2 px-1 text-left text-[9px] font-black text-slate-600 uppercase">Anilha</th>
                          <th className="py-2 px-1 text-center text-[9px] font-black text-slate-600 uppercase">Ações</th>
                        </tr>
                      </thead>

                      <tbody>
                        {ovos.map(({ egg, ninho, eggIdx }) => {
                          const dataFertilidade = calcularDataFertilidade(egg);
                          const dataEclosao = calcularDataEclosao(egg);
                          const dataAnilhamento = calcularDataAnilhamento(egg);

                          const casal = casais.find(c => c.id === ninho.casalId);

                          let especieEsperada = 'Não especificado';
                          if (casal) {
                            const pai = aves.find(a => a.id === casal.mId);
                            const mae = aves.find(a => a.id === casal.fId);
                            if (pai?.species) especieEsperada = pai.species;
                            else if (mae?.species) especieEsperada = mae.species;
                          }

                          const especieEditada = egg.species && egg.species !== especieEsperada;

                          return (
                            <tr
                              key={`${ninho.id}-${egg.id || eggIdx}`}
                              className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                                ovosSelecionados.has(getChaveOvo(ninho.id, egg, eggIdx))
                                  ? 'bg-amber-50/60'
                                  : ''
                              }`}
                            >
                              {/* Seleção para edição em lote */}
                              <td className="py-1.5 px-1 text-center">
                                <input
                                  type="checkbox"
                                  checked={ovosSelecionados.has(getChaveOvo(ninho.id, egg, eggIdx))}
                                  onChange={() =>
                                    toggleOvoSelecionado(getChaveOvo(ninho.id, egg, eggIdx))
                                  }
                                  className="w-4 h-4 rounded border-2 border-amber-300 text-amber-500 focus:ring-2 focus:ring-amber-400 cursor-pointer"
                                  title="Selecionar este ovo para edição em lote"
                                />
                              </td>

                              {/* Data Postura */}
                              <td className="py-1.5 px-1">
                                <DataCompacta
                                  value={egg.postura || ''}
                                  onChange={(value) => onUpdateEgg(ninho.id, eggIdx, 'postura', value)}
                                  className="text-[9px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-1 w-24 h-7"
                                  ariaLabel="Data da postura"
                                />
                              </td>

                              {/* Espécie */}
                              <td className="py-1.5 px-1">
                                <div className="flex flex-col gap-1">
                                  <div className="relative especie-dropdown-container">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEspecieDropdownAberto({ ninhoId: ninho.id, eggIdx });
                                        setEspecieBusca(egg.species || '');
                                      }}
                                      className="w-full text-left text-[9px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 hover:border-indigo-400 transition-colors flex items-center justify-between gap-1"
                                    >
                                      <span className="truncate">
                                        {egg.species || <span className="text-slate-400 text-[8px]">Selecione...</span>}
                                      </span>
                                      <i className="fas fa-chevron-down text-[7px] text-slate-400"></i>
                                    </button>

                                    {especieDropdownAberto?.ninhoId === ninho.id && especieDropdownAberto?.eggIdx === eggIdx && (
                                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-indigo-500 rounded-xl shadow-xl z-50 max-h-64 overflow-hidden flex flex-col">
                                        <div className="p-2 border-b border-slate-200 bg-slate-50">
                                          <div className="flex items-center gap-1">
                                            <input
                                              type="text"
                                              value={especieBusca}
                                              onChange={(e) => setEspecieBusca(e.target.value)}
                                              placeholder="Digite ou busque..."
                                              className="flex-1 text-[10px] font-bold text-slate-700 bg-white border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500"
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && especieBusca.trim()) {
                                                  onUpdateEgg(ninho.id, eggIdx, 'species', especieBusca);
                                                  setEspecieDropdownAberto(null);
                                                  setEspecieBusca('');
                                                } else if (e.key === 'Escape') {
                                                  setEspecieDropdownAberto(null);
                                                  setEspecieBusca('');
                                                }
                                              }}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setCriarEspecieModal({ ninhoId: ninho.id, eggIdx });
                                                setNovaEspecieData({
                                                  nome: especieBusca || '',
                                                  diasFertilidade: 7,
                                                  duracaoChoca: 14,
                                                  diasAnilhamento: 7,
                                                  diasSaidaNinho: 21
                                                });
                                                setEspecieDropdownAberto(null);
                                              }}
                                              className="flex-shrink-0 text-[9px] font-black px-2 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
                                              title="Criar nova espécie"
                                            >
                                              <i className="fas fa-plus"></i>
                                            </button>
                                          </div>
                                        </div>

                                        <div className="overflow-y-auto max-h-48">
                                          {getEspeciesDisponiveis()
                                            .filter(esp =>
                                              !especieBusca ||
                                              esp.toLowerCase().includes(especieBusca.toLowerCase())
                                            )
                                            .map(esp => (
                                              <button
                                                key={esp}
                                                type="button"
                                                onClick={() => {
                                                  onUpdateEgg(ninho.id, eggIdx, 'species', esp);
                                                  setEspecieDropdownAberto(null);
                                                  setEspecieBusca('');
                                                }}
                                                className={`w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-indigo-50 transition-colors flex items-center justify-between ${
                                                  egg.species === esp ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700'
                                                }`}
                                              >
                                                <span>{esp}</span>
                                                {egg.species === esp && (
                                                  <i className="fas fa-check text-indigo-600 text-[8px]"></i>
                                                )}
                                                {config.parametrosEspecies[esp] && (
                                                  <i className="fas fa-cog text-emerald-600 text-[7px]" title="Configurada"></i>
                                                )}
                                              </button>
                                            ))}

                                          {getEspeciesDisponiveis().filter(esp =>
                                            !especieBusca ||
                                            esp.toLowerCase().includes(especieBusca.toLowerCase())
                                          ).length === 0 && especieBusca && (
                                            <div className="px-3 py-3 text-center">
                                              <p className="text-[10px] text-slate-500 mb-2">
                                                Nenhuma espécie encontrada
                                              </p>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  onUpdateEgg(ninho.id, eggIdx, 'species', especieBusca);
                                                  setEspecieDropdownAberto(null);
                                                  setEspecieBusca('');
                                                }}
                                                className="text-[8px] font-black px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-all whitespace-nowrap"
                                              >
                                                Usar "{especieBusca}"
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {especieEditada && (
                                    <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                                      <i className="fas fa-edit text-[7px]"></i>
                                      EDITADO
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Origem / Casal */}
                              <td className="py-1.5 px-1">
                                {casal ? (() => {
                                  const macho = aves.find(a => a.id === casal.mId);
                                  const femea = aves.find(a => a.id === casal.fId);

                                  const machoIdentificacao = macho?.ring || macho?.name || 'S/ anilha';
                                  const femeaIdentificacao = femea?.ring || femea?.name || 'S/ anilha';
                                  const machoNome = macho?.name || 'Macho';
                                  const femeaNome = femea?.name || 'Fêmea';

                                  return (
                                    <div
                                      className="flex items-center gap-1.5 min-w-[105px]"
                                      title={`Macho: ${machoNome} | Fêmea: ${femeaNome} | Ninho: ${ninho.name || 'S/ nome'} | Gaiola: ${casal.cage || 'S/ Gaiola'}`}
                                    >
                                      {/* Fotos do casal */}
                                      <div className="flex items-center flex-shrink-0">
                                        <div
                                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center"
                                          title={`♂ ${machoIdentificacao}`}
                                        >
                                          {macho?.photo ? (
                                            <img
                                              src={macho.photo}
                                              alt={machoNome}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <i className="fas fa-mars text-blue-500 text-[10px]"></i>
                                          )}
                                        </div>

                                        <div
                                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center -ml-2"
                                          title={`♀ ${femeaIdentificacao}`}
                                        >
                                          {femea?.photo ? (
                                            <img
                                              src={femea.photo}
                                              alt={femeaNome}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <i className="fas fa-venus text-pink-500 text-[10px]"></i>
                                          )}
                                        </div>
                                      </div>

                                      {/* Identificação curta */}
                                      <span
                                        className="text-[8px] font-black text-slate-700 leading-tight whitespace-nowrap"
                                        title={`${machoNome} × ${femeaNome}`}
                                      >
                                        ♂ {machoIdentificacao} × ♀ {femeaIdentificacao}
                                      </span>
                                    </div>
                                  );
                                })() : (
                                  <div
                                    className="flex items-center gap-1.5 min-w-[105px]"
                                    title={`Ninho: ${ninho.name || 'S/ nome'} | Sem casal associado`}
                                  >
                                    <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                                      <i className="fas fa-heart-broken text-rose-400 text-[10px]"></i>
                                    </div>

                                    <span className="text-[8px] font-bold text-rose-400 whitespace-nowrap">
                                      Sem casal
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Local */}
                              <td className="py-1.5 px-1">
                                <select
                                  value={egg.local || ''}
                                  onChange={(e) => onUpdateEgg(ninho.id, eggIdx, 'local', e.target.value)}
                                  className="text-[9px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 outline-none"
                                >
                                  <option value="">Selecione...</option>
                                  {(config.locaisOvos || []).map((localCadastrado) => (
                                    <option key={localCadastrado} value={localCadastrado}>
                                      {localCadastrado}
                                    </option>
                                  ))}
                                  {egg.local && !(config.locaisOvos || []).includes(egg.local) && (
                                    <option value={egg.local}>{egg.local}</option>
                                  )}
                                </select>
                              </td>

                              {/* Status */}
                              <td className="py-1.5 px-1">
                                <StatusSelector
                                  status={egg.status}
                                  onChange={(novoStatus) =>
                                    onUpdateEgg(ninho.id, eggIdx, 'status', novoStatus)
                                  }
                                  onChocar={() => {
                                    setChocaModal({
                                      ninhoId: ninho.id,
                                      eggIdx
                                    });

                                    setChocaData({
                                      tipo: 'pais',
                                      dataInicio: new Date().toISOString().split('T')[0],
                                      casalAmasId: '',
                                      localChoca: ''
                                    });
                                  }}
                                />
                              </td>

                              {/* Início Choca */}
                              <td className="py-1.5 px-1">
                                {egg.status === 'Em Espera' ? (
                                  <button
                                    onClick={() => {
                                      setChocaModal({ ninhoId: ninho.id, eggIdx });
                                      setChocaData({
                                        tipo: 'pais',
                                        dataInicio: new Date().toISOString().split('T')[0],
                                        casalAmasId: '',
                                        localChoca: ''
                                      });
                                    }}
                                    className="text-[8px] font-black px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-all whitespace-nowrap"
                                  >
                                    Iniciar
                                  </button>
                                ) : (
                                  <div className="flex flex-col gap-1">
                                    <DataCompacta
                                      value={egg.inicioChoca || ''}
                                      onChange={(value) => onUpdateEgg(ninho.id, eggIdx, 'inicioChoca', value)}
                                      className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 w-24 h-7"
                                      ariaLabel="Data de início da choca"
                                    />
                                    {egg.casalChocandoId && egg.casalChocandoId !== ninho.casalId && (
                                      <span className="text-[8px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                        <i className="fas fa-users text-[7px] mr-1"></i>
                                        AMAS
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* Verificação Fertilidade */}
                              <td className="py-1.5 px-1">
                                {dataFertilidade ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex flex-col gap-1">
                                      {(egg.status === 'Fértil' || egg.status === 'Infértil') && (
                                        <span className={`text-[8px] font-black uppercase ${
                                          egg.status === 'Fértil' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                          {egg.status === 'Fértil' ? 'Fértil em:' : 'Infértil em:'}
                                        </span>
                                      )}
                                      <span className="text-[9px] font-bold text-slate-600">
                                        {formatarDataCurta(dataFertilidade)}
                                      </span>
                                      {egg.status === 'Chocando' && (
                                        <div className="flex items-center gap-2">
                                          <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input
                                              type="checkbox"
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  onUpdateEgg(ninho.id, eggIdx, 'status', 'Fértil');
                                                }
                                              }}
                                              className="w-3.5 h-3.5 rounded border-2 border-emerald-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                                            />
                                            <span className="text-[9px] font-bold text-emerald-600 group-hover:text-emerald-700">
                                              Fértil
                                            </span>
                                          </label>
                                          <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input
                                              type="checkbox"
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  if (confirm('Marcar este ovo como infértil?')) {
                                                    onUpdateEgg(ninho.id, eggIdx, 'status', 'Infértil');
                                                  }
                                                }
                                              }}
                                              className="w-3.5 h-3.5 rounded border-2 border-rose-300 text-rose-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-0 cursor-pointer"
                                            />
                                            <span className="text-[9px] font-bold text-rose-600 group-hover:text-rose-700">
                                              Infértil
                                            </span>
                                          </label>
                                        </div>
                                      )}
                                      {(egg.status === 'Fértil' || egg.status === 'Infértil') && (
                                        <button
                                          onClick={() => {
                                            if (confirm('Deseja reverter para o estado "Chocando"?')) {
                                              onUpdateEgg(ninho.id, eggIdx, 'status', 'Chocando');
                                            }
                                          }}
                                          className="text-[8px] font-bold text-slate-500 hover:text-slate-700 underline"
                                        >
                                          Reverter
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400">--</span>
                                )}
                              </td>

                              {/* Previsão Eclosão */}
                              <td className="py-1.5 px-1">
                                {dataEclosao ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex flex-col gap-1">
                                      {egg.status === 'Eclodido' && (
                                        <span className="text-[8px] font-black text-emerald-600 uppercase">
                                          Eclodido em:
                                        </span>
                                      )}
                                      <span className="text-[10px] font-bold text-slate-600">
                                        {egg.status === 'Eclodido' && egg.dataEclosao
                                          ? formatarDataCurta(egg.dataEclosao)
                                          : formatarDataCurta(dataEclosao)
                                        }
                                      </span>
                                      {(egg.status === 'Chocando' || egg.status === 'Fértil' || egg.status === 'Eclodido') && (
                                        <label className="flex items-center gap-1.5 cursor-pointer group">
                                          <input
                                            type="checkbox"
                                            checked={egg.status === 'Eclodido'}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setEclosaoModal({ ninhoId: ninho.id, eggIdx });
                                                setDataEclosao(new Date().toISOString().split('T')[0]);
                                              } else {
                                                if (confirm('Deseja reverter este ovo para o estado anterior (não eclodido)?' +
                                                  (egg.filhoteAnilhado ? '\n\nAtenção: O filhote anilhado será removido do plantel!' : ''))) {
                                                  onReverterEclosao(ninho.id, eggIdx);
                                                }
                                              }
                                            }}
                                            className="w-3.5 h-3.5 rounded border-2 border-emerald-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                                          />
                                          <span className="text-[9px] font-bold text-emerald-600 group-hover:text-emerald-700">
                                            {egg.status === 'Eclodido' ? 'Eclodido' : 'Eclodiu'}
                                          </span>
                                        </label>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400">--</span>
                                )}
                              </td>

                              {/* Previsão Anilhamento */}
                              <td className="py-1.5 px-1">
                                {dataAnilhamento ? (
                                  <div className="text-[10px] font-bold text-slate-600">
                                    {formatarDataCurta(dataAnilhamento)}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400">--</span>
                                )}
                              </td>

                              {/* Data Anilhamento */}
                              <td className="py-1.5 px-1">
                                {egg.status === 'Eclodido' ? (
                                  egg.filhoteAnilhado ? (
                                    <div className="flex items-center gap-1">
                                      <i className="fas fa-check-circle text-emerald-600 text-[8px]"></i>
                                      <span className="text-[9px] font-bold text-slate-600">
                                        {egg.anilha}
                                      </span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setAnilhamentoModal({ ninhoId: ninho.id, eggIdx });
                                        setAnilhaData({ numero: '', ano: new Date().getFullYear() });
                                      }}
                                      className="text-[8px] font-black px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 transition-all whitespace-nowrap"
                                    >
                                      Anilhar
                                    </button>
                                  )
                                ) : (
                                  <span className="text-[10px] text-slate-400">--</span>
                                )}
                              </td>

                              {/* Ações */}
                              <td className="py-1.5 px-1 text-center">
                                <button
                                  onClick={() => onRemoveEgg(ninho.id, eggIdx)}
                                  className="w-6 h-6 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"
                                  title="Excluir ovo"
                                >
                                  <i className="fas fa-trash text-[9px]"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          OVOS SEM LOCAL CADASTRADO
          ============================================================ */}
      {ovosPorLocal.has('Sem local definido') && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <i className="fas fa-exclamation-triangle"></i>
            <span className="text-xs font-black uppercase">
              Há ovos sem local definido. Selecione um local na coluna &quot;Local&quot;.
            </span>
          </div>
        </div>
      )}

      {/* Modal de Eclosão */}
      {eclosaoModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-lg font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
              <i className="fas fa-egg text-emerald-600"></i>
              Marcar como Eclodido
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                  Data de Eclosão
                </label>
                <DataCompacta
                  value={dataEclosao}
                  onChange={setDataEclosao}
                  className="w-full h-12 border-2 border-slate-200 p-3 rounded-xl text-sm font-bold bg-white outline-none focus-within:border-emerald-500"
                  ariaLabel="Data de eclosão"
                />
                <p className="text-[9px] text-slate-400 mt-1">Padrão: dia vigente</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEclosaoModal(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEclodir}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase"
                >
                  Confirmar Eclosão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Iniciar Choca */}
      {chocaModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-lg font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
              <i className="fas fa-play-circle text-indigo-600"></i>
              Iniciar Choca
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                  Data de Início
                </label>
                <DataCompacta
                  value={chocaData.dataInicio}
                  onChange={(value) => setChocaData({ ...chocaData, dataInicio: value })}
                  className="w-full h-12 border-2 border-slate-200 p-3 rounded-xl text-sm font-bold bg-white outline-none focus-within:border-indigo-500"
                  ariaLabel="Data de início da choca"
                />
                <p className="text-[9px] text-slate-400 mt-1">Padrão: dia vigente</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                  Tipo de Choca
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setChocaData({ ...chocaData, tipo: 'pais' })}
                    className={`py-3 px-4 rounded-xl font-black text-xs uppercase transition-all ${
                      chocaData.tipo === 'pais'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <i className="fas fa-heart mr-2"></i>
                    Pelos Pais
                  </button>
                  <button
                    onClick={() => setChocaData({ ...chocaData, tipo: 'amas' })}
                    className={`py-3 px-4 rounded-xl font-black text-xs uppercase transition-all ${
                      chocaData.tipo === 'amas'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <i className="fas fa-users mr-2"></i>
                    Por Amas
                  </button>
                </div>
              </div>

              {chocaData.tipo === 'amas' && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                      Casal de Amas
                    </label>
                    <CasalSelector
                      casais={casais}
                      aves={aves}
                      value={chocaData.casalAmasId}
                      onChange={(casalId) => setChocaData({ ...chocaData, casalAmasId: casalId })}
                      placeholder="Selecione o casal de amas..."
                      allowEmpty={false}
                      onCreateNew={() => setCriandoCasalAmas(true)}
                      excludeCasalId={chocaModal ? ninhos.find(n => n.id === chocaModal.ninhoId)?.casalId : undefined}
                    />
                  </div>

                  {criandoCasalAmas && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-purple-700 uppercase">
                          <i className="fas fa-plus-circle mr-1"></i>
                          Criar Novo Casal de Amas
                        </h4>
                        <button
                          onClick={() => setCriandoCasalAmas(false)}
                          className="text-purple-400 hover:text-purple-600"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-purple-600 uppercase block mb-1">
                          Macho
                        </label>
                        <select
                          value={novoCasalAmasMacho}
                          onChange={(e) => setNovoCasalAmasMacho(e.target.value)}
                          className="w-full border-2 border-purple-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-purple-500 bg-white"
                        >
                          <option value="">Selecione o macho...</option>
                          {aves.filter(a => a.sex === 'Macho' && a.status === 'Ativo').map(ave => (
                            <option key={ave.id} value={ave.id}>
                              {ave.ring || ave.name} - {ave.species}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-purple-600 uppercase block mb-1">
                          Fêmea
                        </label>
                        <select
                          value={novoCasalAmasFemea}
                          onChange={(e) => setNovoCasalAmasFemea(e.target.value)}
                          className="w-full border-2 border-purple-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-purple-500 bg-white"
                        >
                          <option value="">Selecione a fêmea...</option>
                          {aves.filter(a => a.sex === 'Fêmea' && a.status === 'Ativo').map(ave => (
                            <option key={ave.id} value={ave.id}>
                              {ave.ring || ave.name} - {ave.species}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-purple-600 uppercase block mb-1">
                          Gaiola
                        </label>
                        <input
                          type="text"
                          value={novoCasalAmasGaiola}
                          onChange={(e) => setNovoCasalAmasGaiola(e.target.value)}
                          placeholder="Ex: 5"
                          className="w-full border-2 border-purple-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                      Local do Ninho
                    </label>
                    <input
                      type="text"
                      value={chocaData.localChoca}
                      onChange={(e) => setChocaData({ ...chocaData, localChoca: e.target.value })}
                      placeholder="Ex: Gaiola 5, Caixa A..."
                      className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-purple-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setChocaModal(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarChoca}
                  disabled={chocaData.tipo === 'amas' && (!chocaData.casalAmasId || !chocaData.localChoca)}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Choca
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Anilhamento */}
      {anilhamentoModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-lg font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
              <i className="fas fa-ring text-amber-600"></i>
              Anilhar Filhote
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                  Número da Anilha
                </label>
                <input
                  type="text"
                  value={anilhaData.numero}
                  onChange={(e) => setAnilhaData({ ...anilhaData, numero: e.target.value })}
                  placeholder="Ex: ABC-001"
                  className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                  Ano da Anilha
                </label>
                <input
                  type="number"
                  value={anilhaData.ano}
                  onChange={(e) => setAnilhaData({ ...anilhaData, ano: Number(e.target.value) })}
                  className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-amber-500"
                />
                <p className="text-[9px] text-slate-400 mt-1">Padrão: ano vigente</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setAnilhamentoModal(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAnilhar}
                  disabled={!anilhaData.numero}
                  className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-black text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anilhar e Mover para Plantel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar Novo Casal no Dropdown */}
      {criandoCasalDropdown && (() => {
        const handleCriarCasal = () => {
          const machoAve = aves.find(a => a.id === novoCasalDropdownMacho);
          const femeaAve = aves.find(a => a.id === novoCasalDropdownFemea);
          
          if (!machoAve || !femeaAve) {
            alert('Por favor, selecione um macho e uma fêmea');
            return;
          }
          
          const novoCasalId = onSaveCasal({
            mId: machoAve.id,
            fId: femeaAve.id,
            cage: novoCasalDropdownGaiola || 'S/ Gaiola',
          });
          
          // Associa o novo casal ao ninho
          onUpdateNinhoCasal(criandoCasalDropdown, novoCasalId);
          
          // Reseta estados
          setCriandoCasalDropdown(null);
          setNovoCasalDropdownMacho('');
          setNovoCasalDropdownFemea('');
          setNovoCasalDropdownGaiola('');
        };

        return (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              <h3 className="text-lg font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
                <i className="fas fa-heart text-indigo-600"></i>
                Criar Novo Casal
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                    Macho
                  </label>
                  <AveSelector
                    aves={getAvesDisponiveis('Macho')}
                    value={novoCasalDropdownMacho}
                    onChange={(aveId) => setNovoCasalDropdownMacho(aveId)}
                    placeholder="Selecione o macho..."
                    tipo="macho"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                    Fêmea
                  </label>
                  <AveSelector
                    aves={getAvesDisponiveis('Fêmea')}
                    value={novoCasalDropdownFemea}
                    onChange={(aveId) => setNovoCasalDropdownFemea(aveId)}
                    placeholder="Selecione a fêmea..."
                    tipo="femea"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                    Número da Gaiola
                  </label>
                  <input
                    type="text"
                    value={novoCasalDropdownGaiola}
                    onChange={(e) => setNovoCasalDropdownGaiola(e.target.value)}
                    placeholder="Ex: 5 (opcional)"
                    className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Deixe em branco para "S/ Gaiola"</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setCriandoCasalDropdown(null);
                      setNovoCasalDropdownMacho('');
                      setNovoCasalDropdownFemea('');
                      setNovoCasalDropdownGaiola('');
                    }}
                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCriarCasal}
                    disabled={!novoCasalDropdownMacho || !novoCasalDropdownFemea}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Criar e Associar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de Criar Nova Espécie */}
      {criarEspecieModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full">
            <h3 className="text-lg font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
              <i className="fas fa-feather-alt text-emerald-600"></i>
              Criar Nova Espécie
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                  Nome da Espécie *
                </label>
                <input
                  type="text"
                  value={novaEspecieData.nome}
                  onChange={(e) => setNovaEspecieData({ ...novaEspecieData, nome: e.target.value })}
                  placeholder="Ex: Diamante de Gould, Canário..."
                  className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                    <i className="fas fa-calendar-check text-[8px] mr-1"></i>
                    Dias p/ Verificar Fertilidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={novaEspecieData.diasFertilidade}
                    onChange={(e) => setNovaEspecieData({ ...novaEspecieData, diasFertilidade: parseInt(e.target.value) || 0 })}
                    className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                    <i className="fas fa-egg text-[8px] mr-1"></i>
                    Duração da Choca (dias)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={novaEspecieData.duracaoChoca}
                    onChange={(e) => setNovaEspecieData({ ...novaEspecieData, duracaoChoca: parseInt(e.target.value) || 0 })}
                    className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                    <i className="fas fa-ring text-[8px] mr-1"></i>
                    Dias p/ Anilhamento
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={novaEspecieData.diasAnilhamento}
                    onChange={(e) => setNovaEspecieData({ ...novaEspecieData, diasAnilhamento: parseInt(e.target.value) || 0 })}
                    className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
                    <i className="fas fa-sign-out-alt text-[8px] mr-1"></i>
                    Dias p/ Saída do Ninho
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={novaEspecieData.diasSaidaNinho}
                    onChange={(e) => setNovaEspecieData({ ...novaEspecieData, diasSaidaNinho: parseInt(e.target.value) || 0 })}
                    className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-emerald-800">
                  <i className="fas fa-info-circle mr-1"></i>
                  Estes parâmetros serão usados para calcular automaticamente as datas de fertilidade, eclosão, anilhamento e saída do ninho para ovos desta espécie.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setCriarEspecieModal(null);
                  setNovaEspecieData({
                    nome: '',
                    diasFertilidade: 7,
                    duracaoChoca: 14,
                    diasAnilhamento: 7,
                    diasSaidaNinho: 21
                  });
                }}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs uppercase hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!novaEspecieData.nome.trim()) {
                    alert('Por favor, informe o nome da espécie');
                    return;
                  }

                  const novaConfig = {
                    ...config,
                    especies: config.especies.includes(novaEspecieData.nome) 
                      ? config.especies 
                      : [...config.especies, novaEspecieData.nome],
                    parametrosEspecies: {
                      ...config.parametrosEspecies,
                      [novaEspecieData.nome]: {
                        diasFertilidade: novaEspecieData.diasFertilidade,
                        duracaoChoca: novaEspecieData.duracaoChoca,
                        diasAnilhamento: novaEspecieData.diasAnilhamento,
                        diasSaidaNinho: novaEspecieData.diasSaidaNinho
                      }
                    }
                  };

                  onSaveConfig(novaConfig);
                  
                  // Atualizar o ovo com a nova espécie
                  onUpdateEgg(criarEspecieModal.ninhoId, criarEspecieModal.eggIdx, 'species', novaEspecieData.nome);

                  setCriarEspecieModal(null);
                  setNovaEspecieData({
                    nome: '',
                    diasFertilidade: 7,
                    duracaoChoca: 14,
                    diasAnilhamento: 7,
                    diasSaidaNinho: 21
                  });
                }}
                disabled={!novaEspecieData.nome.trim()}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-check mr-2"></i>
                Criar Espécie
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
