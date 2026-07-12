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
    const matchesSearch =
      (ave.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ave.ring || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !showOnlyActive || ave.status === 'Ativo';

    return matchesSearch && matchesStatus;
  });


  const handleDelete = (e: React.MouseEvent, aveId: string) => {
    e.stopPropagation();
    onDeleteAve(aveId);
  };


  const handlePhotoClick = (e: React.MouseEvent, photoUrl: string) => {
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

          <div className="relative">

            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou anilha..."
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold uppercase outline-none ring-1 ring-slate-100 focus:ring-emerald-500 transition-all"
            />

          </div>

        </div>

      </div>


      <div className="space-y-2">

        {filteredAves.map((ave) => (

          <div
            key={ave.id}
            className="bg-white rounded-xl border border-slate-100 p-2 flex items-center gap-3 shadow-sm hover:border-emerald-200 transition-colors"
          >

            <div className="shrink-0">

              {ave.photo ? (

                <img
                  src={ave.photo}
                  className="w-10 h-10 rounded-lg object-cover cursor-pointer"
                  alt={ave.name}
                  onClick={(e) => handlePhotoClick(e, ave.photo)}
                />

              ) : (

                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                  <i className="fas fa-kiwi-bird text-xs"></i>
                </div>

              )}

            </div>


            <div className="flex-1 min-w-0">

              <div className="flex justify-between items-center">

                <button
                  onClick={() => onViewDetails && onViewDetails(ave.id)}
                  className="font-black text-[11px] text-emerald-600 uppercase truncate underline"
                >
                  {ave.name || 'S/ NOME'}
                </button>


                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase bg-emerald-50 text-emerald-600">
                  {ave.status}
                </span>

              </div>


              <p className="text-[8px] font-bold text-slate-400 truncate">

                {ave.species} • {ave.ring || 'S/A'} • {ave.ringYear || '--'}

              </p>


            </div>


            <button
              onClick={() => onOpenModal('ave', ave.id)}
              className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-[10px]"
            >
              <i className="fas fa-edit"></i>
            </button>


            <button
              onClick={(e) => handleDelete(e, ave.id)}
              className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px]"
            >
              <i className="fas fa-trash-alt"></i>
            </button>


          </div>

        ))}

      </div>

    </section>
  );
}
```
