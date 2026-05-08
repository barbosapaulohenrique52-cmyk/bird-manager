import { useState, useEffect } from 'react';
import { GoogleDriveService } from '../services/googleDrive';

interface GoogleDriveConfigProps {
  onSignIn: (service: GoogleDriveService) => void;
  onSignOut: () => void;
  driveService: GoogleDriveService | null;
}

export function GoogleDriveConfig({ onSignIn, onSignOut, driveService }: GoogleDriveConfigProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar configuração salva do localStorage
  useEffect(() => {
    const savedClientId = localStorage.getItem('gpro_google_clientId');
    const savedApiKey = localStorage.getItem('gpro_google_apiKey');

    if (savedClientId) setClientId(savedClientId);
    if (savedApiKey) setApiKey(savedApiKey);

    // Se já tem configuração, tentar criar o serviço
    if (savedClientId && savedApiKey && !driveService) {
      const service = new GoogleDriveService({
        clientId: savedClientId,
        apiKey: savedApiKey,
      });
      onSignIn(service);
    }
  }, []);

  // Atualizar status de login
  useEffect(() => {
    if (driveService) {
      const checkSignIn = async () => {
        const signedIn = driveService.isUserSignedIn();
        setIsSignedIn(signedIn);

        if (signedIn) {
          const email = await driveService.getUserEmail();
          setUserEmail(email);
        }
      };

      checkSignIn();
    }
  }, [driveService]);

  const handleSaveConfig = () => {
    if (!clientId.trim() || !apiKey.trim()) {
      alert('Por favor, preencha o Client ID e API Key');
      return;
    }

    // Validar formato básico
    if (!clientId.includes('.apps.googleusercontent.com')) {
      alert('Client ID inválido. Deve terminar com .apps.googleusercontent.com');
      return;
    }

    // Salvar no localStorage
    localStorage.setItem('gpro_google_clientId', clientId);
    localStorage.setItem('gpro_google_apiKey', apiKey);

    // Criar serviço
    const service = new GoogleDriveService({
      clientId,
      apiKey,
    });

    onSignIn(service);
    setShowConfig(false);
    alert('Configuração salva! Agora você pode fazer login com Google.');
  };

  const handleSignIn = async () => {
    if (!driveService) {
      alert('Configure primeiro o Client ID e API Key');
      setShowConfig(true);
      return;
    }

    setIsLoading(true);
    try {
      await driveService.signIn();
      setIsSignedIn(true);
      const email = await driveService.getUserEmail();
      setUserEmail(email);
      alert('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      alert('Erro ao fazer login: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    if (driveService) {
      driveService.signOut();
      setIsSignedIn(false);
      setUserEmail(null);
      onSignOut();
    }
  };

  return (
    <div className="space-y-4">
      {/* Status de Login */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isSignedIn ? 'bg-emerald-100' : 'bg-slate-100'
            }`}>
              <i className={`fab fa-google text-2xl ${
                isSignedIn ? 'text-emerald-600' : 'text-slate-400'
              }`}></i>
            </div>
            <div>
              <h3 className="font-black text-sm uppercase">Google Drive</h3>
              {isSignedIn && userEmail ? (
                <p className="text-xs text-emerald-600 font-bold">{userEmail}</p>
              ) : (
                <p className="text-xs text-slate-500">Não conectado</p>
              )}
            </div>
          </div>

          {isSignedIn ? (
            <button
              onClick={handleSignOut}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase transition-all"
            >
              <i className="fas fa-sign-out-alt mr-1"></i>
              Sair
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl font-black text-xs uppercase transition-all"
              >
                <i className="fas fa-cog mr-1"></i>
                Configurar
              </button>
              <button
                onClick={handleSignIn}
                disabled={isLoading || !driveService}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black text-xs uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-1"></i>
                    Conectando...
                  </>
                ) : (
                  <>
                    <i className="fab fa-google mr-1"></i>
                    Entrar
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formulário de Configuração */}
      {showConfig && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <i className="fas fa-info-circle text-blue-600 text-xl mt-1"></i>
            <div className="flex-1">
              <h4 className="font-black text-blue-800 uppercase text-sm mb-2">Como Obter as Credenciais</h4>
              <p className="text-xs text-blue-700 mb-3">
                Para usar backup no Google Drive, você precisa criar credenciais no Google Cloud Console.
                Siga as instruções no arquivo <code className="bg-blue-200 px-1 rounded">GOOGLE_DRIVE_SETUP.md</code>
              </p>
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline font-bold"
              >
                <i className="fas fa-external-link-alt mr-1"></i>
                Abrir Google Cloud Console
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-blue-600 uppercase block mb-1">
                Client ID *
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="123456789-abc...apps.googleusercontent.com"
                className="w-full border-2 border-blue-200 p-3 rounded-xl text-xs font-mono outline-none focus:border-blue-500"
              />
              <p className="text-[9px] text-blue-600 mt-1">
                OAuth 2.0 Client ID do Google Cloud Console
              </p>
            </div>

            <div>
              <label className="text-[10px] font-black text-blue-600 uppercase block mb-1">
                API Key *
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full border-2 border-blue-200 p-3 rounded-xl text-xs font-mono outline-none focus:border-blue-500"
              />
              <p className="text-[9px] text-blue-600 mt-1">
                API Key do Google Cloud Console
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-black text-xs uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-black text-xs uppercase hover:bg-blue-700"
              >
                Salvar Configuração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informações sobre Backup Automático */}
      {isSignedIn && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <i className="fas fa-cloud-upload-alt text-emerald-600 text-xl"></i>
            <div className="flex-1">
              <h4 className="font-black text-emerald-800 uppercase text-xs mb-1">Backup Automático Ativo</h4>
              <p className="text-[10px] text-emerald-700">
                Seus backups serão salvos automaticamente na pasta "GouldPRO Backups" do seu Google Drive.
                A cada 10 edições, você será questionado se deseja fazer backup.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
