import { useState, useRef } from 'react';
import type { ModalType, Ave, Casal, Config } from '../App';

interface ColorLists {
  coresCabeca: string[];
  coresPeito: string[];
  coresDorso: string[];
}

interface ModalProps {
  type: ModalType;
  editId: string | null;
  aves: Ave[];
  casais: Casal[];
  colorLists: ColorLists;
  config: Config;
  onClose: () => void;
  onSaveAve: (data: Partial<Ave>, editId: string | null) => void;
  onSaveCasal: (data: Omit<Casal, 'id'>) => string;
  onSaveNinho: (data: { name: string; casalId: string }) => void;
  onUpdateNinhoCasal?: (ninhoId: string, casalId: string) => void;
  onSaveConfig: (config: Config) => void;
}

export function Modal({ type, editId, aves, casais, colorLists, config, onClose, onSaveAve, onSaveCasal, onSaveNinho, onUpdateNinhoCasal, onSaveConfig }: ModalProps) {
  const currentYear = new Date().getFullYear();
  const ave = editId && type === 'ave' ? aves.find(a => a.id === editId) : null;
  const [photoData, setPhotoData] = useState(ave?.photo || '');
  const [selectedMacho, setSelectedMacho] = useState<string>('');
  const [selectedFemea, setSelectedFemea] = useState<string>('');
  const [showMachoList, setShowMachoList] = useState(false);
  const [showFemeaList, setShowFemeaList] = useState(false);

  // Estados para criar nova ave no modal de casal
  const [criandoMacho, setCriandoMacho] = useState(false);
  const [criandoFemea, setCriandoFemea] = useState(false);
  const [novoMachoData, setNovoMachoData] = useState({
    species: 'Diamante de Gould',
    ring: '',
    ringYear: currentYear,
    name: ''
  });
  const [novaFemeaData, setNovaFemeaData] = useState({
    species: 'Diamante de Gould',
    ring: '',
    ringYear: currentYear,
    name: ''
  });
  
  // Estados para criar casal ao criar ninho
  const [criandoCasalNoNinho, setCriandoCasalNoNinho] = useState(false);
  const [novoCasalMacho, setNovoCasalMacho] = useState('');
  const [novoCasalFemea, setNovoCasalFemea] = useState('');
  const [novoCasalGaiola, setNovoCasalGaiola] = useState('');
  const [casalCriado, setCasalCriado] = useState<string | null>(null);
  
  // Estados para criar nova espécie
  const [criarEspecieModal, setCriarEspecieModal] = useState(false);
  const [especieInput, setEspecieInput] = useState(ave?.species || 'Diamante de Gould');
  const [novaEspecieData, setNovaEspecieData] = useState({
    nome: '',
    diasFertilidade: 7,
    duracaoChoca: 14,
    diasAnilhamento: 7,
    diasSaidaNinho: 21
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoData(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAveSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      species: formData.get('species') as string,
      ring: formData.get('ring') as string,
      ringYear: Number(formData.get('ringYear')),
      name: formData.get('name') as string,
      sex: formData.get('sex') as 'Macho' | 'Fêmea' | 'Indefinido',
      status: formData.get('status') as 'Ativo' | 'Vendido' | 'Óbito',
      creator: formData.get('creator') as string,
      acqYear: Number(formData.get('acqYear')),
      photo: photoData,
      corCabeca: formData.get('corCabeca') as string,
      corPeito: formData.get('corPeito') as string,
      corDorso: formData.get('corDorso') as string,
    };
    onSaveAve(data, editId);
    onClose();
  };

  const handleNinhoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    let casalId = formData.get('casalId') as string;
    
    if (criandoCasalNoNinho) {
      const machoAve = aves.find(a => a.name === novoCasalMacho || a.id === novoCasalMacho);
      const femeaAve = aves.find(a => a.name === novoCasalFemea || a.id === novoCasalFemea);
      
      if (!machoAve || !femeaAve) {
        alert('Por favor, selecione um macho e uma fêmea');
        return;
      }
      
      // Removida validação obrigatória da gaiola
      
      const novoCasalId = onSaveCasal({
        mId: machoAve.id,
        fId: femeaAve.id,
        cage: novoCasalGaiola || 'S/ Gaiola',
      });
      casalId = novoCasalId;
    }
    
    onSaveNinho({
      name,
      casalId: casalId,
    });
    onClose();
  };

  const handleCasalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const machoAve = aves.find(a => a.name === selectedMacho || a.id === selectedMacho);
    const femeaAve = aves.find(a => a.name === selectedFemea || a.id === selectedFemea);
    
    if (!machoAve || !femeaAve) {
      alert('Por favor, selecione um macho e uma fêmea');
      return;
    }
    
    onSaveCasal({
      mId: machoAve.id,
      fId: femeaAve.id,
      cage: formData.get('cage') as string,
    });
    onClose();
  };

  const machos = aves.filter(a => a.sex === 'Macho' && a.status === 'Ativo');
  const femeas = aves.filter(a => a.sex === 'Fêmea' && a.status === 'Ativo');

  // Filtra aves que ainda não estão em casais ativos
  const avesEmCasais = new Set([
    ...casais.map(c => c.mId),
    ...casais.map(c => c.fId)
  ]);
  
  const machosDisponiveis = machos.filter(m => !avesEmCasais.has(m.id));
  const femeasDisponiveis = femeas.filter(f => !avesEmCasais.has(f.id));

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-y-auto max-h-[90vh] no-scrollbar">
        {type === 'ave' && (
          <>
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-10">
              <h2 className="font-black text-lg uppercase italic">
                {editId ? 'Editar' : 'Nova'} Ave
              </h2>
              <button onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAveSubmit} className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  {photoData ? (
                    <img src={photoData} className="w-24 h-24 rounded-3xl bg-slate-100 object-cover" alt="Preview" />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <i className="fas fa-camera text-xl"></i>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Espécie</label>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      name="species"
                      value={especieInput}
                      onChange={(e) => {
                        if (e.target.value === '__nova__') {
                          setCriarEspecieModal(true);
                          setNovaEspecieData({
                            nome: '',
                            diasFertilidade: 7,
                            duracaoChoca: 14,
                            diasAnilhamento: 7,
                            diasSaidaNinho: 21
                          });
                        } else {
                          setEspecieInput(e.target.value);
                        }
                      }}
                      className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm"
                      required
                    >
                      <option value="">Selecione uma espécie</option>
                      {(config.especies || []).map(esp => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                      <option value="__nova__" className="font-bold text-emerald-600">+ Criar Nova Espécie</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Anilha</label>
                  <input
                    name="ring"
                    defaultValue={ave?.ring || ''}
                    placeholder="Ex: ABC-123"
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Ano Anilha</label>
                  <input
                    type="number"
                    name="ringYear"
                    defaultValue={ave?.ringYear || currentYear}
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Nome / Identificador</label>
                  <input
                    name="name"
                    defaultValue={ave?.name || ''}
                    placeholder="Nome para fácil identificação"
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Sexo</label>
                  <select
                    name="sex"
                    defaultValue={ave?.sex || 'Macho'}
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  >
                    <option>Macho</option>
                    <option>Fêmea</option>
                    <option>Indefinido</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Status</label>
                  <select
                    name="status"
                    defaultValue={ave?.status || 'Ativo'}
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Óbito">Óbito</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Criador Origem</label>
                  <input
                    name="creator"
                    defaultValue={ave?.creator || 'Próprio'}
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Ano Aquisição</label>
                  <input
                    type="number"
                    name="acqYear"
                    defaultValue={ave?.acqYear || currentYear}
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Cor da Cabeça</label>
                  <input
                    name="corCabeca"
                    list="dl-cor-cabeca"
                    defaultValue={ave?.corCabeca || ''}
                    placeholder="Ex: Preto, Laranja, Vermelho..."
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                  <datalist id="dl-cor-cabeca">
                    {colorLists.coresCabeca.map(color => (
                      <option key={color} value={color} />
                    ))}
                  </datalist>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Cor do Peito</label>
                  <input
                    name="corPeito"
                    list="dl-cor-peito"
                    defaultValue={ave?.corPeito || ''}
                    placeholder="Ex: Roxo, Lilás, Branco..."
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                  <datalist id="dl-cor-peito">
                    {colorLists.coresPeito.map(color => (
                      <option key={color} value={color} />
                    ))}
                  </datalist>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Cor do Dorso</label>
                  <input
                    name="corDorso"
                    list="dl-cor-dorso"
                    defaultValue={ave?.corDorso || ''}
                    placeholder="Ex: Verde, Azul, Amarelo..."
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                  <datalist id="dl-cor-dorso">
                    {colorLists.coresDorso.map(color => (
                      <option key={color} value={color} />
                    ))}
                  </datalist>
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl">
                Salvar Cadastro
              </button>
            </form>
          </>
        )}

        {type === 'ninho' && (
          <>
            <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
              <h2 className="font-black text-lg uppercase italic">Novo Ninho</h2>
              <button onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleNinhoSubmit} className="p-6 space-y-4">
              <input
                name="name"
                placeholder="ID Ninho (opcional)"
                className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm"
              />
              
              <select
                name="casalId"
                className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm"
              >
                <option value="">Sem Casal Associado</option>
                {casais.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.cage || 'Gaiola s/ nº'}
                  </option>
                ))}
              </select>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setCriandoCasalNoNinho(!criandoCasalNoNinho)}
                  className="flex-1 bg-slate-200 text-slate-700 py-4 rounded-2xl font-black uppercase text-xs"
                >
                  {criandoCasalNoNinho ? 'Cancelar' : 'Criar Novo Casal'}
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs"
                >
                  Criar
                </button>
              </div>
              
              {criandoCasalNoNinho && (
                <div className="mt-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Selecionar Macho</label>
                    <div className="border-2 border-slate-100 rounded-xl max-h-60 overflow-y-auto">
                      {machosDisponiveis.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                          Nenhum macho disponível
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {machosDisponiveis.map(m => (
                            <div
                              key={m.id}
                              onClick={() => setNovoCasalMacho(m.id)}
                              className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                                novoCasalMacho === m.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                              }`}
                            >
                              {m.photo ? (
                                <img src={m.photo} className="w-12 h-12 rounded-lg object-cover" alt={m.name} />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                                  <i className="fas fa-dove text-slate-400"></i>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate">{m.name || 'S/ Nome'}</div>
                                <div className="text-xs text-slate-500">
                                  {m.ring || 'S/A'} • {m.ringYear || '--'}
                                </div>
                              </div>
                              {novoCasalMacho === m.id && (
                                <i className="fas fa-check-circle text-indigo-600"></i>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Selecionar Fêmea</label>
                    <div className="border-2 border-slate-100 rounded-xl max-h-60 overflow-y-auto">
                      {femeasDisponiveis.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                          Nenhuma fêmea disponível
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {femeasDisponiveis.map(f => (
                            <div
                              key={f.id}
                              onClick={() => setNovoCasalFemea(f.id)}
                              className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                                novoCasalFemea === f.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                              }`}
                            >
                              {f.photo ? (
                                <img src={f.photo} className="w-12 h-12 rounded-lg object-cover" alt={f.name} />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                                  <i className="fas fa-dove text-slate-400"></i>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate">{f.name || 'S/ Nome'}</div>
                                <div className="text-xs text-slate-500">
                                  {f.ring || 'S/A'} • {f.ringYear || '--'}
                                </div>
                              </div>
                              {novoCasalFemea === f.id && (
                                <i className="fas fa-check-circle text-indigo-600"></i>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Número da Gaiola</label>
                    <input
                      value={novoCasalGaiola}
                      onChange={(e) => setNovoCasalGaiola(e.target.value)}
                      placeholder="Ex: Gaiola 01"
                      className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm"
                    />
                  </div>
                </div>
              )}
            </form>
          </>
        )}

        {type === 'casal' && (
          <>
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h2 className="font-black text-lg uppercase italic">Unir Par</h2>
              <button onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleCasalSubmit} className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Selecionar Macho</label>
                  <button
                    type="button"
                    onClick={() => setCriandoMacho(!criandoMacho)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg font-black text-[9px] uppercase hover:bg-blue-700 transition-all"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    {criandoMacho ? 'Cancelar' : 'Criar Novo'}
                  </button>
                </div>

                {criandoMacho ? (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-blue-600 uppercase block mb-1">Espécie *</label>
                        <select
                          value={novoMachoData.species}
                          onChange={(e) => setNovoMachoData({ ...novoMachoData, species: e.target.value })}
                          className="w-full border-2 border-blue-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-blue-500"
                        >
                          {config.especies.map(esp => (
                            <option key={esp} value={esp}>{esp}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-blue-600 uppercase block mb-1">Nome</label>
                        <input
                          type="text"
                          value={novoMachoData.name}
                          onChange={(e) => setNovoMachoData({ ...novoMachoData, name: e.target.value })}
                          placeholder="Opcional"
                          className="w-full border-2 border-blue-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-blue-600 uppercase block mb-1">Anilha *</label>
                        <input
                          type="text"
                          value={novoMachoData.ring}
                          onChange={(e) => setNovoMachoData({ ...novoMachoData, ring: e.target.value })}
                          placeholder="Ex: ABC-001"
                          className="w-full border-2 border-blue-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-blue-600 uppercase block mb-1">Ano Anilha *</label>
                        <input
                          type="number"
                          value={novoMachoData.ringYear}
                          onChange={(e) => setNovoMachoData({ ...novoMachoData, ringYear: Number(e.target.value) })}
                          className="w-full border-2 border-blue-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!novoMachoData.ring.trim()) {
                          alert('Por favor, informe a anilha do macho');
                          return;
                        }
                        onSaveAve({
                          ...novoMachoData,
                          sex: 'Macho',
                          status: 'Ativo',
                          creator: 'Criação Própria',
                          acqYear: novoMachoData.ringYear
                        }, null);
                        // Aguardar um momento para a ave ser salva e atualizar a lista
                        setTimeout(() => {
                          const novaAve = aves.find(a => a.ring === novoMachoData.ring && a.ringYear === novoMachoData.ringYear);
                          if (novaAve) setSelectedMacho(novaAve.id);
                          setCriandoMacho(false);
                          setNovoMachoData({ species: 'Diamante de Gould', ring: '', ringYear: currentYear, name: '' });
                        }, 100);
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-black text-xs uppercase hover:bg-blue-700 transition-all"
                    >
                      Criar e Selecionar Macho
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-slate-100 rounded-xl max-h-60 overflow-y-auto">
                  {machosDisponiveis.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm">
                      Nenhum macho disponível
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {machosDisponiveis.map(m => (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMacho(m.id)}
                          className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                            selectedMacho === m.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                          }`}
                        >
                          {m.photo ? (
                            <img src={m.photo} className="w-12 h-12 rounded-lg object-cover" alt={m.name} />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                              <i className="fas fa-dove text-slate-400"></i>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{m.name || 'S/ Nome'}</div>
                            <div className="text-xs text-slate-500">
                              {m.ring || 'S/A'} • {m.ringYear || '--'}
                            </div>
                          </div>
                          {selectedMacho === m.id && (
                            <i className="fas fa-check-circle text-indigo-600"></i>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Selecionar Fêmea</label>
                  <button
                    type="button"
                    onClick={() => setCriandoFemea(!criandoFemea)}
                    className="bg-pink-600 text-white px-3 py-1 rounded-lg font-black text-[9px] uppercase hover:bg-pink-700 transition-all"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    {criandoFemea ? 'Cancelar' : 'Criar Nova'}
                  </button>
                </div>

                {criandoFemea ? (
                  <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-pink-600 uppercase block mb-1">Espécie *</label>
                        <select
                          value={novaFemeaData.species}
                          onChange={(e) => setNovaFemeaData({ ...novaFemeaData, species: e.target.value })}
                          className="w-full border-2 border-pink-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-pink-500"
                        >
                          {config.especies.map(esp => (
                            <option key={esp} value={esp}>{esp}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-pink-600 uppercase block mb-1">Nome</label>
                        <input
                          type="text"
                          value={novaFemeaData.name}
                          onChange={(e) => setNovaFemeaData({ ...novaFemeaData, name: e.target.value })}
                          placeholder="Opcional"
                          className="w-full border-2 border-pink-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-pink-600 uppercase block mb-1">Anilha *</label>
                        <input
                          type="text"
                          value={novaFemeaData.ring}
                          onChange={(e) => setNovaFemeaData({ ...novaFemeaData, ring: e.target.value })}
                          placeholder="Ex: ABC-002"
                          className="w-full border-2 border-pink-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-pink-600 uppercase block mb-1">Ano Anilha *</label>
                        <input
                          type="number"
                          value={novaFemeaData.ringYear}
                          onChange={(e) => setNovaFemeaData({ ...novaFemeaData, ringYear: Number(e.target.value) })}
                          className="w-full border-2 border-pink-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!novaFemeaData.ring.trim()) {
                          alert('Por favor, informe a anilha da fêmea');
                          return;
                        }
                        onSaveAve({
                          ...novaFemeaData,
                          sex: 'Fêmea',
                          status: 'Ativo',
                          creator: 'Criação Própria',
                          acqYear: novaFemeaData.ringYear
                        }, null);
                        // Aguardar um momento para a ave ser salva e atualizar a lista
                        setTimeout(() => {
                          const novaAve = aves.find(a => a.ring === novaFemeaData.ring && a.ringYear === novaFemeaData.ringYear);
                          if (novaAve) setSelectedFemea(novaAve.id);
                          setCriandoFemea(false);
                          setNovaFemeaData({ species: 'Diamante de Gould', ring: '', ringYear: currentYear, name: '' });
                        }, 100);
                      }}
                      className="w-full bg-pink-600 text-white py-2 rounded-lg font-black text-xs uppercase hover:bg-pink-700 transition-all"
                    >
                      Criar e Selecionar Fêmea
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-slate-100 rounded-xl max-h-60 overflow-y-auto">
                  {femeasDisponiveis.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm">
                      Nenhuma fêmea disponível
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {femeasDisponiveis.map(f => (
                        <div
                          key={f.id}
                          onClick={() => setSelectedFemea(f.id)}
                          className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                            selectedFemea === f.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                          }`}
                        >
                          {f.photo ? (
                            <img src={f.photo} className="w-12 h-12 rounded-lg object-cover" alt={f.name} />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                              <i className="fas fa-dove text-slate-400"></i>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{f.name || 'S/ Nome'}</div>
                            <div className="text-xs text-slate-500">
                              {f.ring || 'S/A'} • {f.ringYear || '--'}
                            </div>
                          </div>
                          {selectedFemea === f.id && (
                            <i className="fas fa-check-circle text-indigo-600"></i>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Número da Gaiola</label>
                <input
                  name="cage"
                  placeholder="Ex: Gaiola 01"
                  className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-200 text-slate-700 py-4 rounded-2xl font-black uppercase text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs"
                >
                  Formar Casal
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      
      {/* Modal de Criar Nova Espécie */}
      {criarEspecieModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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
                  Estes parâmetros serão usados para calcular automaticamente as datas de fertilidade, eclosão, anilhamento e saída do ninho.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setCriarEspecieModal(false);
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
                  setEspecieInput(novaEspecieData.nome);
                  setCriarEspecieModal(false);
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
    </div>
  );
}