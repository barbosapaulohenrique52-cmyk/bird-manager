import { useState } from 'react';
import type { Lancamento } from '../App';

interface FinanceiroSectionProps {
  lancamentos: Lancamento[];
  onDeleteLancamento: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onSaveLancamento?: (data: Omit<Lancamento, 'id'>) => void;
}

export function FinanceiroSection({ lancamentos, onDeleteLancamento, onDeleteMultiple, onSaveLancamento }: FinanceiroSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'Receita' | 'Despesa'>('Todos');
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [novoLancamento, setNovoLancamento] = useState({
    tipo: 'Receita' as 'Receita' | 'Despesa',
    categoria: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0]
  });

  const lancamentosFiltrados = filtroTipo === 'Todos'
    ? lancamentos
    : lancamentos.filter(l => l.tipo === filtroTipo);

  const totalReceitas = lancamentos
    .filter(l => l.tipo === 'Receita')
    .reduce((sum, l) => sum + l.valor, 0);

  const totalDespesas = lancamentos
    .filter(l => l.tipo === 'Despesa')
    .reduce((sum, l) => sum + l.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  const categorias = {
    Receita: ['Venda de Ave', 'Venda de Ovos', 'Outras Receitas'],
    Despesa: ['Alimentação', 'Veterinário', 'Material', 'Medicamentos', 'Outras Despesas']
  };

  const handleToggleSelecao = (id: string) => {
    const novoSet = new Set(selecionados);
    if (novoSet.has(id)) {
      novoSet.delete(id);
    } else {
      novoSet.add(id);
    }
    setSelecionados(novoSet);
  };

  const handleSelecionarTodos = () => {
    if (selecionados.size === lancamentosFiltrados.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(lancamentosFiltrados.map(l => l.id)));
    }
  };

  const handleExcluirSelecionados = () => {
    if (selecionados.size === 0) return;
    
    if (confirm(`Deseja excluir ${selecionados.size} lançamento(s)?`)) {
      onDeleteMultiple(Array.from(selecionados));
      setSelecionados(new Set());
      setModoSelecao(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
          Controle Financeiro
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px]"
        >
          <i className="fas fa-plus mr-1"></i>
          LANÇAMENTO
        </button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl">
          <div className="text-xs font-black text-emerald-600 uppercase mb-1">Receitas</div>
          <div className="text-2xl font-black text-emerald-700">
            R$ {totalReceitas.toFixed(2)}
          </div>
        </div>
        <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl">
          <div className="text-xs font-black text-rose-600 uppercase mb-1">Despesas</div>
          <div className="text-2xl font-black text-rose-700">
            R$ {totalDespesas.toFixed(2)}
          </div>
        </div>
        <div className={`border-2 p-4 rounded-2xl ${
          saldo >= 0 
            ? 'bg-indigo-50 border-indigo-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className={`text-xs font-black uppercase mb-1 ${
            saldo >= 0 ? 'text-indigo-600' : 'text-amber-600'
          }`}>
            Saldo
          </div>
          <div className={`text-2xl font-black ${
            saldo >= 0 ? 'text-indigo-700' : 'text-amber-700'
          }`}>
            R$ {saldo.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Formulário de Novo Lançamento */}
      {showAddForm && (
        <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl space-y-3">
          <h3 className="font-black text-slate-800 uppercase text-sm mb-3">Novo Lançamento</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Tipo</label>
              <select
                value={novoLancamento.tipo}
                onChange={(e) => setNovoLancamento({ 
                  ...novoLancamento, 
                  tipo: e.target.value as 'Receita' | 'Despesa',
                  categoria: '' 
                })}
                className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
              >
                <option value="Receita">Receita</option>
                <option value="Despesa">Despesa</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Categoria</label>
              <select
                value={novoLancamento.categoria}
                onChange={(e) => setNovoLancamento({ ...novoLancamento, categoria: e.target.value })}
                className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Selecione...</option>
                {categorias[novoLancamento.tipo].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Descrição</label>
            <input
              type="text"
              value={novoLancamento.descricao}
              onChange={(e) => setNovoLancamento({ ...novoLancamento, descricao: e.target.value })}
              placeholder="Detalhe do lançamento"
              className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={novoLancamento.valor}
                onChange={(e) => setNovoLancamento({ ...novoLancamento, valor: e.target.value })}
                placeholder="0.00"
                className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Data</label>
              <input
                type="date"
                value={novoLancamento.data}
                onChange={(e) => setNovoLancamento({ ...novoLancamento, data: e.target.value })}
                className="border-2 border-slate-200 p-2 rounded-xl w-full text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-black text-xs uppercase"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (!novoLancamento.categoria || !novoLancamento.descricao || !novoLancamento.valor) {
                  alert('Por favor, preencha todos os campos obrigatórios');
                  return;
                }

                if (onSaveLancamento) {
                  onSaveLancamento({
                    tipo: novoLancamento.tipo,
                    categoria: novoLancamento.categoria,
                    descricao: novoLancamento.descricao,
                    valor: parseFloat(novoLancamento.valor),
                    data: novoLancamento.data
                  });
                }

                setShowAddForm(false);
                setNovoLancamento({
                  tipo: 'Receita',
                  categoria: '',
                  descricao: '',
                  valor: '',
                  data: new Date().toISOString().split('T')[0]
                });
              }}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-black text-xs uppercase"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2">
          {(['Todos', 'Receita', 'Despesa'] as const).map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase transition-all ${
                filtroTipo === tipo
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>

        {lancamentosFiltrados.length > 0 && (
          <button
            onClick={() => {
              setModoSelecao(!modoSelecao);
              setSelecionados(new Set());
            }}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase transition-all ${
              modoSelecao
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <i className={`fas ${modoSelecao ? 'fa-times' : 'fa-check-square'} mr-1`}></i>
            {modoSelecao ? 'Cancelar' : 'Seleção em Lote'}
          </button>
        )}
      </div>

      {/* Barra de ações em lote */}
      {modoSelecao && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelecionarTodos}
              className="px-4 py-2 bg-white border-2 border-indigo-300 text-indigo-700 rounded-xl font-black text-xs uppercase hover:bg-indigo-100 transition-all"
            >
              <i className="fas fa-check-double mr-1"></i>
              {selecionados.size === lancamentosFiltrados.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
            <span className="text-sm font-bold text-indigo-700">
              {selecionados.size} selecionado{selecionados.size !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={handleExcluirSelecionados}
            disabled={selecionados.size === 0}
            className="px-5 py-2 bg-rose-600 text-white rounded-xl font-black text-xs uppercase hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-trash mr-1"></i>
            Excluir Selecionados
          </button>
        </div>
      )}

      {/* Lista de Lançamentos */}
      <div className="space-y-2">
        {lancamentosFiltrados.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border-2 border-slate-100">
            <i className="fas fa-file-invoice-dollar text-4xl text-slate-300 mb-3"></i>
            <p className="text-slate-500 text-sm font-bold">Nenhum lançamento registrado</p>
          </div>
        ) : (
          lancamentosFiltrados
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .map((lancamento) => (
              <div 
                key={lancamento.id} 
                className={`bg-white border-2 rounded-xl p-4 flex items-center gap-4 transition-all ${
                  modoSelecao && selecionados.has(lancamento.id)
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-100'
                }`}
              >
                {modoSelecao && (
                  <div 
                    onClick={() => handleToggleSelecao(lancamento.id)}
                    className="cursor-pointer"
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      selecionados.has(lancamento.id)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {selecionados.has(lancamento.id) && (
                        <i className="fas fa-check text-white text-xs"></i>
                      )}
                    </div>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  lancamento.tipo === 'Receita' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-rose-100 text-rose-600'
                }`}>
                  <i className={`fas ${
                    lancamento.tipo === 'Receita' ? 'fa-arrow-down' : 'fa-arrow-up'
                  } text-lg`}></i>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="font-black text-sm">{lancamento.descricao}</h4>
                      <p className="text-xs text-slate-500">{lancamento.categoria}</p>
                    </div>
                    <div className={`text-lg font-black ${
                      lancamento.tipo === 'Receita' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {lancamento.tipo === 'Receita' ? '+' : '-'} R$ {lancamento.valor.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {!modoSelecao && (
                  <button 
                    onClick={() => {
                      if (confirm('Deseja excluir este lançamento?')) {
                        onDeleteLancamento(lancamento.id);
                      }
                    }}
                    className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                )}
              </div>
            ))
        )}
      </div>
    </section>
  );
}
