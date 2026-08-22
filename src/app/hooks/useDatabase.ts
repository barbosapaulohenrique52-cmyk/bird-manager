import { useState, useEffect, useCallback } from 'react';
import type { Ave, Casal, Ninho, Egg, Config, Lancamento, ParametrosEspecie } from '../App';

declare global {
  interface Window {
    google?: any;
  }
}import { useState, useEffect, useCallback } from 'react';
import type { Ave, Casal, Ninho, Egg, Config, Lancamento, ParametrosEspecie } from '../App';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const GOOGLE_DRIVE_FOLDER_NAME = 'GouldPRO';
const GOOGLE_DRIVE_BACKUP_NAME = 'backup.json';

function carregarGoogleIdentityServices(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const scriptId = 'google-identity-services';
    const existente = document.getElementById(scriptId);

    if (existente) {
      existente.addEventListener('load', () => resolve());
      existente.addEventListener('error', () =>
        reject(new Error('Não foi possível carregar o Google Identity Services.'))
      );
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Não foi possível carregar o Google Identity Services.'));
    document.head.appendChild(script);
  });
}

async function obterTokenGoogle(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('O Client ID do Google ainda não foi configurado no Vercel.');
  }

  await carregarGoogleIdentityServices();

  return new Promise((resolve, reject) => {
    let finalizado = false;

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_DRIVE_SCOPE,
      callback: (response: any) => {
        if (finalizado) return;
        finalizado = true;

        if (response?.access_token) {
          resolve(response.access_token);
        } else {
          reject(
            new Error(
              response?.error_description ||
                'O Google não forneceu um token de acesso.'
            )
          );
        }
      },
      error_callback: (error: any) => {
        if (finalizado) return;
        finalizado = true;
        reject(
          new Error(
            error?.message ||
              'A autorização do Google foi cancelada ou falhou.'
          )
        );
      }
    });

    tokenClient.requestAccessToken({ prompt: '' });
  });
}

async function buscarOuCriarPastaGoogleDrive(
  accessToken: string
): Promise<string> {
  const query =
    `name = '${GOOGLE_DRIVE_FOLDER_NAME.replace(/'/g, "\\'")}' ` +
    `and mimeType = 'application/vnd.google-apps.folder' ` +
    `and trashed = false`;

  const busca = await fetch(
    `https://www.googleapis.com/drive/v3/files?${new URLSearchParams({
      q: query,
      spaces: 'drive',
      fields: 'files(id,name)',
      pageSize: '10'
    })}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!busca.ok) {
    throw new Error('Não foi possível acessar o Google Drive.');
  }

  const dados = await busca.json();

  if (dados.files?.length > 0) {
    return dados.files[0].id;
  }

  const criar = await fetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: GOOGLE_DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    }
  );

  if (!criar.ok) {
    throw new Error(
      'Não foi possível criar a pasta GouldPRO no Google Drive.'
    );
  }

  const pasta = await criar.json();
  return pasta.id;
}

async function buscarBackupGoogleDrive(
  accessToken: string,
  folderId: string
): Promise<string | null> {
  const query =
    `name = '${GOOGLE_DRIVE_BACKUP_NAME}' ` +
    `and '${folderId}' in parents ` +
    `and trashed = false`;

  const busca = await fetch(
    `https://www.googleapis.com/drive/v3/files?${new URLSearchParams({
      q: query,
      spaces: 'drive',
      fields: 'files(id,name)',
      pageSize: '10'
    })}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!busca.ok) {
    throw new Error(
      'Não foi possível procurar o backup no Google Drive.'
    );
  }

  const dados = await busca.json();
  return dados.files?.[0]?.id || null;
}

async function criarBackupGoogleDrive(
  accessToken: string,
  folderId: string,
  conteudo: string
): Promise<string> {
  const metadata = {
    name: GOOGLE_DRIVE_BACKUP_NAME,
    parents: [folderId],
    mimeType: 'application/json'
  };

  const boundary = 'gouldpro-backup-boundary';

  const corpo =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    `${conteudo}\r\n` +
    `--${boundary}--`;

  const resposta = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: corpo
    }
  );

  if (!resposta.ok) {
    throw new Error(
      'Não foi possível criar o backup no Google Drive.'
    );
  }

  const arquivo = await resposta.json();
  return arquivo.id;
}

async function atualizarBackupGoogleDrive(
  accessToken: string,
  fileId: string,
  conteudo: string
): Promise<void> {
  const resposta = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: conteudo
    }
  );

  if (!resposta.ok) {
    throw new Error(
      'Não foi possível atualizar o backup no Google Drive.'
    );
  }
}

interface Database {
  aves: Ave[];
  casais: Casal[];
  ninhos: Ninho[];
  config: Config;
  lancamentos: Lancamento[];
}

interface ColorLists {
  coresCabeca: string[];
  coresPeito: string[];
  coresDorso: string[];
}

