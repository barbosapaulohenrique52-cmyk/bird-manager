import type { Ave, Casal, Ninho } from '../App';

interface AveDetalhesModalProps {
  ave: Ave;
  aves: Ave[];
  casais: Casal[];
  ninhos: Ninho[];
  onClose: () => void;
  onNavigate: (aveId: string) => void;
  onPhotoClick?: (photo: string) => void;
}

export function AveDetalhesModal({ ave, aves, casais, ninhos, onClose, onNavigate, onPhotoClick }: AveDetalhesModalProps) {
  // Buscar pais biológicos
  const pai = ave.parentMaleId ? aves.find(a => a.id === ave.parentMaleId) : undefined;
  const mae = ave.parentFemaleId ? aves.find(a => a.id === ave.parentFemaleId) : undefined;

  // Buscar casal de amas se aplicável
  const casalAmas = ave.casalAmasId ? casais.find(c => c.id === ave.casalAmasId) : undefined;
  const amasMacho = casalAmas ? aves.find(a => a.id === casalAmas.mId) : undefined;
  const amasFemea = casalAmas ? aves.find(a => a.id === casalAmas.fId) : undefined;

  // Buscar ninho de origem
  const ninhoOrigem = ave.birthNestId ? ninhos.find(n => n.id === ave.birthNestId) : undefined;

  // Buscar descendentes (filhotes) - aves que têm esta ave como pai ou mãe
  const descendentes = aves.filter(a =>
    a.parentMaleId === ave.id || a.parentFemaleId === ave.id
  );

  // Buscar casais que esta ave participa
  const casaisDaAve = casais.filter(c => c.mId === ave.id || c.fId === ave.id);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[32px] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-700 text-white flex justify-between items-start sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {ave.photo && (
              <img
                src={ave.photo}
                alt={ave.name}
                className="w-20 h-20 rounded-2xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onPhotoClick && onPhotoClick(ave.photo!)}
              />
            )}
            <div>
              <h2 className="font-black text-2xl uppercase italic">{ave.name || 'S/ Nome'}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold">
                  {ave.ring || 'S/A'} • {ave.ringYear || '--'}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  ave.sex === 'Macho' ? 'bg-blue-500' : ave.sex === 'Fêmea' ? 'bg-pink-500' : 'bg-slate-500'
                }`}>
                  {ave.sex}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  ave.status === 'Ativo' ? 'bg-emerald-500' :
                  ave.status === 'No Ninho' ? 'bg-amber-500' :
                  ave.status === 'Vendido' ? 'bg-purple-500' : 'bg-slate-500'
                }`}>
                  {ave.status}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-slate-50 p-4 rounded-2xl">
            <h3 className="font-black text-slate-800 uppercase text-sm mb-3">Informações Básicas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase">Espécie</div>
                <div className="font-bold text-sm">{ave.species}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase">Criador</div>
                <div className="font-bold text-sm">{ave.creator}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase">Ano Aquisição</div>
                <div className="font-bold text-sm">{ave.acqYear}</div>
              </div>
              {ave.birthDate && (
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Data Nascimento</div>
                  <div className="font-bold text-sm">{new Date(ave.birthDate).toLocaleDateString('pt-BR')}</div>
                </div>
              )}
            </div>

            {/* Cores */}
            {(ave.corCabeca || ave.corPeito || ave.corDorso) && (
              <div className="mt-4 pt-4 border-t-2 border-slate-200">
                <h4 className="font-black text-slate-600 uppercase text-xs mb-2">Cores</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {ave.corCabeca && (
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase">Cabeça</div>
                      <div className="font-bold text-xs">{ave.corCabeca}</div>
                    </div>
                  )}
                  {ave.corPeito && (
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase">Peito</div>
                      <div className="font-bold text-xs">{ave.corPeito}</div>
                    </div>
                  )}
                  {ave.corDorso && (
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase">Dorso</div>
                      <div className="font-bold text-xs">{ave.corDorso}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ascendência */}
          {(pai || mae || casalAmas) && (
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl">
              <h3 className="font-black text-blue-800 uppercase text-sm mb-3 flex items-center gap-2">
                <i className="fas fa-sitemap"></i>
                Ascendência
              </h3>

              {/* Pais Biológicos */}
              {(pai || mae) && (
                <div className="mb-3">
                  <div className="text-[10px] font-black text-blue-600 uppercase mb-2">Pais Biológicos</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pai && (
                      <button
                        onClick={() => onNavigate(pai.id)}
                        className="bg-white border-2 border-blue-300 hover:border-blue-500 p-3 rounded-xl text-left transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <i className="fas fa-mars text-blue-600"></i>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{pai.name || 'S/ Nome'}</div>
                            <div className="text-[10px] text-slate-500">{pai.ring || 'S/A'}</div>
                          </div>
                          <i className="fas fa-arrow-right text-blue-400 text-xs"></i>
                        </div>
                      </button>
                    )}
                    {mae && (
                      <button
                        onClick={() => onNavigate(mae.id)}
                        className="bg-white border-2 border-pink-300 hover:border-pink-500 p-3 rounded-xl text-left transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <i className="fas fa-venus text-pink-600"></i>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{mae.name || 'S/ Nome'}</div>
                            <div className="text-[10px] text-slate-500">{mae.ring || 'S/A'}</div>
                          </div>
                          <i className="fas fa-arrow-right text-pink-400 text-xs"></i>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Amas */}
              {ave.criadoPorAmas && casalAmas && (amasMacho || amasFemea) && (
                <div className="pt-3 border-t-2 border-blue-200">
                  <div className="text-[10px] font-black text-amber-600 uppercase mb-2 flex items-center gap-2">
                    <i className="fas fa-hand-holding-heart"></i>
                    Criado por Amas
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {amasMacho && (
                      <button
                        onClick={() => onNavigate(amasMacho.id)}
                        className="bg-amber-50 border-2 border-amber-300 hover:border-amber-500 p-3 rounded-xl text-left transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <i className="fas fa-mars text-blue-600"></i>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{amasMacho.name || 'S/ Nome'}</div>
                            <div className="text-[10px] text-slate-500">{amasMacho.ring || 'S/A'}</div>
                          </div>
                          <i className="fas fa-arrow-right text-amber-400 text-xs"></i>
                        </div>
                      </button>
                    )}
                    {amasFemea && (
                      <button
                        onClick={() => onNavigate(amasFemea.id)}
                        className="bg-amber-50 border-2 border-amber-300 hover:border-amber-500 p-3 rounded-xl text-left transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <i className="fas fa-venus text-pink-600"></i>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{amasFemea.name || 'S/ Nome'}</div>
                            <div className="text-[10px] text-slate-500">{amasFemea.ring || 'S/A'}</div>
                          </div>
                          <i className="fas fa-arrow-right text-amber-400 text-xs"></i>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Descendentes */}
          {descendentes.length > 0 && (
            <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl">
              <h3 className="font-black text-emerald-800 uppercase text-sm mb-3 flex items-center gap-2">
                <i className="fas fa-baby"></i>
                Descendentes ({descendentes.length})
              </h3>
              <div className="space-y-2">
                {descendentes.map(filhote => (
                  <button
                    key={filhote.id}
                    onClick={() => onNavigate(filhote.id)}
                    className="w-full bg-white border-2 border-emerald-200 hover:border-emerald-500 p-3 rounded-xl text-left transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        filhote.sex === 'Macho' ? 'bg-blue-100 text-blue-600' :
                        filhote.sex === 'Fêmea' ? 'bg-pink-100 text-pink-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <i className={`fas ${
                          filhote.sex === 'Macho' ? 'fa-mars' :
                          filhote.sex === 'Fêmea' ? 'fa-venus' :
                          'fa-question'
                        }`}></i>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{filhote.name || 'S/ Nome'}</div>
                        <div className="text-[10px] text-slate-500">
                          {filhote.ring || 'S/A'} • {filhote.ringYear || '--'} • {filhote.status}
                        </div>
                      </div>
                    </div>
                    <i className="fas fa-arrow-right text-emerald-400"></i>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Casais Ativos */}
          {casaisDaAve.length > 0 && (
            <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl">
              <h3 className="font-black text-indigo-800 uppercase text-sm mb-3 flex items-center gap-2">
                <i className="fas fa-heart"></i>
                Casais Ativos ({casaisDaAve.length})
              </h3>
              <div className="space-y-2">
                {casaisDaAve.map(casal => {
                  const parceiro = casal.mId === ave.id
                    ? aves.find(a => a.id === casal.fId)
                    : aves.find(a => a.id === casal.mId);

                  return (
                    <div
                      key={casal.id}
                      className="bg-white border-2 border-indigo-200 p-3 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-black text-indigo-600 uppercase">Gaiola {casal.cage}</div>
                          <div className="text-xs text-slate-600">
                            Parceiro: <button
                              onClick={() => parceiro && onNavigate(parceiro.id)}
                              className="font-bold text-indigo-600 hover:underline"
                            >
                              {parceiro?.name || 'S/ Nome'}
                            </button>
                          </div>
                        </div>
                        {casal.historico && casal.historico.length > 0 && (
                          <div className="bg-emerald-100 px-3 py-1 rounded-lg">
                            <div className="text-xs font-bold text-emerald-700">
                              {casal.historico.length} filhote{casal.historico.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
