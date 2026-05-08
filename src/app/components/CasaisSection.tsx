import { useState } from 'react';
import type { Casal, Ave, ModalType, Filhote } from '../App';
import { CasalHistoricoModal } from './CasalHistoricoModal';

interface CasaisSectionProps {
  casais: Casal[];
  aves: Ave[];
  onOpenModal: (type: ModalType, id?: string | null) => void;
  onDeleteCasal: (id: string) => void;
  onUpdateCasal?: (casalId: string, field: keyof Casal, value: any) => void;
  onAddFilhote: (casalId: string, filhote: Omit<Filhote, 'id'>) => void;
  onUpdateFilhote: (casalId: string, filhoteId: string, updates: Partial<Filhote>) => void;
  onDeleteFilhote: (casalId: string, filhoteId: string) => void;
  onViewDetails?: (aveId: string) => void;
}

export function CasaisSection({ casais, aves, onOpenModal, onDeleteCasal, onUpdateCasal, onAddFilhote, onUpdateFilhote, onDeleteFilhote, onViewDetails }: CasaisSectionProps) {
  const [selectedCasalId, setSelectedCasalId] = useState<string | null>(null);
  const [editandoGaiola, setEditandoGaiola] = useState<string | null>(null);
  const [gaiolaTemp, setGaiolaTemp] = useState('');

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
          Casais
        </h2>
        <button
          onClick={() => onOpenModal('casal')}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px]"
        >
          UNIR PAR
        </button>
      </div>
      
      <div className="space-y-3">
        {casais.map((casal) => {
          const macho = aves.find(a => a.id === casal.mId);
          const femea = aves.find(a => a.id === casal.fId);
          
          return (
            <div key={casal.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header com número da gaiola */}
              <div className="bg-indigo-600 text-white px-4 py-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <i className="fas fa-heart text-xs"></i>
                  <span className="text-xs font-black uppercase">
                    {editandoGaiola === casal.id ? (
                      <input
                        type="text"
                        value={gaiolaTemp}
                        onChange={(e) => setGaiolaTemp(e.target.value)}
                        onBlur={() => {
                          if (onUpdateCasal) {
                            onUpdateCasal(casal.id, 'cage', gaiolaTemp);
                          }
                          setEditandoGaiola(null);
                        }}
                        className="bg-indigo-600 text-white px-2 py-1 rounded-xl font-black text-[10px] w-16"
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditandoGaiola(casal.id);
                          setGaiolaTemp(casal.cage || '');
                        }}
                        className="cursor-pointer"
                      >
                        {casal.cage || 'Gaiola s/nº'}
                      </span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteCasal(casal.id)}
                  className="w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center justify-center transition-all"
                >
                  <i className="fas fa-trash-alt text-[10px]"></i>
                </button>
              </div>

              {/* Conteúdo do casal */}
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  {/* Macho */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {macho?.photo ? (
                        <img src={macho.photo} className="w-16 h-16 rounded-xl object-cover" alt={macho.name} />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
                          <i className="fas fa-mars text-blue-600 text-xl"></i>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-blue-600 mb-0.5">MACHO</div>
                        <button
                          onClick={() => macho && onViewDetails && onViewDetails(macho.id)}
                          className="font-bold text-sm truncate text-emerald-600 hover:text-emerald-800 underline cursor-pointer text-left w-full"
                        >
                          {macho?.name || 'S/ Nome'}
                        </button>
                        <div className="text-[10px] text-slate-500">
                          <button
                            onClick={() => macho && onViewDetails && onViewDetails(macho.id)}
                            className="text-emerald-600 hover:text-emerald-800 underline cursor-pointer"
                          >
                            {macho?.ring || 'S/A'}
                          </button> • {macho?.ringYear || '--'}
                        </div>
                      </div>
                    </div>
                    {onUpdateCasal && (
                      <select
                        value={casal.mId}
                        onChange={(e) => onUpdateCasal(casal.id, 'mId', e.target.value)}
                        className="w-full text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5 outline-none hover:bg-blue-100 transition-all"
                      >
                        {aves.filter(a => a.sex === 'Macho' && a.status === 'Ativo').map(ave => (
                          <option key={ave.id} value={ave.id}>
                            {ave.ring || ave.name} - {ave.species}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Fêmea */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {femea?.photo ? (
                        <img src={femea.photo} className="w-16 h-16 rounded-xl object-cover" alt={femea.name} />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-pink-100 flex items-center justify-center">
                          <i className="fas fa-venus text-pink-600 text-xl"></i>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-pink-600 mb-0.5">FÊMEA</div>
                        <button
                          onClick={() => femea && onViewDetails && onViewDetails(femea.id)}
                          className="font-bold text-sm truncate text-emerald-600 hover:text-emerald-800 underline cursor-pointer text-left w-full"
                        >
                          {femea?.name || 'S/ Nome'}
                        </button>
                        <div className="text-[10px] text-slate-500">
                          <button
                            onClick={() => femea && onViewDetails && onViewDetails(femea.id)}
                            className="text-emerald-600 hover:text-emerald-800 underline cursor-pointer"
                          >
                            {femea?.ring || 'S/A'}
                          </button> • {femea?.ringYear || '--'}
                        </div>
                      </div>
                    </div>
                    {onUpdateCasal && (
                      <select
                        value={casal.fId}
                        onChange={(e) => onUpdateCasal(casal.id, 'fId', e.target.value)}
                        className="w-full text-[10px] font-bold text-pink-700 bg-pink-50 border border-pink-200 rounded-lg px-2 py-1.5 outline-none hover:bg-pink-100 transition-all"
                      >
                        {aves.filter(a => a.sex === 'Fêmea' && a.status === 'Ativo').map(ave => (
                          <option key={ave.id} value={ave.id}>
                            {ave.ring || ave.name} - {ave.species}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Botão de histórico */}
                <button
                  onClick={() => setSelectedCasalId(casal.id)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all"
                >
                  <i className="fas fa-chart-line"></i>
                  Ver Histórico do Casal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCasalId && (
        <CasalHistoricoModal
          casal={casais.find(c => c.id === selectedCasalId)!}
          macho={aves.find(a => a.id === casais.find(c => c.id === selectedCasalId)?.mId)}
          femea={aves.find(a => a.id === casais.find(c => c.id === selectedCasalId)?.fId)}
          onClose={() => setSelectedCasalId(null)}
          onAddFilhote={onAddFilhote}
          onUpdateFilhote={onUpdateFilhote}
          onDeleteFilhote={onDeleteFilhote}
        />
      )}
    </section>
  );
}