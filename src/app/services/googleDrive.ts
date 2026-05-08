// Serviço de integração com Google Drive

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
}

export class GoogleDriveService {
  private config: GoogleDriveConfig;
  private isSignedIn = false;

  constructor(config: GoogleDriveConfig) {
    this.config = config;
  }

  // Inicializar Google API
  async initializeGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (gapiInited) {
        resolve();
        return;
      }

      // Carregar o script gapi se ainda não foi carregado
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.gapi.load('client', async () => {
            try {
              await window.gapi.client.init({
                apiKey: this.config.apiKey,
                discoveryDocs: [DISCOVERY_DOC],
              });
              gapiInited = true;
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        };
        script.onerror = reject;
        document.body.appendChild(script);
      } else {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.config.apiKey,
              discoveryDocs: [DISCOVERY_DOC],
            });
            gapiInited = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      }
    });
  }

  // Inicializar Google Identity Services
  async initializeGis(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (gisInited) {
        resolve();
        return;
      }

      // Carregar o script GIS se ainda não foi carregado
      if (!window.google?.accounts?.oauth2) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: this.config.clientId,
            scope: SCOPES,
            callback: '', // será definido no login
          });
          gisInited = true;
          resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
      } else {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.config.clientId,
          scope: SCOPES,
          callback: '', // será definido no login
        });
        gisInited = true;
        resolve();
      }
    });
  }

  // Fazer login
  async signIn(): Promise<void> {
    await this.initializeGapi();
    await this.initializeGis();

    return new Promise((resolve, reject) => {
      tokenClient.callback = async (response: any) => {
        if (response.error !== undefined) {
          reject(response);
          return;
        }
        this.isSignedIn = true;
        resolve();
      };

      if (window.gapi.client.getToken() === null) {
        // Solicitar token de acesso
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Já tem token, apenas atualizar
        tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  }

  // Fazer logout
  signOut(): void {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        console.log('Token revogado');
      });
      window.gapi.client.setToken(null);
    }
    this.isSignedIn = false;
  }

  // Verificar se está logado
  isUserSignedIn(): boolean {
    return this.isSignedIn && window.gapi?.client?.getToken() !== null;
  }

  // Obter nome do usuário logado
  async getUserEmail(): Promise<string | null> {
    if (!this.isUserSignedIn()) return null;

    try {
      const response = await window.gapi.client.request({
        path: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
      });
      return response.result.email;
    } catch (error) {
      console.error('Erro ao obter email:', error);
      return null;
    }
  }

  // Criar pasta no Google Drive
  async createFolder(folderName: string): Promise<string> {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    try {
      const response = await window.gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });
      return response.result.id;
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      throw error;
    }
  }

  // Buscar pasta por nome
  async findFolder(folderName: string): Promise<string | null> {
    try {
      const response = await window.gapi.client.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar pasta:', error);
      throw error;
    }
  }

  // Obter ou criar pasta de backups
  async getOrCreateBackupFolder(): Promise<string> {
    const folderName = 'GouldPRO Backups';
    let folderId = await this.findFolder(folderName);

    if (!folderId) {
      folderId = await this.createFolder(folderName);
    }

    return folderId;
  }

  // Salvar backup no Google Drive
  async saveBackup(data: any): Promise<string> {
    if (!this.isUserSignedIn()) {
      throw new Error('Usuário não está logado no Google Drive');
    }

    try {
      const folderId = await this.getOrCreateBackupFolder();
      const fileName = `backup_gpro_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;

      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        mimeType: 'application/json',
      };

      const fileContent = JSON.stringify(data, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      formData.append('file', blob);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime', {
        method: 'POST',
        headers: new Headers({ Authorization: 'Bearer ' + window.gapi.client.getToken().access_token }),
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.id;
    } catch (error) {
      console.error('Erro ao salvar backup:', error);
      throw error;
    }
  }

  // Listar backups
  async listBackups(): Promise<Array<{ id: string; name: string; createdTime: string }>> {
    if (!this.isUserSignedIn()) {
      throw new Error('Usuário não está logado no Google Drive');
    }

    try {
      const folderId = await this.getOrCreateBackupFolder();

      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
        fields: 'files(id, name, createdTime)',
        orderBy: 'createdTime desc',
        pageSize: 50,
      });

      return response.result.files || [];
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      throw error;
    }
  }

  // Restaurar backup
  async restoreBackup(fileId: string): Promise<any> {
    if (!this.isUserSignedIn()) {
      throw new Error('Usuário não está logado no Google Drive');
    }

    try {
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      return JSON.parse(response.body);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw error;
    }
  }

  // Deletar backup
  async deleteBackup(fileId: string): Promise<void> {
    if (!this.isUserSignedIn()) {
      throw new Error('Usuário não está logado no Google Drive');
    }

    try {
      await window.gapi.client.drive.files.delete({
        fileId: fileId,
      });
    } catch (error) {
      console.error('Erro ao deletar backup:', error);
      throw error;
    }
  }
}

// Tipos para window
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
