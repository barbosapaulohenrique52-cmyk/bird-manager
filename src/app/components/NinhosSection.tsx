import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Egg, 
  LogOut, 
  Calendar, 
  ChevronDown, 
  Sparkles,
  Info
} from 'lucide-react';

interface Ovo {
  id: string;
  dataPostura: string;
  especie: string;
  origem: string;
  previsaoEclosao: string;
  status: 'Em Incubação' | 'Galo' | 'Infértil' | 'Eclodido';
  anilha?: string;
}

interface GaiolaNinho {
  id: string;
  numeroGaiola: string;
  casal: string;
  ovos: Ovo[];
}

export const NinhosSection: React.FC = () => {
  // Exemplo de estado inicial para demonstração
  const [ninhos, setNinhos] = useState<GaiolaNinho[]>([
    {
      id: '1',
      numeroGaiola: '04',
      casal: 'Macho #102 x Fêmea #88',
      ovos: [
        {
          id: '101',
          dataPostura: '2026-09-10',
          especie: 'Canário do Reino',
          origem: 'Própria',
          previsaoEclosao: '2026-09-23',
          status: 'Em Incubação',
          anilha: 'BR-2026-1049'
        }
      ]
    }
  ]);

  const handleAddOvo = (ninhoId: string) => {
    const novoOvo: Ovo = {
      id: Date.now().toString(),
      dataPostura: new Date().toISOString().split('T')[0],
      especie: 'Selecione',
      origem: 'Própria',
      previsaoEclosao: '',
      status: 'Em Incubação'
    };

    setNinhos(prev => prev.map(ninho => {
      if (ninho.id === ninhoId) {
        return { ...ninho, ovos: [...ninho.ovos, novoOvo] };
      }
      return ninho;
    }));
  };

  const handleRemoveOvo = (ninhoId: string, ovoId: string) => {
    setNinhos(prev => prev.map(ninho => {
      if (ninho.id === ninhoId) {
        return {
          ...ninho,
          ovos: ninho.ovos.filter(o => o.id !== ovoId)
        };
      }
      return ninho;
    }));
  };

  const getStatusBadge = (status: Ovo['status']) => {
    switch (status) {
      case 'Em Incubação':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Eclodido':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Infértil':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50/50 min-h-screen">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Egg className="w-6 h-6 text-emerald-600" />
            Gestão de Ninhos
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe as posturas, previsões de eclosão e controle de postura por gaiola.
          </p>
        </div>
      </div>

      {/* Lista de Gaiolas / Ninhos */}
      <div className="space-y-6">
        {ninhos.map((ninho) => (
          <div 
            key={ninho.id} 
            className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            {/* Topo do Card da Gaiola */}
            <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full tracking-wide">
                  GAIOLA {ninho.numeroGaiola}
                </span>
                <h3 className="font-semibold text-slate-800 text-base">
                  {ninho.casal}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddOvo(ninho.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Ovo
                </button>
                <button
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg transition-colors focus:outline-none"
                  title="Finalizar postura ou sair do ninho"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  Sair do Ninho
                </button>
              </div>
            </div>

            {/* Tabela de Ovos */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50/40 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6">Postura</th>
                    <th className="py-3 px-4">Espécie</th>
                    <th className="py-3 px-4">Origem</th>
                    <th className="py-3 px-4">Prev. Eclosão</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Anilha</th>
                    <th className="py-3 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ninho.ovos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Nenhum ovo registrado para esta gaiola.
                      </td>
                    </tr>
                  ) : (
                    ninho.ovos.map((ovo) => (
                      <tr key={ovo.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Data de Postura */}
                        <td className="py-3.5 px-6 font-medium text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <input 
                              type="date" 
                              value={ovo.dataPostura}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNinhos(prev => prev.map(n => n.id === ninho.id ? {
                                  ...n,
                                  ovos: n.ovos.map(o => o.id === ovo.id ? { ...o, dataPostura: val } : o)
                                } : n));
                              }}
                              className="bg-transparent text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                            />
                          </div>
                        </td>

                        {/* Espécie */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <input 
                            type="text" 
                            value={ovo.especie}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNinhos(prev => prev.map(n => n.id === ninho.id ? {
                                ...n,
                                ovos: n.ovos.map(o => o.id === ovo.id ? { ...o, especie: val } : o)
                              } : n));
                            }}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                          />
                        </td>

                        {/* Origem */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <select 
                            value={ovo.origem}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNinhos(prev => prev.map(n => n.id === ninho.id ? {
                                ...n,
                                ovos: n.ovos.map(o => o.id === ovo.id ? { ...o, origem: val } : o)
                              } : n));
                            }}
                            className="bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="Própria">Própria</option>
                            <option value="Adotado">Adotado</option>
                            <option value="Transferido">Transferido</option>
                          </select>
                        </td>

                        {/* Previsão de Eclosão */}
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          <input 
                            type="date" 
                            value={ovo.previsaoEclosao}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNinhos(prev => prev.map(n => n.id === ninho.id ? {
                                ...n,
                                ovos: n.ovos.map(o => o.id === ovo.id ? { ...o, previsaoEclosao: val } : o)
                              } : n));
                            }}
                            className="bg-transparent text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                          />
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(ovo.status)}`}>
                            {ovo.status}
                          </span>
                        </td>

                        {/* Anilha */}
                        <td className="py-3.5 px-4">
                          <input 
                            type="text" 
                            placeholder="Anilha..."
                            value={ovo.anilha || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNinhos(prev => prev.map(n => n.id === ninho.id ? {
                                ...n,
                                ovos: n.ovos.map(o => o.id === ovo.id ? { ...o, anilha: val } : o)
                              } : n));
                            }}
                            className="w-28 bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                          />
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => handleRemoveOvo(ninho.id, ovo.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center"
                            title="Excluir ovo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NinhosSection;
