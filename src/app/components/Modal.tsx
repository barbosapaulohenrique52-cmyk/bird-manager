import { useState, useRef } from 'react';
import { CasalSelector } from './CasalSelector';
import { AveSelector } from './AveSelector';
import type { ModalType, Ave, Casal, Config, CorAve } from '../App';

interface ColorLists {
  coresCabeca: string[];
  coresPeito: string[];
  coresDorso: string[];
}

function corParaHex(cor: string | undefined, padrao: string) {
  const valor = (cor || '').trim();

  // Quando a cor já está cadastrada como hexadecimal, utiliza diretamente o valor.
  if (/^#[0-9a-fA-F]{6}$/.test(valor)) {
    return valor;
  }

  const texto = valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cores: Record<string, string> = {
    preto: '#202124',
    negro: '#202124',
    vermelho: '#e85d5d',
    laranja: '#f28c28',
    amarelo: '#f5cf55',
    branco: '#f5f5f5',
    azul: '#5b8def',
    verde: '#69b879',
    roxo: '#9b7bd8',
    lilas: '#b9a1e8',
    cinza: '#9ca3af',
    marrom: '#9a6b45',
    rosa: '#e98bb5',
  };
  const encontrada = Object.keys(cores).find(nome => texto.includes(nome));
  return encontrada ? cores[encontrada] : padrao;
}

function obterHexDaCor(
  nome: string | undefined,
  cores: CorAve[] | undefined,
  padrao: string
) {
  if (!nome) return padrao;

  const encontrada = (cores || []).find(
    cor => cor.nome.trim().toLowerCase() === nome.trim().toLowerCase()
  );

  return encontrada?.hex || corParaHex(nome, padrao);
}

