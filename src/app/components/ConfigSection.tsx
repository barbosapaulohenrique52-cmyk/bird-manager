import { useRef, useState, useEffect } from 'react';
import type { Config, ParametrosEspecie } from '../App';
import { GoogleDriveConfig } from './GoogleDriveConfig';
import { GoogleDriveBackups } from './GoogleDriveBackups';
import { GoogleDriveService } from '../services/googleDrive';

interface ConfigSectionProps {
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
  config?: Config;
  onSaveConfig?: (config: Config) => void;
  onRestoreBackup?: (data: any) => void;
}

const defaultParametros: ParametrosEspecie = {
  diasFertilidade: 7,
  duracaoChoca: 14,
  diasSaidaNinho: 30,
  diasAnilhamento: 7
};

const defaultConfig: Config = {
  prazoAlertaPostura: 15,
  especies: ['Diamante de Gould', 'Manon', 'Canário', 'Periquito', 'Calopsita', 'Agapornis'],
  parametrosEspecies: {},
  parametrosPadrao: defaultParametros
};

// Espécies pré-configuradas comuns
const especiesComuns = [
  'Diamante de Gould',
  'Manon',
  'Canário',
  'Periquito',
  'Calopsita',
  'Agapornis'
];

export function ConfigSection({ onExport, onImport, onClear, config = defaultConfig, onSaveConfig, onRestoreBackup }: ConfigSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localConfig, setLocalConfig] = useState<Config>(config);
  const [especieSelecionada, setEspecieSelecionada] = useState<string>('');
  const [novaEspecie, setNovaEspecie] = useState<string>('');
  const [driveService, setDriveService] = useState<GoogleDriveService | null>(null);
  const [showGoogleDrive, setShowGoogleDrive] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveConfig = () => {
    if (onSaveConfig) {
      onSaveConfig(localConfig);
      alert('Configurações salvas com sucesso!');
    }
  };

  const adicionarEspecieNaLista = () => {
    if (novaEspecie.trim() && !(localConfig.especies || []).includes(novaEspecie.trim())) {
      const novaConfig = {
        ...localConfig,
        especies: [...(localConfig.especies || []), novaEspecie.trim()]
      };
      setLocalConfig(novaConfig);
      // Salvar automaticamente
      if (onSaveConfig) {
        onSaveConfig(novaConfig);
      }
      setNovaEspecie('');
    }
  };

  const removerEspecieDaLista = (especie: string) => {
    if (confirm(`Deseja realmente remover "${especie}" da lista? Os parâmetros configurados serão mantidos.`)) {
      const novaConfig = {
        ...localConfig,
        especies: (localConfig.especies || []).filter(e => e !== especie)
      };
      setLocalConfig(novaConfig);
      // Salvar automaticamente
      if (onSaveConfig) {
        onSaveConfig(novaConfig);
      }
    }
  };

  const adicionarEspecie = () => {
    if (novaEspecie.trim() && !localConfig.parametrosEspecies[novaEspecie]) {
      setLocalConfig({
        ...localConfig,
        especies: (localConfig.especies || []).includes(novaEspecie.trim()) 
          ? localConfig.especies 
          : [...(localConfig.especies || []), novaEspecie.trim()],
        parametrosEspecies: {
          ...localConfig.parametrosEspecies,
          [novaEspecie]: { ...defaultParametros }
        }
      });
      setEspecieSelecionada(novaEspecie);
      setNovaEspecie('');
    }
  };

  const removerEspecie = (especie: string) => {
    const newParametros = { ...localConfig.parametrosEspecies };
    delete newParametros[especie];
    setLocalConfig({
      ...localConfig,
      parametrosEspecies: newParametros
    });
    if (especieSelecionada === especie) {
      setEspecieSelecionada('');
    }
  };

  const atualizarParametrosEspecie = (especie: string, campo: keyof ParametrosEspecie, valor: number) => {
    setLocalConfig({
      ...localConfig,
      parametrosEspecies: {
        ...localConfig.parametrosEspecies,
        [especie]: {
          ...localConfig.parametrosEspecies[especie],
          [campo]: valor
        }
      }
    });
  };

  const atualizarParametrosPadrao = (campo: keyof ParametrosEspecie, valor: number) => {
    setLocalConfig({
      ...localConfig,
      parametrosPadrao: {
        ...localConfig.parametrosPadrao,
        [campo]: valor
      }
    });
  };

  const especiesConfiguradasList = Object.keys(localConfig.parametrosEspecies);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
        Configurações
      </h2>
      
      {/* Lista de Espécies */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-[12px] font-black text-emerald-600 uppercase italic flex items-center gap-2">
          <i className="fas fa-feather-alt"></i>
          Espécies Cadastradas
        </h3>
        
        <p className="text-[10px] text-slate-600">
          Gerencie a lista de espécies que aparecerão em todos os campos de seleção da aplicação.
        </p>
        
        {/* Adicionar nova espécie */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={novaEspecie}
            onChange={(e) => setNovaEspecie(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                adicionarEspecieNaLista();
              }
            }}
            placeholder="Digite o nome da espécie..."
            className="flex-1 border-2 border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
          />
          <button
            onClick={adicionarEspecieNaLista}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition-all"
          >
            <i className="fas fa-plus mr-2"></i>
            Adicionar
          </button>
        </div>
        
        {/* Lista de espécies */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(localConfig.especies || []).map((especie) => (
            <div
              key={especie}
              className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between gap-2 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <i className="fas fa-dove text-emerald-600 text-xs flex-shrink-0"></i>
                <span className="text-xs font-bold text-slate-700 truncate">{especie}</span>
                {localConfig.parametrosEspecies[especie] && (
                  <i className="fas fa-cog text-indigo-500 text-[9px]" title="Com parâmetros configurados"></i>
                )}
              </div>
              <button
                onClick={() => removerEspecieDaLista(especie)}
                className="text-red-500 hover:text-red-700 text-xs flex-shrink-0"
                title="Remover espécie"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
        
        {(localConfig.especies || []).length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <i className="fas fa-feather-alt text-3xl mb-2"></i>
            <p className="text-xs">Nenhuma espécie cadastrada</p>
          </div>
        )}
        
        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
          <p className="text-[9px] font-bold text-emerald-800">
            <i className="fas fa-check-circle mr-1"></i>
            Total de espécies: {(localConfig.especies || []).length} • As alterações são salvas automaticamente
          </p>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-xl">
          <p className="text-[9px] font-bold text-blue-800">
            <i className="fas fa-info-circle mr-1"></i>
            As espécies criadas em outros lugares (modal de aves, ninhos, etc.) serão adicionadas automaticamente a esta lista.
          </p>
        </div>
      </div>
      
      {/* Parâmetros Padrão */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-[12px] font-black text-indigo-600 uppercase italic flex items-center gap-2">
          <i className="fas fa-sliders-h"></i>
          Parâmetros Padrão (Todas as Espécies)
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
              Dias para verificar fertilidade
            </label>
            <input
              type="number"
              value={localConfig.parametrosPadrao.diasFertilidade}
              onChange={(e) => atualizarParametrosPadrao('diasFertilidade', Number(e.target.value))}
              className="border-2 border-slate-200 p-3 rounded-xl w-full text-sm font-bold outline-none focus:border-indigo-500"
              min="1"
            />
            <p className="text-[9px] text-slate-400 mt-1">Dias após início da choca</p>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
              Duração da choca (dias)
            </label>
            <input
              type="number"
              value={localConfig.parametrosPadrao.duracaoChoca}
              onChange={(e) => atualizarParametrosPadrao('duracaoChoca', Number(e.target.value))}
              className="border-2 border-slate-200 p-3 rounded-xl w-full text-sm font-bold outline-none focus:border-indigo-500"
              min="1"
            />
            <p className="text-[9px] text-slate-400 mt-1">Dias até eclosão dos ovos</p>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
              Dias até saída do ninho
            </label>
            <input
              type="number"
              value={localConfig.parametrosPadrao.diasSaidaNinho}
              onChange={(e) => atualizarParametrosPadrao('diasSaidaNinho', Number(e.target.value))}
              className="border-2 border-slate-200 p-3 rounded-xl w-full text-sm font-bold outline-none focus:border-indigo-500"
              min="1"
            />
            <p className="text-[9px] text-slate-400 mt-1">Dias para filhote sair</p>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
              Dias para anilhamento
            </label>
            <input
              type="number"
              value={localConfig.parametrosPadrao.diasAnilhamento}
              onChange={(e) => atualizarParametrosPadrao('diasAnilhamento', Number(e.target.value))}
              className="border-2 border-slate-200 p-3 rounded-xl w-full text-sm font-bold outline-none focus:border-indigo-500"
              min="1"
            />
            <p className="text-[9px] text-slate-400 mt-1">Dias após eclosão</p>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">
            Alerta sem postura (dias)
          </label>
          <input
            type="number"
            value={localConfig.prazoAlertaPostura}
            onChange={(e) => setLocalConfig({ ...localConfig, prazoAlertaPostura: Number(e.target.value) })}
            className="border-2 border-slate-200 p-3 rounded-xl w-full text-sm font-bold outline-none focus:border-indigo-500"
            min="1"
          />
          <p className="text-[9px] text-slate-400 mt-1">Dias sem postura para alertar</p>
        </div>
      </div>

      {/* Parâmetros por Espécie */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-[12px] font-black text-emerald-600 uppercase italic flex items-center gap-2">
          <i className="fas fa-dna"></i>
          Parâmetros por Espécie
        </h3>
        
        {/* Adicionar nova espécie */}
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={novaEspecie}
              onChange={(e) => setNovaEspecie(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && adicionarEspecie()}
              placeholder="Nome da espécie..."
              className="border-2 border-slate-200 p-3 rounded-xl w-full text-sm font-bold outline-none focus:border-emerald-500"
              list="especies-comuns"
            />
            <datalist id="especies-comuns">
              {especiesComuns.map(esp => (
                <option key={esp} value={esp} />
              ))}
            </datalist>
          </div>
          <button
            onClick={adicionarEspecie}
            className="bg-emerald-600 text-white px-5 rounded-xl text-xs font-black uppercase"
          >
            <i className="fas fa-plus mr-1"></i>
            Adicionar
          </button>
        </div>

        {/* Lista de espécies configuradas */}
        {especiesConfiguradasList.length > 0 && (
          <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase">Espécies Configuradas:</p>
            <div className="flex flex-wrap gap-2">
              {especiesConfiguradasList.map(especie => (
                <div
                  key={especie}
                  className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 transition-all ${
                    especieSelecionada === especie
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span 
                    onClick={() => setEspecieSelecionada(especie === especieSelecionada ? '' : especie)}
                    className="cursor-pointer flex-1"
                  >
                    {especie}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removerEspecie(especie);
                    }}
                    className="text-xs opacity-70 hover:opacity-100"
                    type="button"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editar parâmetros da espécie selecionada */}
        {especieSelecionada && localConfig.parametrosEspecies[especieSelecionada] && (
          <div className="bg-emerald-50 p-4 rounded-xl space-y-3 border-2 border-emerald-200">
            <h4 className="text-[11px] font-black text-emerald-700 uppercase">
              Parâmetros: {especieSelecionada}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                  Dias fertilidade
                </label>
                <input
                  type="number"
                  value={localConfig.parametrosEspecies[especieSelecionada].diasFertilidade}
                  onChange={(e) => atualizarParametrosEspecie(especieSelecionada, 'diasFertilidade', Number(e.target.value))}
                  className="border-2 border-emerald-300 p-2 rounded-lg w-full text-sm font-bold outline-none focus:border-emerald-500"
                  min="1"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                  Duração choca
                </label>
                <input
                  type="number"
                  value={localConfig.parametrosEspecies[especieSelecionada].duracaoChoca}
                  onChange={(e) => atualizarParametrosEspecie(especieSelecionada, 'duracaoChoca', Number(e.target.value))}
                  className="border-2 border-emerald-300 p-2 rounded-lg w-full text-sm font-bold outline-none focus:border-emerald-500"
                  min="1"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                  Dias saída ninho
                </label>
                <input
                  type="number"
                  value={localConfig.parametrosEspecies[especieSelecionada].diasSaidaNinho}
                  onChange={(e) => atualizarParametrosEspecie(especieSelecionada, 'diasSaidaNinho', Number(e.target.value))}
                  className="border-2 border-emerald-300 p-2 rounded-lg w-full text-sm font-bold outline-none focus:border-emerald-500"
                  min="1"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                  Dias anilhamento
                </label>
                <input
                  type="number"
                  value={localConfig.parametrosEspecies[especieSelecionada].diasAnilhamento}
                  onChange={(e) => atualizarParametrosEspecie(especieSelecionada, 'diasAnilhamento', Number(e.target.value))}
                  className="border-2 border-emerald-300 p-2 rounded-lg w-full text-sm font-bold outline-none focus:border-emerald-500"
                  min="1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botão Salvar */}
      <button
        onClick={handleSaveConfig}
        className="w-full bg-indigo-600 text-white p-4 rounded-xl text-xs font-black uppercase"
      >
        <i className="fas fa-save mr-2"></i>
        Salvar Todas as Configurações
      </button>

      {/* Google Drive Backup */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-black text-slate-600 uppercase italic flex items-center gap-2">
            <i className="fab fa-google-drive"></i>
            Backup na Nuvem
          </h3>
          <button
            onClick={() => setShowGoogleDrive(!showGoogleDrive)}
            className="text-xs font-black text-slate-600 hover:text-emerald-600 transition-colors"
          >
            {showGoogleDrive ? (
              <>
                <i className="fas fa-chevron-up mr-1"></i>
                Recolher
              </>
            ) : (
              <>
                <i className="fas fa-chevron-down mr-1"></i>
                Expandir
              </>
            )}
          </button>
        </div>

        {showGoogleDrive && (
          <div className="space-y-4">
            <GoogleDriveConfig
              onSignIn={setDriveService}
              onSignOut={() => setDriveService(null)}
              driveService={driveService}
            />

            {driveService && driveService.isUserSignedIn() && (
              <GoogleDriveBackups
                driveService={driveService}
                onRestore={(data) => {
                  if (onRestoreBackup) {
                    onRestoreBackup(data);
                  }
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Backup Local */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-[12px] font-black text-slate-600 uppercase italic flex items-center gap-2">
          <i className="fas fa-database"></i>
          Backup Local
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onExport}
            className="bg-slate-800 text-white p-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
          >
            <i className="fas fa-download"></i>
            Exportar Backup
          </button>
          
          <label className="bg-emerald-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase text-center cursor-pointer flex items-center justify-center gap-2">
            <i className="fas fa-upload"></i>
            Importar Backup
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        
        <button
          onClick={onClear}
          className="w-full bg-rose-50 text-rose-600 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
        >
          <i className="fas fa-trash-alt"></i>
          Apagar Tudo
        </button>
      </div>

      {/* Informações */}
      <div className="bg-slate-100 p-4 rounded-2xl">
        <p className="text-[10px] text-slate-600 font-bold text-center">
          GouldPRO Master v2.0 • Sistema de Gestão de Plantel
        </p>
      </div>
    </section>
  );
}