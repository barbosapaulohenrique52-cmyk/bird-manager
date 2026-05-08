import type { TabType } from '../App';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'ninhos', label: 'Ninhos', icon: 'fa-egg' },
    { id: 'aves', label: 'Plantel', icon: 'fa-dove' },
    { id: 'casais', label: 'Casais', icon: 'fa-heart' },
    { id: 'calendario', label: 'Calendário', icon: 'fa-calendar-alt' },
    { id: 'financeiro', label: 'Financeiro', icon: 'fa-chart-line' },
    { id: 'config', label: 'Config', icon: 'fa-cog' },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 p-2 sticky top-16 z-30">
      <div className="flex max-w-5xl mx-auto gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-2 rounded-xl text-[9px] font-black uppercase transition-all min-w-max flex flex-col items-center gap-1 ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white shadow-lg'
                : 'text-slate-400 bg-slate-50'
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