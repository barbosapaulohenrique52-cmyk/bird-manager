import { useState, useRef, useEffect } from 'react';
import type { Casal, Ave } from '../App';

interface CasalSelectorProps {
  casais: Casal[];
  aves: Ave[];
  value: string;
  onChange: (casalId: string) => void;
  placeholder?: string;
  className?: string;
  allowEmpty?: boolean;
  onCreateNew?: () => void;
  excludeCasalId?: string; // ID do casal a ser excluído da lista
}

export function CasalSelector({
  casais,
  aves,
  value,
  onChange,
  placeholder = "Selecione o casal...",
  className = "",
  allowEmpty = true,
  onCreateNew,
  excludeCasalId
}: CasalSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar casais excluindo o ID especificado
  const casaisFiltrados = excludeCasalId 
    ? casais.filter(c => c.id !== excludeCasalId)
    : casais;

  const selectedCasal = casais.find(c => c.id === value);
  const selectedMacho = selectedCasal ? aves.find(a => a.id === selectedCasal.mId) : null;
  const selectedFemea = selectedCasal ? aves.find(a => a.id === selectedCasal.fId) : null;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (casalId: string) => {
    onChange(casalId);
    setIsOpen(false);
  };

  const renderAveInfo = (ave: Ave | null | undefined, tipo: 'macho' | 'femea') => {
    if (!ave) {
      return (
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <i className={`fas fa-${tipo === 'macho' ? 'mars' : 'venus'} text-slate-400 text-xs`}></i>
          </div>
          <div className="text-[9px] text-slate-400">
            {tipo === 'macho' ? 'Macho não encontrado' : 'Fêmea não encontrada'}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 flex-1">
        {ave.photo ? (
          <img 
            src={ave.photo} 
            alt={ave.name || ave.ring}
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            tipo === 'macho' ? 'bg-blue-100' : 'bg-pink-100'
          }`}>
            <i className={`fas fa-${tipo === 'macho' ? 'mars' : 'venus'} ${
              tipo === 'macho' ? 'text-blue-600' : 'text-pink-600'
            } text-xs`}></i>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-700">
            {ave.ring || 'S/ anilha'}
          </span>
          <span className="text-[8px] text-slate-500">
            {ave.ringYear || '--'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Botão Principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border-2 rounded-xl p-3 text-left transition-all outline-none flex items-center justify-between ${
          selectedCasal ? 'border-slate-200 hover:border-emerald-500' : 'border-amber-400 hover:border-amber-500 shadow-md animate-pulse'
        }`}
      >
        {selectedCasal && selectedMacho && selectedFemea ? (
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 flex-1">
              {renderAveInfo(selectedMacho, 'macho')}
              <span className="text-slate-300">+</span>
              {renderAveInfo(selectedFemea, 'femea')}
            </div>
            <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              Gaiola {selectedCasal.cage}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <i className="fas fa-plus-circle text-amber-500 animate-pulse"></i>
            <span className="text-sm text-amber-600 font-bold">{placeholder || 'Clique para adicionar casal'}</span>
          </div>
        )}
        <i className={`fas fa-chevron-down text-slate-400 text-xs ml-2 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`}></i>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {allowEmpty && (
            <button
              type="button"
              onClick={() => handleSelect('')}
              className="w-full p-3 text-left hover:bg-slate-50 transition-all border-b border-slate-100"
            >
              <span className="text-sm text-slate-500 font-medium italic">Sem casal associado</span>
            </button>
          )}

          {casaisFiltrados.map((casal) => {
            const macho = aves.find(a => a.id === casal.mId);
            const femea = aves.find(a => a.id === casal.fId);

            return (
              <button
                key={casal.id}
                type="button"
                onClick={() => handleSelect(casal.id)}
                className={`w-full p-3 text-left hover:bg-emerald-50 transition-all border-b border-slate-100 ${
                  value === casal.id ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    {renderAveInfo(macho, 'macho')}
                    <span className="text-slate-300 font-bold">+</span>
                    {renderAveInfo(femea, 'femea')}
                  </div>
                  <div className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                    Gaiola {casal.cage}
                  </div>
                </div>
              </button>
            );
          })}

          {onCreateNew && (
            <button
              type="button"
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 transition-all font-bold text-emerald-600 text-sm border-t-2 border-slate-200"
            >
              <i className="fas fa-plus mr-2"></i>
              Criar Novo Casal
            </button>
          )}

          {casaisFiltrados.length === 0 && !onCreateNew && (
            <div className="p-6 text-center text-slate-400">
              <i className="fas fa-heart-broken text-2xl mb-2"></i>
              <p className="text-xs">Nenhum casal cadastrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}