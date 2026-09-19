import type { TabType } from '../App';

interface DashboardSectionProps {
  aves: unknown[];
  casais: unknown[];
  ninhos: unknown[];
  config: unknown;
  onNavigate: (tab: TabType) => void;
}

/*
 * TESTE DE RENDERIZAÇÃO DO DASHBOARD
 * Esta versão não acessa nenhum dado, configuração ou função do banco.
 * Serve para confirmar se o problema está no Dashboard ou no App.
 */
export function DashboardSection({ onNavigate }: DashboardSectionProps) {
  return (
    <section className="w-full min-h-[500px] p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.18em]">
          GouldPRO
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Visão geral
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Dashboard carregado com sucesso.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          {[
            ['Aves', 'fa-dove', 'aves'],
            ['Casais', 'fa-heart', 'casais'],
            ['Ninhos', 'fa-home', 'ninhos'],
            ['Calendário', 'fa-calendar-alt', 'calendario'],
            ['Financeiro', 'fa-chart-line', 'financeiro']
          ].map(([label, icon, tab]) => (
            <button
              key={tab}
              type="button"
              onClick={() => onNavigate(tab as TabType)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 text-left transition-all"
            >
              <i className={`fas ${icon} text-emerald-600`}></i>
              <p className="text-xs font-bold text-slate-700 mt-2">{label}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
