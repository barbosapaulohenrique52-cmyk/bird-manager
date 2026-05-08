interface PhotoZoomProps {
  src: string;
  onClose: () => void;
}

export function PhotoZoom({ src, onClose }: PhotoZoomProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6"
    >
      <img src={src} className="max-w-full max-h-full rounded-2xl object-contain" alt="Zoom" />
    </div>
  );
}
