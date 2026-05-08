interface HeaderProps {
  onConfigClick: () => void;
}

export function Header({ onConfigClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-600 w-10 h-10 rounded-xl text-white shadow-lg flex items-center justify-center">
          <i className="fas fa-kiwi-bird"></i>
        </div>
        <h1 className="text-lg font-black italic tracking-tighter uppercase leading-none">
          Gould<span className="text-emerald-600 not-italic">Master</span>
        </h1>
      </div>
      <button 
        onClick={onConfigClick}
        className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"
      >
        <i className="fas fa-cog text-sm"></i>
      </button>
    </header>
  );
}
