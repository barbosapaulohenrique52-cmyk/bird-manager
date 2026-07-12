import { useState } from 'react';
import type { Ave, ModalType } from '../App';

interface AvesSectionProps {
  aves: Ave[];
  onOpenModal: (type: ModalType, id?: string | null) => void;
  onDeleteAve: (id: string) => void;
  onPhotoClick?: (photoUrl: string) => void;
  onViewDetails?: (aveId: string) => void;
}

export function AvesSection({
  aves,
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

        {filteredAves.map((ave) => (

          <div
            key={ave.id}
            className="bg-white rounded-xl border border-slate-100 p-2 flex items-center gap-3 shadow-sm"
          >

            <div>

              {ave.photo ? (

                <img
                  src={ave.photo}
                  alt={ave.name}
                  className="w-10 h-10 rounded-lg object-cover cursor-pointer"
                  onClick={(e) => handlePhotoClick(e, ave.photo)}
                />

              ) : (

                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-kiwi-bird"></i>
                </div>

              )}

            </div>


            <div className="flex-1 min-w-0">

              <button
                onClick={() => onViewDetails && onViewDetails(ave.id)}
                className="font-black text-[11px] text-emerald-600 uppercase underline"
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


            <button
              onClick={() => onOpenModal('ave', ave.id)}
              className="bg-slate-100 px-2 py-1 rounded-lg"
            >
              <i className="fas fa-edit"></i>
            </button>


            <button
              onClick={(e) => handleDelete(e, ave.id)}
              className="bg-red-500 text-white px-2 py-1 rounded-lg"
            >
              <i className="fas fa-trash-alt"></i>
            </button>


          </div>

        ))}

      </div>

    </section>
  );
}
