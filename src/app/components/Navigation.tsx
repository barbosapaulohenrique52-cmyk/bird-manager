import type { TabType } from '../App';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Início', icon: 'fa-home' },
    { id: 'ninhos', label: 'Ninhos', icon: 'fa-egg' },
    { id: 'aves', label: 'Plantel', icon: 'fa-dove' },
    { id: 'casais', label: 'Casais', icon: 'fa-heart' },
    { id: 'calendario', label: 'Calendário', icon: 'fa-calendar-alt' },
    { id: 'financeiro', label: 'Financeiro', icon: 'fa-chart-line' },
    { id: 'config', label: 'Config', icon: 'fa-cog' },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 h-16 sticky top-16 z-30">
      <div className="h-full flex w-full max-w-7xl mx-auto gap-1.5 overflow-x-auto no-scrollbar px-2 items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            aria-label={tab.label}
            className={`flex-1 h-12 px-3 rounded-xl text-[9px] font-black uppercase transition-all min-w-[88px] sm:min-w-[100px] flex flex-col items-center justify-center gap-0.5 ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white shadow-lg'
                : 'text-slate-400 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <i className={`fas ${tab.icon} text-xs`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