const defaultParametros: ParametrosEspecie = {
  diasFertilidade: 7,
  duracaoChoca: 14,
  diasSaidaNinho: 30,
  diasAnilhamento: 7
};

const defaultConfig: Config = {
  prazoAlertaPostura: 15,
  especies: [
    'Diamante de Gould',
    'Manon',
    'Canário',
    'Periquito',
    'Calopsita',
    'Agapornis'
  ],
  parametrosEspecies: {},
  parametrosPadrao: defaultParametros
};

export function useDatabase() {
  const [db, setDb] = useState<Database>({
    aves: [],
    casais: [],
    ninhos: [],
    config: defaultConfig,
    lancamentos: []
  });

  const [lastGoogleDriveBackup, setLastGoogleDriveBackup] =
    useState<string | null>(() =>
      localStorage.getItem('gpro_v19_lastGoogleDriveBackup')
    );

  const [colorLists, setColorLists] = useState<ColorLists>({
    coresCabeca: [],
    coresPeito: [],
    coresDorso: []
  });

  // Load from localStorage
  useEffect(() => {
    const aves = JSON.parse(
      localStorage.getItem('gpro_v19_aves') || '[]'
    );

    const casais = JSON.parse(
      localStorage.getItem('gpro_v19_casais') || '[]'
    );

    const ninhos = JSON.parse(
      localStorage.getItem('gpro_v19_ninhos') || '[]'
    );

    let config = JSON.parse(
      localStorage.getItem('gpro_v19_config') ||
        JSON.stringify(defaultConfig)
    );

    const lancamentos = JSON.parse(
      localStorage.getItem('gpro_v19_lancamentos') || '[]'
    );

    const savedColors = JSON.parse(
      localStorage.getItem('gpro_v19_colors') ||
        '{"coresCabeca":[],"coresPeito":[],"coresDorso":[]}'
    );

    // Migrar configuração antiga para nova estrutura
    if (
      config.diasFertilidade !== undefined &&
      !config.parametrosPadrao
    ) {
      config = {
        prazoAlertaPostura: config.prazoAlertaPostura || 15,
        especies: [
          'Diamante de Gould',
          'Manon',
          'Canário',
          'Periquito',
          'Calopsita',
          'Agapornis'
        ],
        parametrosEspecies: {},
        parametrosPadrao: {
          diasFertilidade: config.diasFertilidade || 7,
          duracaoChoca: config.duracaoChoca || 14,
          diasSaidaNinho: config.diasSaidaNinho || 30,
          diasAnilhamento: config.diasAnilhamento || 7
        }
      };

      localStorage.setItem(
        'gpro_v19_config',
        JSON.stringify(config)
      );
    }

    // Garantir que o campo especies existe
    if (!config.especies) {
      config.especies = [
        'Diamante de Gould',
        'Manon',
        'Canário',
        'Periquito',
        'Calopsita',
        'Agapornis'
      ];

      localStorage.setItem(
        'gpro_v19_config',
        JSON.stringify(config)
      );
    }

    // 🔥 SINCRONIZAR ESPÉCIES EXISTENTES NAS AVES E OVOS
    const especiesExistentes = new Set(config.especies || []);
    let houveAlteracao = false;

    // Coletar espécies das aves
    aves.forEach((ave: Ave) => {
      if (
        ave.species &&
        ave.species.trim() !== '' &&
        !especiesExistentes.has(ave.species)
      ) {
        especiesExistentes.add(ave.species);
        houveAlteracao = true;
      }
    });

    // Coletar espécies dos ovos
    ninhos.forEach((ninho: Ninho) => {
      ninho.eggs?.forEach((egg: Egg) => {
        if (
          egg.species &&
          egg.species.trim() !== '' &&
          !especiesExistentes.has(egg.species)
        ) {
          especiesExistentes.add(egg.species);
          houveAlteracao = true;
        }
      });
    });

    // Se encontrou novas espécies, atualizar config
    if (houveAlteracao) {
      config.especies = Array.from(especiesExistentes);

      localStorage.setItem(
        'gpro_v19_config',
        JSON.stringify(config)
      );

      console.log(
        '✅ Espécies sincronizadas:',
        config.especies
      );
    }

    // Migrar casais para incluir campo historico se não existir
    const casaisMigrados = casais.map((casal: Casal) => ({
      ...casal,
      historico: casal.historico || []
    }));

    setDb({
      aves,
      casais: casaisMigrados,
      ninhos,
      config,
      lancamentos
    });

    setColorLists(savedColors);
  }, []);

  // Save to localStorage
  const save = useCallback((newDb: Database) => {
    localStorage.setItem(
      'gpro_v19_aves',
      JSON.stringify(newDb.aves)
    );

    localStorage.setItem(
      'gpro_v19_casais',
      JSON.stringify(newDb.casais)
    );

    localStorage.setItem(
      'gpro_v19_ninhos',
      JSON.stringify(newDb.ninhos)
    );

    localStorage.setItem(
      'gpro_v19_config',
      JSON.stringify(newDb.config)
    );

    localStorage.setItem(
      'gpro_v19_lancamentos',
      JSON.stringify(newDb.lancamentos)
    );

    // Incrementar contador de edições
    const editCount =
      Number(
        localStorage.getItem('gpro_v19_editCount') || '0'
      ) + 1;

    localStorage.setItem(
      'gpro_v19_editCount',
      editCount.toString()
    );

    // A cada 10 edições, alertar para fazer backup
    if (editCount % 10 === 0) {
      const lastBackup = localStorage.getItem(
        'gpro_v19_lastBackup'
      );

      const message = lastBackup
        ? `Você fez ${editCount} edições desde o início. Último backup: ${new Date(
            lastBackup
          ).toLocaleDateString(
            'pt-BR'
          )}. Recomendamos fazer um novo backup!`
        : `Você fez ${editCount} edições. Recomendamos fazer um backup dos seus dados!`;

      // Usar setTimeout para não bloquear o salvamento
      setTimeout(() => {
        if (confirm(message + '\n\nDeseja fazer backup agora?')) {
          const blob = new Blob(
            [JSON.stringify(newDb)],
            {
              type: 'application/json'
            }
          );

          const a = document.createElement('a');

          a.href =
            URL.createObjectURL(blob);

          a.download =
            `backup_gpro_${
              new Date()
                .toISOString()
                .split('T')[0]
            }.json`;

          a.click();

          localStorage.setItem(
            'gpro_v19_lastBackup',
            new Date().toISOString()
          );
        }
      }, 100);
    }

    setDb(newDb);
  }, []);

  const saveAve = useCallback(
    (
      aveData: Partial<Ave>,
      editId: string | null
    ) => {
      const newDb = { ...db };

      if (editId) {
        const idx = newDb.aves.findIndex(
          a => a.id === editId
        );

        if (idx !== -1) {
          newDb.aves[idx] = {
            ...newDb.aves[idx],
            ...aveData
          } as Ave;
        }
      } else {
        newDb.aves.push({
          id: Date.now().toString(),
          ...aveData
        } as Ave);
      }

      // ✨ Adicionar espécie à lista central se não existir
      if (
        aveData.species &&
        aveData.species.trim() !== '' &&
        !newDb.config.especies.includes(
          aveData.species
        )
      ) {
        newDb.config.especies.push(
          aveData.species
        );

        console.log(
          '✅ Nova espécie adicionada:',
          aveData.species
        );
      }

      // Atualizar listas de cores únicas
      const newColorLists = {
        ...colorLists
      };

      if (
        aveData.corCabeca &&
        aveData.corCabeca.trim() !== '' &&
        !newColorLists.coresCabeca.includes(
          aveData.corCabeca
        )
      ) {
        newColorLists.coresCabeca.push(
          aveData.corCabeca
        );
      }

      if (
        aveData.corPeito &&
        aveData.corPeito.trim() !== '' &&
        !newColorLists.coresPeito.includes(
          aveData.corPeito
        )
      ) {
        newColorLists.coresPeito.push(
          aveData.corPeito
        );
      }

      if (
        aveData.corDorso &&
        aveData.corDorso.trim() !== '' &&
        !newColorLists.coresDorso.includes(
          aveData.corDorso
        )
      ) {
        newColorLists.coresDorso.push(
          aveData.corDorso
        );
      }

      if (
        JSON.stringify(newColorLists) !==
        JSON.stringify(colorLists)
      ) {
        localStorage.setItem(
          'gpro_v19_colors',
          JSON.stringify(newColorLists)
        );

        setColorLists(newColorLists);
      }

      save(newDb);
    },
    [db, save, colorLists]
  );

  const saveCasal = useCallback(
    (casalData: Omit<Casal, 'id'>) => {
      const newDb = { ...db };

      const newId =
        Date.now().toString();

      newDb.casais.push({
        id: newId,
        ...casalData
      });

      save(newDb);

      return newId;
    },
    [db, save]
  );

  const saveNinho = useCallback(
    (ninho: Partial<Ninho> & { id?: string }) => {
      const newDb = { ...db };

      if (ninho.id) {
        const idx =
          newDb.ninhos.findIndex(
            n => n.id === ninho.id
          );

        if (idx !== -1) {
          newDb.ninhos[idx] = {
            ...newDb.ninhos[idx],
            ...ninho
          } as Ninho;
        }
      } else {
        newDb.ninhos.push({
          id: Date.now().toString(),
          name: ninho.name || '',
          casalId: ninho.casalId || '',
          eggs: []
        } as Ninho);
      }

      save(newDb);
    },
    [db, save]
  );

  const updateNinhoCasal = useCallback(
    (
      ninhoId: string,
      casalId: string
    ) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          n => n.id === ninhoId
        );

      if (ninho) {
        ninho.casalId = casalId;
        save(newDb);
      }
    },
    [db, save]
  );

  const updateNinho = useCallback(
    (
      ninhoId: string,
      field: keyof Ninho,
      value: any
    ) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          n => n.id === ninhoId
        );

      if (ninho) {
        (ninho as any)[field] = value;
        save(newDb);
      }
    },
    [db, save]
  );

  const updateCasal = useCallback(
    (
      casalId: string,
      field: keyof Casal,
      value: any
    ) => {
      const newDb = { ...db };

      const casal =
        newDb.casais.find(
          c => c.id === casalId
        );

      if (casal) {
        (casal as any)[field] = value;
        save(newDb);
      }
    },
    [db, save]
  );

  const deleteCasal = useCallback(
    (id: string) => {
      if (
        confirm(
          "Deseja realmente desfazer este casal?"
        )
      ) {
        const newDb = { ...db };

        newDb.casais =
          newDb.casais.filter(
            c => c.id !== id
          );

        newDb.ninhos.forEach(n => {
          if (n.casalId === id) {
            n.casalId = "";
          }
        });

        save(newDb);
      }
    },
    [db, save]
  );

  const deleteAve = useCallback(
    (id: string) => {
      if (
        confirm(
          "Deseja realmente excluir esta ave?"
        )
      ) {
        const newDb = { ...db };

        newDb.aves =
          newDb.aves.filter(
            a => a.id !== id
          );

        // Remove a ave dos casais
        newDb.casais =
          newDb.casais.filter(
            c =>
              c.mId !== id &&
              c.fId !== id
          );

        save(newDb);
      }
    },
    [db, save]
  );

  const deleteNinho = useCallback(
    (id: string) => {
      if (
        confirm(
          "Deseja realmente excluir este ninho e todos os ovos associados?"
        )
      ) {
        const newDb = { ...db };

        newDb.ninhos =
          newDb.ninhos.filter(
            n => n.id !== id
          );

        save(newDb);
      }
    },
    [db, save]
  );

  const addEgg = useCallback(
    (ninhoId: string) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          n => n.id === ninhoId
        );

      if (ninho) {
        const hoje =
          new Date()
            .toISOString()
            .split('T')[0];

        // Buscar espécie dos pais do casal
        let species =
          'Não especificado';

        const casal =
          newDb.casais.find(
            c =>
              c.id ===
              ninho.casalId
          );

        if (casal) {
          const pai =
            newDb.aves.find(
              a =>
                a.id ===
                casal.mId
            );

          const mae =
            newDb.aves.find(
              a =>
                a.id ===
                casal.fId
            );

          // Usar a espécie do pai como padrão, ou da mãe se o pai não tiver
          if (pai?.species) {
            species =
              pai.species;
          } else if (mae?.species) {
            species =
              mae.species;
          }
        }

        // ✨ Adicionar espécie à lista central se não existir
        if (
          species &&
          species !==
            'Não especificado' &&
          !newDb.config.especies.includes(
            species
          )
        ) {
          newDb.config.especies.push(
            species
          );

          console.log(
            '✅ Nova espécie adicionada automaticamente (ovo):',
            species
          );
        }

        ninho.eggs.push({
          id:
            Date.now().toString(),
          postura: hoje,
          status:
            "Em Espera",
          local: "ninho",
          species: species
        });

        save(newDb);
      }
    },
    [db, save]
  );

  const removeEgg = useCallback(
    (
      ninhoId: string,
      eggIdx: number
    ) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          n => n.id === ninhoId
        );

      if (ninho) {
        ninho.eggs.splice(
          eggIdx,
          1
        );

        save(newDb);
      }
    },
    [db, save]
  );

  const updateEgg = useCallback(
    (
      ninhoId: string,
      eggIdx: number,
      field: keyof Egg,
      value: string
    ) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          n => n.id === ninhoId
        );

      if (
        ninho &&
        ninho.eggs[eggIdx]
      ) {
        ninho.eggs[eggIdx][field] =
          value as any;

        // ✨ Se está atualizando a espécie, adicionar à lista central se não existir
        if (
          field === 'species' &&
          value &&
          value !==
            'Não especificado' &&
          !newDb.config.especies.includes(
            value
          )
        ) {
          newDb.config.especies.push(
            value
          );

          console.log(
            '✅ Nova espécie adicionada automaticamente (edição ovo):',
            value
          );
        }

        save(newDb);
      }
    },
    [db, save]
  );

  const eclodirOvo = useCallback(
    (
      ninhoId: string,
      eggIdx: number,
      dataEclosao: string
    ) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          n => n.id === ninhoId
        );

      if (
        ninho &&
        ninho.eggs[eggIdx]
      ) {
        ninho.eggs[eggIdx].status =
          'Eclodido';

        ninho.eggs[eggIdx].dataEclosao =
          dataEclosao;

        save(newDb);
      }
    },
    [db, save]
  );

  /*
   * ============================================================
   * ANILHAR FILHOTE
   * ============================================================
   *
   * NOVO FLUXO:
   *
   * Anilhar NÃO coloca mais o filhote no Plantel.
   *
   * Nesta etapa apenas registramos:
   * - que o filhote foi anilhado;
   * - número da anilha;
   * - ano da anilha.
   *
   * O filhote continua pertencendo ao ovo/ninho.
   *
   * A criação da ave no Plantel acontecerá somente quando
   * a função registrarSaidaDoNinho for chamada.
   */
  const anilharFilhote = useCallback(
    (
      ninhoId: string,
      eggIdx: number,
      anilha: string,
      anoAnilha: number
    ) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          n => n.id === ninhoId
        );

      if (
        !ninho ||
        !ninho.eggs[eggIdx]
      ) {
        return;
      }

      const egg =
        ninho.eggs[eggIdx];

      const anilhaLimpa =
        anilha.trim();

      /*
       * Se o usuário apagar completamente a anilha
       * durante a edição, o filhote volta para o estado
       * anterior: anilha pendente.
       *
       * Isso evita a necessidade de criar um botão
       * separado para "Desfazer anilhamento".
       */
      if (!anilhaLimpa) {
        /*
         * Se o filhote já saiu do ninho e já foi criado
         * no Plantel, não permitimos apagar a anilha,
         * pois isso quebraria o vínculo entre o ovo e a ave.
         */
        if (egg.filhoteId) {
          alert(
            'Este filhote já saiu do ninho e foi incluído no Plantel.\n\nA anilha não pode ser removida nesta etapa.'
          );
          return;
        }

        egg.filhoteAnilhado = false;
        delete egg.anilha;
        delete egg.anoAnilha;

        save(newDb);

        alert(
          'Anilhamento desfeito.\n\nO filhote voltou para o status "Anilha pendente".'
        );

        return;
      }

      // Registrar ou atualizar a anilha
      egg.filhoteAnilhado = true;
      egg.anilha = anilhaLimpa;
      egg.anoAnilha = anoAnilha;

      /*
       * IMPORTANTE:
       *
       * Não criamos a Ave aqui.
       * Não adicionamos ao Plantel.
       * Não criamos ainda o histórico do casal.
       *
       * Tudo isso será feito somente na saída efetiva
       * do ninho.
       */

      save(newDb);

      alert(
        'Filhote anilhado com sucesso!\n\n' +
        'O filhote continuará no ninho até que você registre a saída do ninho.'
      );
    },
    [db, save]
  );

  /*
   * ============================================================
   * REGISTRAR SAÍDA DO NINHO
   * ============================================================
   *
   * Esta é a segunda etapa.
   *
   * Ao confirmar a saída:
   *
   * 1. O filhote é criado no Plantel;
   * 2. Recebe status "Ativo";
   * 3. Mantém o vínculo com o ninho de origem;
   * 4. Mantém o vínculo com os pais biológicos;
   * 5. Mantém a informação de criação por amas;
   * 6. É registrado no histórico do casal;
   * 7. O ovo continua no ninho.
   *
   * A informação da data efetiva de saída é armazenada no próprio
   * registro do ovo usando a propriedade dataSaidaNinho.
   *
   * A propriedade dataSaidaNinho pertence ao registro do ovo.
   */
  const registrarSaidaDoNinho = useCallback(
    (
      ninhoId: string,
      eggIdx: number,
      dataSaidaNinho: string
    ) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          n => n.id === ninhoId
        );

      if (
        !ninho ||
        !ninho.eggs[eggIdx]
      ) {
        alert(
          'Não foi possível localizar o ovo.'
        );
        return;
      }

      const egg =
        ninho.eggs[eggIdx];

      // Só pode registrar saída depois de anilhar
      if (
        !egg.filhoteAnilhado ||
        !egg.anilha
      ) {
        alert(
          'Este filhote ainda não foi anilhado.\n\nAnilhe o filhote antes de registrar a saída do ninho.'
        );
        return;
      }

      // Evitar criar a mesma ave duas vezes
      if (egg.filhoteId) {
        alert(
          'A saída deste filhote já foi registrada.'
        );
        return;
      }

      // Buscar casal original / pais biológicos
      const casalOriginal =
        newDb.casais.find(
          c =>
            c.id ===
            ninho.casalId
        );

      // Verificar se foi criado por amas
      const criadoPorAmas =
        !!(
          egg.casalChocandoId &&
          egg.casalChocandoId !==
            ninho.casalId
        );

      /*
       * Criar a ave somente agora.
       *
       * Antes ela ficava no Plantel com status "No Ninho".
       * Agora a entrada no Plantel acontece somente após
       * a saída efetiva do ninho.
       */
      const novaAve: Ave = {
        id:
          Date.now().toString(),

        species:
          egg.species ||
          'Não especificado',

        ring:
          egg.anilha,

        ringYear:
          egg.anoAnilha!,

        name:
          `Filhote ${egg.anilha}`,

        sex:
          'Indefinido',

        status:
          'Ativo',

        creator:
          'Criação Própria',

        acqYear:
          egg.anoAnilha!,

        parentMaleId:
          casalOriginal?.mId,

        parentFemaleId:
          casalOriginal?.fId,

        birthDate:
          egg.dataEclosao,

        birthNestId:
          ninhoId,

        criadoPorAmas:
          criadoPorAmas,

        casalAmasId:
          criadoPorAmas
            ? egg.casalChocandoId
            : undefined
      };

      // Adicionar ao Plantel
      newDb.aves.push(
        novaAve
      );

      // Vincular o filhote ao registro do ovo
      egg.filhoteId =
        novaAve.id;

      /*
       * Registrar a data efetiva da saída do ninho.
       */
      egg.dataSaidaNinho =
        dataSaidaNinho;

      /*
       * Adicionar ao histórico do casal.
       *
       * O registro permanece no histórico mesmo depois que
       * o ninho deixar de aparecer na lista de ativos.
       */
      if (casalOriginal) {
        if (
          !casalOriginal.historico
        ) {
          casalOriginal.historico =
            [];
        }

        casalOriginal.historico.push({
          id:
            Date.now().toString() +
            '_hist',

          anilha:
            egg.anilha,

          anoAnilha:
            egg.anoAnilha!,

          aveId:
            novaAve.id,

          status:
            'Ativo'
        });
      }

      save(newDb);

      const mensagem =
        criadoPorAmas
          ? `Saída do ninho registrada com sucesso!\n\nFilhote ${egg.anilha} adicionado ao plantel.\nCriado por amas.`
          : `Saída do ninho registrada com sucesso!\n\nFilhote ${egg.anilha} adicionado ao plantel.`;

      alert(
        mensagem
      );
    },
    [db, save]
  );

  /**
   * Desfaz a saída do ninho e retorna o filhote ao passo anterior:
   *
   * Sair do ninho -> Anilhado / ainda no ninho.
   *
   * A ave criada no Plantel é removida, o vínculo filhoteId é desfeito,
   * a data de saída é removida e o registro correspondente do histórico
   * do casal é removido.
   *
   * A anilha permanece registrada, portanto o filhote volta para o estado
   * "Anilhado" e pode sair novamente do ninho quando necessário.
   */
  const desfazerSaidaDoNinho = useCallback(
    (
      ninhoId: string,
      eggIdx: number
    ) => {
      const newDb = { ...db };

      const ninho = newDb.ninhos.find(
        n => n.id === ninhoId
      );

      if (!ninho || !ninho.eggs[eggIdx]) {
        alert('Não foi possível localizar o ovo.');
        return;
      }

      const egg = ninho.eggs[eggIdx];

      if (!egg.filhoteId || !egg.dataSaidaNinho) {
        alert(
          'A saída deste filhote ainda não foi registrada.'
        );
        return;
      }

      const aveId = egg.filhoteId;

      // Localizar o casal original do ninho.
      const casalOriginal = newDb.casais.find(
        c => c.id === ninho.casalId
      );

      /*
       * Remover a ave criada no Plantel.
       *
       * Somente a ave vinculada a este ovo é removida.
       */
      newDb.aves = newDb.aves.filter(
        ave => ave.id !== aveId
      );

      /*
       * Remover do histórico do casal apenas o registro
       * correspondente a esta ave.
       */
      if (casalOriginal?.historico) {
        casalOriginal.historico =
          casalOriginal.historico.filter(
            filhote => filhote.aveId !== aveId
          );
      }

      /*
       * Retornar o ovo ao estado anterior à saída.
       *
       * A anilha NÃO é removida.
       * Portanto ele continua "Anilhado".
       */
      delete egg.filhoteId;
      delete egg.dataSaidaNinho;

      save(newDb);

      alert(
        'Saída do ninho desfeita com sucesso!\\n\\n' +
        'O filhote voltou para o ninho como anilhado e não está mais no Plantel.'
      );
    },
    [db, save]
  );

  const reverterEclosao = useCallback(
    (
      ninhoId: string,
      eggIdx: number
    ) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          n => n.id === ninhoId
        );

      if (
        ninho &&
        ninho.eggs[eggIdx]
      ) {
        const egg =
          ninho.eggs[eggIdx];

        // Se o filhote já foi criado no plantel,
        // remover a ave
        if (egg.filhoteId) {
          newDb.aves =
            newDb.aves.filter(
              a =>
                a.id !==
                egg.filhoteId
            );

          // Remover também do histórico dos pais
          const casalOriginal =
            newDb.casais.find(
              c =>
                c.id ===
                ninho.casalId
            );

          if (
            casalOriginal?.historico
          ) {
            casalOriginal.historico =
              casalOriginal.historico.filter(
                f =>
                  f.aveId !==
                  egg.filhoteId
              );
          }
        }

        // Reverter o status do ovo
        egg.status =
          'Fértil';

        egg.dataEclosao =
          null as any;

        egg.filhoteAnilhado =
          false;

        egg.anilha =
          null as any;

        egg.anoAnilha =
          null as any;

        egg.filhoteId =
          null as any;

        // Limpar data de saída, caso exista
        delete egg.dataSaidaNinho;

        save(newDb);
      }
    },
    [db, save]
  );

  const saveConfig = useCallback(
    (config: Config) => {
      const newDb = {
        ...db,
        config
      };

      save(newDb);
    },
    [db, save]
  );

  const saveBackupToGoogleDrive =
    useCallback(async () => {
      try {
        const accessToken =
          await obterTokenGoogle();

        const folderId =
          await buscarOuCriarPastaGoogleDrive(
            accessToken
          );

        const backupJson =
          JSON.stringify(db);

        const backupId =
          await buscarBackupGoogleDrive(
            accessToken,
            folderId
          );

        if (backupId) {
          await atualizarBackupGoogleDrive(
            accessToken,
            backupId,
            backupJson
          );
        } else {
          await criarBackupGoogleDrive(
            accessToken,
            folderId,
            backupJson
          );
        }

        const agora =
          new Date().toISOString();

        localStorage.setItem(
          'gpro_v19_lastGoogleDriveBackup',
          agora
        );

        localStorage.setItem(
          'gpro_v19_lastBackup',
          agora
        );

        setLastGoogleDriveBackup(
          agora
        );

        alert(
          'Backup salvo no Google Drive com sucesso!\n\nArquivo: backup.json\nPasta: GouldPRO'
        );
      } catch (error) {
        console.error(
          'Erro no backup do Google Drive:',
          error
        );

        const mensagem =
          error instanceof Error
            ? error.message
            : 'Erro desconhecido.';

        alert(
          `Não foi possível salvar o backup no Google Drive.\n\n${mensagem}`
        );
      }
    }, [db]);

  const importBackupFromGoogleDrive =
    useCallback(async () => {
      try {
        const accessToken =
          await obterTokenGoogle();

        const folderId =
          await buscarOuCriarPastaGoogleDrive(
            accessToken
          );

        const backupId =
          await buscarBackupGoogleDrive(
            accessToken,
            folderId
          );

        if (!backupId) {
          alert(
            'Nenhum backup.json foi encontrado na pasta GouldPRO do Google Drive.'
          );

          return;
        }

        const resposta =
          await fetch(
            `https://www.googleapis.com/drive/v3/files/${backupId}?alt=media`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

        if (!resposta.ok) {
          throw new Error(
            'Não foi possível baixar o backup do Google Drive.'
          );
        }

        const imported =
          await resposta.json();

        if (
          !imported ||
          !Array.isArray(
            imported.aves
          ) ||
          !Array.isArray(
            imported.casais
          ) ||
          !Array.isArray(
            imported.ninhos
          ) ||
          !imported.config ||
          !Array.isArray(
            imported.lancamentos
          )
        ) {
          throw new Error(
            'O backup encontrado não possui um formato válido do GouldPRO.'
          );
        }

        const confirmar =
          confirm(
            'ATENÇÃO: importar o backup do Google Drive substituirá os dados atuais deste navegador.\n\n' +
              `Backup encontrado: ${imported.aves.length} aves, ${imported.casais.length} casais e ${imported.ninhos.length} ninhos.\n\n` +
              'Deseja continuar?'
          );

        if (!confirmar)
          return;

        const newDb: Database = {
          aves:
            imported.aves,

          casais:
            imported.casais.map(
              (casal: Casal) => ({
                ...casal,
                historico:
                  casal.historico ||
                  []
              })
            ),

          ninhos:
            imported.ninhos,

          config:
            imported.config,

          lancamentos:
            imported.lancamentos
        };

        save(newDb);

        const agora =
          new Date().toISOString();

        localStorage.setItem(
          'gpro_v19_lastGoogleDriveImport',
          agora
        );

        alert(
          'Backup importado do Google Drive com sucesso! A página será recarregada.'
        );

        window.location.reload();
      } catch (error) {
        console.error(
          'Erro ao importar do Google Drive:',
          error
        );

        const mensagem =
          error instanceof Error
            ? error.message
            : 'Erro desconhecido.';

        alert(
          `Não foi possível importar o backup do Google Drive.\n\n${mensagem}`
        );
      }
    }, [save]);

  const exportBackup =
    useCallback(() => {
      const blob =
        new Blob(
          [JSON.stringify(db)],
          {
            type: 'application/json'
          }
        );

      const a =
        document.createElement(
          'a'
        );

      a.href =
        URL.createObjectURL(blob);

      const date =
        new Date()
          .toISOString()
          .split('T')[0];

      a.download =
        `backup_gpro_${date}.json`;

      a.click();

      // Registrar data do último backup
      localStorage.setItem(
        'gpro_v19_lastBackup',
        new Date().toISOString()
      );

      alert(
        'Backup realizado com sucesso!'
      );
    }, [db]);

  const importBackup =
    useCallback(
      (file: File) => {
        const reader =
          new FileReader();

        reader.onload = e => {
          try {
            const imported =
              JSON.parse(
                e.target?.result as string
              );

            const newDb = {
              ...db,
              ...imported
            };

            save(newDb);

            alert(
              "Backup Importado com Sucesso!"
            );
          } catch (err) {
            alert(
              "Erro ao importar arquivo."
            );
          }
        };

        reader.readAsText(file);
      },
      [db, save]
    );

  const clearEverything =
    useCallback(() => {
      if (
        confirm(
          "ATENÇÃO: Isso apagará TODOS os seus dados salvos!"
        )
      ) {
        localStorage.clear();
        window.location.reload();
      }
    }, []);

  const saveLancamento =
    useCallback(
      (
        lancamentoData: Omit<
          Lancamento,
          'id'
        >
      ) => {
        const newDb = {
          ...db,

          lancamentos: [
            ...db.lancamentos,
            {
              id:
                Date.now().toString(),
              ...lancamentoData
            }
          ]
        };

        save(newDb);
      },
      [db, save]
    );

  const deleteLancamento =
    useCallback(
      (id: string) => {
        const newDb = {
          ...db,

          lancamentos:
            db.lancamentos.filter(
              l =>
                l.id !== id
            )
        };

        save(newDb);
      },
      [db, save]
    );

  const deleteMultipleLancamentos =
    useCallback(
      (ids: string[]) => {
        const idsSet =
          new Set(ids);

        const newDb = {
          ...db,

          lancamentos:
            db.lancamentos.filter(
              l =>
                !idsSet.has(l.id)
            )
        };

        save(newDb);
      },
      [db, save]
    );

  const addFilhoteToHistorico =
    useCallback(
      (
        casalId: string,
        filhote: Omit<
          import('../App').Filhote,
          'id'
        >
      ) => {
        const newDb = {
          ...db
        };

        const casal =
          newDb.casais.find(
            c =>
              c.id === casalId
          );

        if (casal) {
          if (
            !casal.historico
          ) {
            casal.historico =
              [];
          }

          casal.historico.push({
            id:
              Date.now().toString(),
            ...filhote
          });

          save(newDb);
        }
      },
      [db, save]
    );

  const updateFilhoteHistorico =
    useCallback(
      (
        casalId: string,
        filhoteId: string,
        updates: Partial<
          import('../App').Filhote
        >
      ) => {
        const newDb = {
          ...db
        };

        const casal =
          newDb.casais.find(
            c =>
              c.id === casalId
          );

        if (
          casal &&
          casal.historico
        ) {
          const idx =
            casal.historico.findIndex(
              f =>
                f.id ===
                filhoteId
            );

          if (idx !== -1) {
            casal.historico[
              idx
            ] = {
              ...casal.historico[
                idx
              ],
              ...updates
            };

            save(newDb);
          }
        }
      },
      [db, save]
    );

  const deleteFilhoteHistorico =
    useCallback(
      (
        casalId: string,
        filhoteId: string
      ) => {
        const newDb = {
          ...db
        };

        const casal =
          newDb.casais.find(
            c =>
              c.id === casalId
          );

        if (
          casal &&
          casal.historico
        ) {
          casal.historico =
            casal.historico.filter(
              f =>
                f.id !==
                filhoteId
            );

          save(newDb);
        }
      },
      [db, save]
    );

  return {
    db,
    colorLists,

    saveAve,
    saveCasal,
    saveNinho,

    updateNinhoCasal,
    updateNinho,
    updateCasal,

    deleteCasal,
    deleteAve,
    deleteNinho,

    addEgg,
    removeEgg,
    updateEgg,

    eclodirOvo,
    anilharFilhote,
    registrarSaidaDoNinho,
    desfazerSaidaDoNinho,
    reverterEclosao,

    saveConfig,

    exportBackup,
    saveBackupToGoogleDrive,
    importBackupFromGoogleDrive,
    lastGoogleDriveBackup,
    importBackup,

    clearEverything,

    saveLancamento,
    deleteLancamento,
    deleteMultipleLancamentos,

    addFilhoteToHistorico,
    updateFilhoteHistorico,
    deleteFilhoteHistorico
  };
}

