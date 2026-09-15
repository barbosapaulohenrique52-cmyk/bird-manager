import { useState } from 'react';
import type { Ave, ModalType, Config, CorAve } from '../App';
import BirdColorDiagram from './BirdColorDiagram';

interface AvesSectionProps {
  aves: Ave[];
  config?: Config;
  onOpenModal: (type: ModalType, id?: string | null) => void;
  onDeleteAve: (id: string) => void;
  onPhotoClick?: (photoUrl: string) => void;
  onViewDetails?: (aveId: string) => void;
}

function obterHexDaCor(
  nome: string | undefined,
  cores: CorAve[] | undefined,
  padrao: string
): string {
  if (!nome || !nome.trim()) {
    return padrao;
  }

  const nomeNormalizado = nome.trim().toLowerCase();

  const corEncontrada = (cores || []).find(
    (cor) => cor.nome.trim().toLowerCase() === nomeNormalizado
  );

  return corEncontrada?.hex || padrao;
}

export function AvesSection({
  aves,
  config,
  onOpenModal,
  onDeleteAve,
  onPhotoClick,
  onViewDetails
}: AvesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const filteredAves = aves.filter((ave) => {
    const searchMatch =
      (ave.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ave.ring || '').toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch =
      !showOnlyActive || ave.status === 'Ativo';

    return searchMatch && statusMatch;
  });

  const handleDelete = (
    e: React.MouseEvent,
    aveId: string
  ) => {
    e.stopPropagation();
    onDeleteAve(aveId);
  };

  const handlePhotoClick = (
    e: React.MouseEvent,
    photoUrl: string
  ) => {
    e.stopPropagation();

    if (onPhotoClick) {
      onPhotoClick(photoUrl);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
            Plantel
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => setShowOnlyActive(!showOnlyActive)}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-black text-[10px]"
            >
              {showOnlyActive ? 'ATIVAS' : 'TODAS'}
            </button>

            <button
              onClick={() => onOpenModal('ave')}
              className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-black text-[10px]"
            >
              ADICIONAR AVE
            </button>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou anilha..."
            className="w-full bg-slate-50 rounded-xl py-3 px-4 text-[11px] font-bold uppercase outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredAves.map((ave) => {
          const hexCabeca = obterHexDaCor(
            ave.corCabeca,
            config?.coresCabeca,
            '#f1f3f5'
          );

          const hexPeito = obterHexDaCor(
            ave.corPeito,
            config?.coresPeito,
            '#f1f3f5'
          );

          const hexDorso = obterHexDaCor(
            ave.corDorso,
            config?.coresDorso,
            '#f1f3f5'
          );

          return (
            <div
              key={ave.id}
              className="bg-white rounded-xl border border-slate-100 p-2 flex items-center gap-3 shadow-sm"
            >
              {/* Foto da ave */}
              <div className="shrink-0">
                {ave.photo ? (
                  <img
                    src={ave.photo}
                    alt={ave.name}
                    className="w-10 h-10 rounded-lg object-cover cursor-pointer"
                    onClick={(e) => handlePhotoClick(e, ave.photo!)}
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-kiwi-bird text-slate-400"></i>
                  </div>
                )}
              </div>

              {/* Informações da ave */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onViewDetails && onViewDetails(ave.id)}
                  className="font-black text-[11px] text-emerald-600 uppercase underline text-left"
                >
                  {ave.name || 'S/NOME'}
                </button>

                <p className="text-[8px] text-slate-400 font-bold">
                  {ave.species} • {ave.ring || 'S/A'} • {ave.ringYear || '--'}
                </p>

                <span className="text-[8px] font-black">
                  {ave.status}
                </span>
              </div>

              {/* Representação visual das cores */}
              <div
                className="w-16 h-16 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100"
                title="Representação visual das cores"
              >
                <BirdColorDiagram
                  corCabeca={hexCabeca}
                  corPeito={hexPeito}
                  corDorso={hexDorso}
                  className="w-14 h-14"
                />
              </div>

              {/* Editar */}
              <button
                onClick={() => onOpenModal('ave', ave.id)}
                className="bg-slate-100 px-2 py-1 rounded-lg shrink-0"
                title="Editar ave"
              >
                <i className="fas fa-edit"></i>
              </button>

              {/* Excluir */}
              <button
                onClick={(e) => handleDelete(e, ave.id)}
                className="bg-red-500 text-white px-2 py-1 rounded-lg shrink-0"
                title="Excluir ave"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          );
        })}

        {filteredAves.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <i className="fas fa-dove text-2xl text-slate-300 mb-2"></i>
            <p className="text-xs font-bold text-slate-400">
              Nenhuma ave encontrada.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AvesSection;
