import { useState, useEffect } from 'react';
import { GoogleDriveService } from '../services/googleDrive';

interface GoogleDriveBackupsProps {
  driveService: GoogleDriveService | null;
  onRestore: (data: any) => void;
}

interface Backup {
  id: string;
  name: string;
  createdTime: string;
}

export function GoogleDriveBackups({ driveService, onRestore }: GoogleDriveBackupsProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const loadBackups = async () => {
    if (!driveService || !driveService.isUserSignedIn()) {
      return;
    }

    setIsLoading(true);
    try {
      const list = await driveService.listBackups();
      setBackups(list);
    } catch (error: any) {
      console.error('Erro ao carregar backups:', error);
      alert('Erro ao carregar backups: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (driveService && driveService.isUserSignedIn()) {
      loadBackups();
    }
  }, [driveService]);

  const handleCreateBackup = async () => {
    if (!driveService || !driveService.isUserSignedIn()) {
      alert('Você precisa estar logado no Google Drive');
      return;
    }

    setIsLoading(true);
    try {
      // Obter dados do localStorage
      const data = {
        aves: JSON.parse(localStorage.getItem('gpro_v19_aves') || '[]'),
        casais: JSON.parse(localStorage.getItem('gpro_v19_casais') || '[]'),
        ninhos: JSON.parse(localStorage.getItem('gpro_v19_ninhos') || '[]'),
        config: JSON.parse(localStorage.getItem('gpro_v19_config') || '{}'),
        lancamentos: JSON.parse(localStorage.getItem('gpro_v19_lancamentos') || '[]'),
      };

      await driveService.saveBackup(data);
      alert('Backup salvo com sucesso no Google Drive!');

      // Atualizar data do último backup
      localStorage.setItem('gpro_v19_lastBackup', new Date().toISOString());

      // Recarregar lista
      await loadBackups();
    } catch (error: any) {
      console.error('Erro ao criar backup:', error);
      alert('Erro ao criar backup: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backup: Backup) => {
    if (!driveService) return;

    if (!confirm(`Deseja restaurar o backup "${backup.name}"?\n\nISTO SUBSTITUIRÁ TODOS OS DADOS ATUAIS!`)) {
      return;
    }

    setIsRestoring(true);
    try {
      const data = await driveService.restoreBackup(backup.id);
      onRestore(data);
      alert('Backup restaurado com sucesso! A página será recarregada.');
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao restaurar backup:', error);
      alert('Erro ao restaurar backup: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (backup: Backup) => {
    if (!driveService) return;

    if (!confirm(`Deseja deletar o backup "${backup.name}"?\n\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    setIsLoading(true);
    try {
      await driveService.deleteBackup(backup.id);
      alert('Backup deletado com sucesso!');
      await loadBackups();
    } catch (error: any) {
      console.error('Erro ao deletar backup:', error);
      alert('Erro ao deletar backup: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!driveService || !driveService.isUserSignedIn()) {
    return (
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 text-center">
        <i className="fas fa-cloud-download-alt text-4xl text-slate-300 mb-3"></i>
        <p className="text-slate-500 font-bold">Faça login no Google Drive para gerenciar backups na nuvem</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com botão de novo backup */}
      <div className="flex justify-between items-center">
        <h3 className="font-black text-slate-800 uppercase text-sm">Backups no Google Drive</h3>
        <button
          onClick={handleCreateBackup}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-black text-xs uppercase transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-1"></i>
              Salvando...
            </>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt mr-1"></i>
              Criar Backup
            </>
          )}
        </button>
      </div>

      {/* Lista de backups */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden">
        {isLoading && backups.length === 0 ? (
          <div className="p-8 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-slate-300 mb-3"></i>
            <p className="text-slate-500 text-sm">Carregando backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-8 text-center">
            <i className="fas fa-cloud text-4xl text-slate-300 mb-3"></i>
            <p className="text-slate-500 font-bold mb-2">Nenhum backup encontrado</p>
            <p className="text-xs text-slate-400">Clique em "Criar Backup" para salvar seus dados na nuvem</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {backups.map((backup) => (
              <div key={backup.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <i className="fas fa-file-archive text-blue-600"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{backup.name}</h4>
                      <p className="text-[10px] text-slate-500">
                        <i className="fas fa-clock mr-1"></i>
                        {formatDate(backup.createdTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestoreBackup(backup)}
                      disabled={isRestoring}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-black text-xs uppercase transition-all disabled:opacity-50"
                      title="Restaurar backup"
                    >
                      <i className="fas fa-undo mr-1"></i>
                      Restaurar
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup)}
                      disabled={isLoading}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-lg font-black text-xs uppercase transition-all disabled:opacity-50"
                      title="Deletar backup"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info sobre backup automático */}
      {backups.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <i className="fas fa-info-circle text-blue-600 text-lg"></i>
            <div className="flex-1">
              <h4 className="font-black text-blue-800 uppercase text-xs mb-1">Backup Automático</h4>
              <p className="text-[10px] text-blue-700">
                A cada 10 edições no sistema, você será questionado se deseja fazer backup automático no Google Drive.
                Recomendamos manter backups regulares de seus dados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
