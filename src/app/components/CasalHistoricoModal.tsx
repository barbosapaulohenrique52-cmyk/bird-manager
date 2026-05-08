import { useState } from 'react';
import type { Casal, Ave, Filhote } from '../App';

interface CasalHistoricoModalProps {
  casal: Casal;
  macho?: Ave;
  femea?: Ave;
  onClose: () => void;
  onAddFilhote: (casalId: string, filhote: Omit<Filhote, 'id'>) => void;
  onUpdateFilhote: (casalId: string, filhoteId: string, updates: Partial<Filhote>) => void;
  onDeleteFilhote: (casalId: string, filhoteId: string) => void;
}

export function CasalHistoricoModal({ casal, macho, femea, onClose, onAddFilhote, onUpdateFilhote, onDeleteFilhote }: CasalHistoricoModalProps) {
  const filhotes = casal.historico || [];

  const [showAddFilhote, setShowAddFilhote] = useState(false);
  const [newFilhote, setNewFilhote] = useState({
    anilha: '',
    anoAnilha: new Date().getFullYear(),
    dataVenda: '',
    valorVenda: '',
    comprador: '',
    status: 'Ativo' as 'Ativo' | 'Vendido'
  });

  const totalFilhotes = filhotes.length;
  const filhotesVendidos = filhotes.filter(f => f.status === 'Vendido').length;
  const filhotesAtivos = filhotes.filter(f => f.status === 'Ativo').length;
  const valorTotal = filhotes.reduce((sum, f) => sum + (f.valorVenda || 0), 0);

  const handleAddFilhote = () => {
    if (!newFilhote.anilha.trim()) {
      alert('Por favor, informe a anilha');
      return;
    }

    onAddFilhote(casal.id, {
      anilha: newFilhote.anilha,
      anoAnilha: newFilhote.anoAnilha,
      dataVenda: newFilhote.status === 'Vendido' ? newFilhote.dataVenda : undefined,
      valorVenda: newFilhote.status === 'Vendido' ? Number(newFilhote.valorVenda) : undefined,
      comprador: newFilhote.status === 'Vendido' ? newFilhote.comprador : undefined,
      status: newFilhote.status
    });

    setNewFilhote({
      anilha: '',
      anoAnilha: new Date().getFullYear(),
      dataVenda: '',
      valorVenda: '',
      comprador: '',
      status: 'Ativo'
    });
    setShowAddFilhote(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[32px] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="font-black text-lg uppercase italic">Histórico do Casal</h2>
            <p className="text-sm opacity-90">{casal.cage || 'Gaiola s/nº'}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info do casal */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              {macho?.photo ? (
                <img src={macho.photo} className="w-14 h-14 rounded-xl object-cover" alt={macho.name} />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <i className="fas fa-mars text-blue-600"></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-blue-600">MACHO</div>
                <div className="font-bold text-sm truncate">{macho?.name || 'S/ Nome'}</div>
                <div className="text-xs text-slate-500">{macho?.ring || 'S/A'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {femea?.photo ? (
                <img src={femea.photo} className="w-14 h-14 rounded-xl object-cover" alt={femea.name} />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center">
                  <i className="fas fa-venus text-pink-600"></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-pink-600">FÊMEA</div>
                <div className="font-bold text-sm truncate">{femea?.name || 'S/ Nome'}</div>
                <div className="text-xs text-slate-500">{femea?.ring || 'S/A'}</div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-emerald-600">{totalFilhotes}</div>
              <div className="text-[10px] font-black text-emerald-600 uppercase mt-1">Total Filhotes</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-blue-600">{filhotesAtivos}</div>
              <div className="text-[10px] font-black text-blue-600 uppercase mt-1">Ativos</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-purple-600">{filhotesVendidos}</div>
              <div className="text-[10px] font-black text-purple-600 uppercase mt-1">Vendidos</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-amber-600">R$ {valorTotal}</div>
              <div className="text-[10px] font-black text-amber-600 uppercase mt-1">Arrecadado</div>
            </div>
          </div>

          {/* Lista de filhotes */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-slate-800 uppercase text-sm">Filhotes Registrados</h3>
              <button
                onClick={() => setShowAddFilhote(!showAddFilhote)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase"
              >
                <i className="fas fa-plus mr-1"></i>
                Adicionar
              </button>
            </div>

            {/* Formulário de adicionar filhote */}
            {showAddFilhote && (
              <div className="bg-slate-50 p-4 rounded-2xl mb-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Anilha</label>
                    <input
                      type="text"
                      value={newFilhote.anilha}
                      onChange={(e) => setNewFilhote({ ...newFilhote, anilha: e.target.value })}
                      placeholder="Ex: ABC-001"
                      className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Ano Anilha</label>
                    <input
                      type="number"
                      value={newFilhote.anoAnilha}
                      onChange={(e) => setNewFilhote({ ...newFilhote, anoAnilha: Number(e.target.value) })}
                      className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Status</label>
                    <select
                      value={newFilhote.status}
                      onChange={(e) => setNewFilhote({ ...newFilhote, status: e.target.value as 'Ativo' | 'Vendido' })}
                      className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Vendido">Vendido</option>
                    </select>
                  </div>
                </div>

                {newFilhote.status === 'Vendido' && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t-2 border-slate-200">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Data Venda</label>
                      <input
                        type="date"
                        value={newFilhote.dataVenda}
                        onChange={(e) => setNewFilhote({ ...newFilhote, dataVenda: e.target.value })}
                        className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Valor (R$)</label>
                      <input
                        type="number"
                        value={newFilhote.valorVenda}
                        onChange={(e) => setNewFilhote({ ...newFilhote, valorVenda: e.target.value })}
                        placeholder="0"
                        className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Comprador</label>
                      <input
                        type="text"
                        value={newFilhote.comprador}
                        onChange={(e) => setNewFilhote({ ...newFilhote, comprador: e.target.value })}
                        placeholder="Nome"
                        className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowAddFilhote(false)}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-black text-xs uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddFilhote}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-black text-xs uppercase"
                  >
                    Salvar Filhote
                  </button>
                </div>
              </div>
            )}

            {/* Lista */}
            <div className="space-y-2">
              {filhotes.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <i className="fas fa-egg text-3xl mb-2"></i>
                  <p className="text-sm">Nenhum filhote registrado ainda</p>
                </div>
              ) : (
                filhotes.map((filhote) => (
                  <div key={filhote.id} className="bg-white border-2 border-slate-100 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{filhote.anilha}</span>
                          <span className="text-xs text-slate-500">• {filhote.anoAnilha}</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            filhote.status === 'Ativo' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {filhote.status}
                          </span>
                        </div>
                        {filhote.status === 'Vendido' && (
                          <div className="text-xs text-slate-500 mt-1">
                            Vendido em {filhote.dataVenda} • R$ {filhote.valorVenda} • {filhote.comprador}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Deseja remover este filhote do histórico?')) {
                            onDeleteFilhote(casal.id, filhote.id);
                          }
                        }}
                        className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-100 transition-all"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}