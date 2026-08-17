import { useEffect } from 'react';

interface PhotoZoomProps {
  src: string;
  onClose: () => void;
}

export function PhotoZoom({ src, onClose }: PhotoZoomProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
    >
      <div
        className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-white text-slate-700 shadow-lg flex items-center justify-center text-xl font-black hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          aria-label="Fechar foto"
          title="Fechar"
        >
          ×
        </button>

        <img
          src={src}
          alt="Foto ampliada"
          className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
}
