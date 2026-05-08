import { useState, useRef, useEffect } from 'react';
import type { Ave } from '../App';

interface AveSelectorProps {
  aves: Ave[];
  value: string;
  onChange: (aveId: string) => void;
  placeholder?: string;
  tipo: 'macho' | 'femea';
  className?: string;
}

export function AveSelector({
  aves,
  value,
  onChange,
  placeholder = "Selecione...",
  tipo,
  className = ""
}: AveSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedAve = aves.find(a => a.id === value);

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

  const handleSelect = (aveId: string) => {
    onChange(aveId);
    setIsOpen(false);
  };

  const renderAveItem = (ave: Ave, isButton: boolean = false) => {
    const bgColor = tipo === 'macho' ? 'bg-blue-50' : 'bg-pink-50';
    const iconColor = tipo === 'macho' ? 'text-blue-600' : 'text-pink-600';
    
    return (
      <div className="flex items-center gap-3">
        {ave.photo ? (
          <img 
            src={ave.photo} 
            alt={ave.name || ave.ring}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}>
            <i className={`fas fa-${tipo === 'macho' ? 'mars' : 'venus'} ${iconColor}`}></i>
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-800 truncate">
              {ave.ring || 'S/ anilha'}
            </span>
            {ave.ringYear && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {ave.ringYear}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 truncate">
            {ave.species || 'Espécie não informada'}
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
          selectedAve 
            ? 'border-slate-200 hover:border-indigo-500' 
            : 'border-slate-300 hover:border-indigo-400'
        }`}
      >
        {selectedAve ? (
          renderAveItem(selectedAve, true)
        ) : (
          <span className="text-sm text-slate-400 font-medium">{placeholder}</span>
        )}
        <i className={`fas fa-chevron-down text-slate-400 text-xs ml-2 transition-transform flex-shrink-0 ${
          isOpen ? 'rotate-180' : ''
        }`}></i>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {aves.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <i className={`fas fa-${tipo === 'macho' ? 'mars' : 'venus'} text-2xl mb-2`}></i>
              <p className="text-xs">
                Nenhum{tipo === 'macho' ? '' : 'a'} {tipo === 'macho' ? 'macho' : 'fêmea'} ativ{tipo === 'macho' ? 'o' : 'a'} cadastrad{tipo === 'macho' ? 'o' : 'a'}
              </p>
            </div>
          ) : (
            aves.map((ave) => (
              <button
                key={ave.id}
                type="button"
                onClick={() => handleSelect(ave.id)}
                className={`w-full p-3 text-left hover:bg-indigo-50 transition-all border-b border-slate-100 last:border-b-0 ${
                  value === ave.id ? 'bg-indigo-50' : ''
                }`}
              >
                {renderAveItem(ave)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