function PassaroPDC({ cabeca, peito, dorso }: { cabeca?: string; peito?: string; dorso?: string }) {
  const corCabeca = corParaHex(cabeca, '#f1f3f5');
  const corPeito = corParaHex(peito, '#f1f3f5');
  const corDorso = corParaHex(dorso, '#f1f3f5');

  return (
    <svg viewBox="0 0 240 190" className="w-full h-auto max-w-[220px]" role="img" aria-label="Representação visual das cores da ave">
      <g stroke="#263238" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        {/* Cabeça */}
        <path fill={corCabeca} d="M45 62 C43 31 68 12 99 19 C121 24 132 43 126 66 C119 88 94 98 70 91 C55 87 47 77 45 62 Z" />
        {/* Bico */}
        <path fill="#f4e6d2" d="M45 49 L18 61 L46 72 L58 62 Z" />
        {/* Dorso e asa */}
        <path fill={corDorso} d="M112 31 C145 36 170 61 190 91 L214 132 C195 139 171 132 149 119 C130 108 112 92 104 72 C99 57 103 42 112 31 Z" />
        {/* Peito */}
        <path fill={corPeito} d="M68 87 C82 94 99 91 108 78 C116 96 130 116 151 129 C134 151 106 157 80 144 C59 133 50 110 52 91 C57 91 63 90 68 87 Z" />
        {/* Barriga */}
        <path fill="#f7f7f7" d="M80 144 C106 157 134 151 151 129 L174 151 C146 172 108 177 79 160 Z" />
        {/* Asa clara */}
        <path fill="#ffffff" d="M143 112 C165 121 187 132 205 140 L188 157 C169 148 151 137 136 125 Z" />
        {/* Cauda */}
        <path fill="#ffffff" d="M188 157 L221 181 L207 139 Z" />
        {/* Pata */}
        <path fill="#e7c7b2" d="M91 158 L88 174 M88 174 L77 181 M88 174 L91 182 M88 174 L101 179" fillOpacity="1" />
        <path fill="#e7c7b2" d="M132 151 L130 169 M130 169 L119 177 M130 169 L134 178 M130 169 L143 174" fillOpacity="1" />
        {/* Olho */}
        <circle cx="87" cy="48" r="5" fill="#111827" />
      </g>
    </svg>
  );
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
  const [corCabecaVisual, setCorCabecaVisual] = useState(ave?.corCabeca || '');
  const [corPeitoVisual, setCorPeitoVisual] = useState(ave?.corPeito || '');
  const [corDorsoVisual, setCorDorsoVisual] = useState(ave?.corDorso || '');

  const [novaCorRegiao, setNovaCorRegiao] = useState<'cabeca' | 'peito' | 'dorso' | null>(null);
  const [novoNomeCor, setNovoNomeCor] = useState('');
  const [novoHexCor, setNovoHexCor] = useState('#4CAF50');

  const abrirCadastroCor = (regiao: 'cabeca' | 'peito' | 'dorso') => {
    setNovaCorRegiao(regiao);
    setNovoNomeCor('');
    setNovoHexCor('#4CAF50');
  };

  const salvarNovaCor = () => {
    if (!novaCorRegiao || !novoNomeCor.trim()) {
      alert('Informe o nome da cor.');
      return;
    }

    const campo = novaCorRegiao === 'cabeca'
      ? 'coresCabeca'
      : novaCorRegiao === 'peito'
        ? 'coresPeito'
        : 'coresDorso';

    const listaAtual = config[campo] || [];
    const nomeNormalizado = novoNomeCor.trim().toLowerCase();

    if (listaAtual.some(cor => cor.nome.trim().toLowerCase() === nomeNormalizado)) {
      alert('Já existe uma cor com esse nome nessa região.');
      return;
    }

    const novaCor: CorAve = {
      id: `${campo}-${Date.now()}`,
      nome: novoNomeCor.trim(),
      hex: novoHexCor.toUpperCase(),
    };

    onSaveConfig({
      ...config,
      [campo]: [...listaAtual, novaCor],
    });

    if (novaCorRegiao === 'cabeca') setCorCabecaVisual(novaCor.nome);
    if (novaCorRegiao === 'peito') setCorPeitoVisual(novaCor.nome);
    if (novaCorRegiao === 'dorso') setCorDorsoVisual(novaCor.nome);

    setNovaCorRegiao(null);
    setNovoNomeCor('');
  };

  // As cores do diagrama são obtidas diretamente do hexadecimal cadastrado
  // para cada região. Caso a ave tenha uma cor antiga salva apenas por nome,
  // mantém-se a compatibilidade com a conversão anterior.
  const hexCabecaVisual = obterHexDaCor(
    corCabecaVisual,
    config.coresCabeca,
    '#f1f3f5'
  );

  const hexPeitoVisual = obterHexDaCor(
    corPeitoVisual,
    config.coresPeito,
    '#f1f3f5'
  );

  const hexDorsoVisual = obterHexDaCor(
    corDorsoVisual,
    config.coresDorso,
    '#f1f3f5'
  );

  const nomesCoresCabeca = (config.coresCabeca || []).map(cor => cor.nome);
  const nomesCoresPeito = (config.coresPeito || []).map(cor => cor.nome);
  const nomesCoresDorso = (config.coresDorso || []).map(cor => cor.nome);

  // Nome da ave:
  // - por padrão é ANILHA-ANO;
  // - continua editável pelo usuário;
  // - depois que o usuário digita um nome próprio, o sistema não
  //   sobrescreve mais esse nome automaticamente.
  const [nomeAve, setNomeAve] = useState(
    ave?.name ||
    (ave?.ring
      ? `${ave.ring}-${ave.ringYear || currentYear}`
      : '')
  );
  const [nomeAveManual, setNomeAveManual] = useState(
    !!ave?.name &&
    !/^Filhote\s+/i.test(ave.name) &&
    (!ave.ring || ave.name !== `${ave.ring}-${ave.ringYear || currentYear}`)
  );

  const atualizarNomeAutomatico = (
    anilha: string,
    ano: string
  ) => {
    if (!nomeAveManual) {
      const anilhaLimpa = anilha.trim();

      if (anilhaLimpa) {
        setNomeAve(`${anilhaLimpa}-${ano || currentYear}`);
      } else {
        setNomeAve('');
      }
    }
  };

  const [selectedMacho, setSelectedMacho] = useState<string>('');
  const [selectedFemea, setSelectedFemea] = useState<string>('');
  const [selectedPai, setSelectedPai] = useState<string>(ave?.parentMaleId || '');
  const [selectedMae, setSelectedMae] = useState<string>(ave?.parentFemaleId || '');
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
  const [selectedCasalNinho, setSelectedCasalNinho] = useState('');
  
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
      name: nomeAve.trim() || `${(formData.get('ring') as string || '').trim()}-${formData.get('ringYear') || currentYear}`,
      sex: formData.get('sex') as 'Macho' | 'Fêmea' | 'Indefinido',
      status: formData.get('status') as 'Ativo' | 'Vendido' | 'Óbito',
      creator: formData.get('creator') as string,
      acqYear: Number(formData.get('acqYear')),
      photo: photoData,
      corCabeca: formData.get('corCabeca') as string,
      corPeito: formData.get('corPeito') as string,
      corDorso: formData.get('corDorso') as string,
      nota: formData.get('nota') as string,
      porta: formData.get('porta') as string,
      parentMaleId: selectedPai || undefined,
      parentFemaleId: selectedMae || undefined,
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
                    onChange={(e) => {
                      const ano = (
                        e.currentTarget.form?.elements.namedItem('ringYear') as HTMLInputElement
                      )?.value || String(currentYear);

                      atualizarNomeAutomatico(
                        e.target.value,
                        ano
                      );
                    }}
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Ano Anilha</label>
                  <input
                    type="number"
                    name="ringYear"
                    defaultValue={ave?.ringYear || currentYear}
                    onChange={(e) => {
                      const anilha = (
                        e.currentTarget.form?.elements.namedItem('ring') as HTMLInputElement
                      )?.value || '';

                      atualizarNomeAutomatico(
                        anilha,
                        e.target.value
                      );
                    }}
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Nome / Identificador</label>
                  <input
                    name="name"
                    value={nomeAve}
                    onChange={(e) => {
                      setNomeAveManual(true);
                      setNomeAve(e.target.value);
                    }}
                    placeholder="Será gerado automaticamente: anilha-ano"
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">
                    Padrão: <strong>anilha-ano</strong>. Você pode substituir por um nome próprio.
                  </p>
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
                    <option value="No Ninho">No Ninho</option>
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

                <div className="col-span-2 border-t-2 border-slate-100 pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">PDC · Representação visual</label>
                    <span className="text-[9px] text-slate-400">Cabeça · Peito · Dorso</span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2 flex justify-center">
                    <PassaroPDC
                      cabeca={hexCabecaVisual}
                      peito={hexPeitoVisual}
                      dorso={hexDorsoVisual}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">A imagem é apenas uma representação visual; os campos de cores abaixo foram mantidos.</p>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Cor da Cabeça</label>
                    <button type="button" onClick={() => abrirCadastroCor('cabeca')} className="text-[10px] font-black text-emerald-600 uppercase hover:text-emerald-800">
                      <i className="fas fa-plus mr-1"></i> Nova cor
                    </button>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <select name="corCabeca" value={corCabecaVisual} onChange={(e) => setCorCabecaVisual(e.target.value)} className="border-2 border-slate-100 p-3 rounded-xl flex-1 font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm">
                      <option value="">Sem cor definida</option>
                      {(config.coresCabeca || []).map(cor => <option key={cor.id} value={cor.nome}>{cor.nome} — {cor.hex}</option>)}
                    </select>
                    <div className="w-12 rounded-xl border-2 border-slate-100" style={{ backgroundColor: hexCabecaVisual }}></div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Cor do Peito</label>
                    <button type="button" onClick={() => abrirCadastroCor('peito')} className="text-[10px] font-black text-emerald-600 uppercase hover:text-emerald-800">
                      <i className="fas fa-plus mr-1"></i> Nova cor
                    </button>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <select name="corPeito" value={corPeitoVisual} onChange={(e) => setCorPeitoVisual(e.target.value)} className="border-2 border-slate-100 p-3 rounded-xl flex-1 font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm">
                      <option value="">Sem cor definida</option>
                      {(config.coresPeito || []).map(cor => <option key={cor.id} value={cor.nome}>{cor.nome} — {cor.hex}</option>)}
                    </select>
                    <div className="w-12 rounded-xl border-2 border-slate-100" style={{ backgroundColor: hexPeitoVisual }}></div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Cor do Dorso</label>
                    <button type="button" onClick={() => abrirCadastroCor('dorso')} className="text-[10px] font-black text-emerald-600 uppercase hover:text-emerald-800">
                      <i className="fas fa-plus mr-1"></i> Nova cor
                    </button>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <select name="corDorso" value={corDorsoVisual} onChange={(e) => setCorDorsoVisual(e.target.value)} className="border-2 border-slate-100 p-3 rounded-xl flex-1 font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm">
                      <option value="">Sem cor definida</option>
                      {(config.coresDorso || []).map(cor => <option key={cor.id} value={cor.nome}>{cor.nome} — {cor.hex}</option>)}
                    </select>
                    <div className="w-12 rounded-xl border-2 border-slate-100" style={{ backgroundColor: hexDorsoVisual }}></div>
                  </div>
                </div>

                {novaCorRegiao && (
                  <div className="col-span-2 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-emerald-700 uppercase">Cadastrar nova cor — {novaCorRegiao === 'cabeca' ? 'Cabeça' : novaCorRegiao === 'peito' ? 'Peito' : 'Dorso'}</span>
                      <button type="button" onClick={() => setNovaCorRegiao(null)} className="text-slate-400 hover:text-slate-700"><i className="fas fa-times"></i></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_120px] gap-2 items-end">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase">Nome da cor</label>
                        <input value={novoNomeCor} onChange={(e) => setNovoNomeCor(e.target.value)} placeholder="Ex: Azul royal" className="border-2 border-white p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 bg-white text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase">Seletor</label>
                        <input type="color" value={novoHexCor} onChange={(e) => setNovoHexCor(e.target.value)} className="block h-[46px] w-14 rounded-xl border-2 border-white bg-white p-1 mt-1 cursor-pointer" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase">Hexadecimal</label>
                        <input value={novoHexCor} onChange={(e) => setNovoHexCor(e.target.value)} className="border-2 border-white p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 bg-white text-sm mt-1 uppercase" />
                      </div>
                    </div>
                    <button type="button" onClick={salvarNovaCor} className="mt-3 bg-emerald-600 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-700">
                      <i className="fas fa-check mr-2"></i> Salvar cor e selecionar
                    </button>
                  </div>
                )}

                {/* Filiação */}
                <div className="col-span-2 border-t-2 border-slate-100 pt-5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <i className="fas fa-sitemap text-indigo-500"></i> Filiação
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Pai</label>
                      <AveSelector
                        aves={aves.filter(a => a.id !== ave?.id && (a.sex === 'Macho' || a.id === selectedPai))}
                        value={selectedPai}
                        onChange={setSelectedPai}
                        placeholder="Selecione o pai..."
                        tipo="macho"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Mãe</label>
                      <AveSelector
                        aves={aves.filter(a => a.id !== ave?.id && (a.sex === 'Fêmea' || a.id === selectedMae))}
                        value={selectedMae}
                        onChange={setSelectedMae}
                        placeholder="Selecione a mãe..."
                        tipo="femea"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Nota</label>
                  <textarea
                    name="nota"
                    defaultValue={ave?.nota || ''}
                    placeholder="Observações sobre a ave..."
                    rows={3}
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Porta</label>
                  <input
                    name="porta"
                    defaultValue={ave?.porta || ''}
                    placeholder="Ex: Porta azul"
                    className="border-2 border-slate-100 p-3 rounded-xl w-full font-bold outline-none focus:border-emerald-500 transition-all bg-white text-sm mt-1"
                  />
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
              
              <div>
  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">
    Selecionar Casal
  </label>

  <CasalSelector
  casais={casais}
  aves={aves}
  value={selectedCasalNinho}
  onChange={(casalId) => setSelectedCasalNinho(casalId)}
  placeholder="Selecione o casal"
/>

<input
  type="hidden"
  name="casalId"
  value={selectedCasalNinho}
/>
              </div>
              
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
