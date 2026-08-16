import { useState, useEffect, useCallback } from 'react';
import type {
  Ave,
  Casal,
  Ninho,
  Egg,
  Config,
  Lancamento,
  ParametrosEspecie,
  Filhote
} from '../App';

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
  locaisOvos: [],
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

    // ============================================================
    // MIGRAÇÃO DE CONFIGURAÇÃO ANTIGA
    // ============================================================

    if (
      config.diasFertilidade !== undefined &&
      !config.parametrosPadrao
    ) {
      config = {
        prazoAlertaPostura:
          config.prazoAlertaPostura || 15,

        especies: [
          'Diamante de Gould',
          'Manon',
          'Canário',
          'Periquito',
          'Calopsita',
          'Agapornis'
        ],

        locaisOvos: [],

        parametrosEspecies: {},

        parametrosPadrao: {
          diasFertilidade:
            config.diasFertilidade || 7,

          duracaoChoca:
            config.duracaoChoca || 14,

          diasSaidaNinho:
            config.diasSaidaNinho || 30,

          diasAnilhamento:
            config.diasAnilhamento || 7
        }
      };

      localStorage.setItem(
        'gpro_v19_config',
        JSON.stringify(config)
      );
    }

    // ============================================================
    // GARANTIR QUE ESPECIES EXISTA
    // ============================================================

    if (!Array.isArray(config.especies)) {
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

    // ============================================================
    // GARANTIR QUE LOCAIS DE OVOS EXISTA
    // ============================================================

    if (!Array.isArray(config.locaisOvos)) {
      config.locaisOvos = [];

      localStorage.setItem(
        'gpro_v19_config',
        JSON.stringify(config)
      );
    }

    // ============================================================
    // GARANTIR PARAMETROS PADRÃO
    // ============================================================

    if (!config.parametrosEspecies) {
      config.parametrosEspecies = {};
    }

    if (!config.parametrosPadrao) {
      config.parametrosPadrao = defaultParametros;
    }

    // ============================================================
    // SINCRONIZAR ESPÉCIES EXISTENTES NAS AVES E OVOS
    // ============================================================

    const especiesExistentes = new Set<string>(
      config.especies || []
    );

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

    // ============================================================
    // MIGRAR CASAIS PARA INCLUIR HISTORICO
    // ============================================================

    const casaisMigrados = casais.map(
      (casal: Casal) => ({
        ...casal,
        historico: casal.historico || []
      })
    );

    // ============================================================
    // GARANTIR ESTRUTURA DOS NINHOS
    // ============================================================

    const ninhosMigrados = ninhos.map(
      (ninho: Ninho) => ({
        ...ninho,
        eggs: Array.isArray(ninho.eggs)
          ? ninho.eggs
          : []
      })
    );

    // ============================================================
    // FINALIZAR CARREGAMENTO
    // ============================================================

    setDb({
      aves,
      casais: casaisMigrados,
      ninhos: ninhosMigrados,
      config,
      lancamentos
    });

    setColorLists(savedColors);
  }, []);

  // ==============================================================
  // SAVE TO LOCALSTORAGE
  // ==============================================================

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
        localStorage.getItem(
          'gpro_v19_editCount'
        ) || '0'
      ) + 1;

    localStorage.setItem(
      'gpro_v19_editCount',
      editCount.toString()
    );

    // A cada 10 edições, alertar para fazer backup
    if (editCount % 10 === 0) {
      const lastBackup =
        localStorage.getItem(
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
        if (
          confirm(
            message +
              '\n\nDeseja fazer backup agora?'
          )
        ) {
          const blob = new Blob(
            [JSON.stringify(newDb)],
            {
              type: 'application/json'
            }
          );

          const a =
            document.createElement('a');

          a.href =
            URL.createObjectURL(blob);

          a.download = `backup_gpro_${new Date()
            .toISOString()
            .split('T')[0]}.json`;

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

  // ==============================================================
  // AVES
  // ==============================================================

  const saveAve = useCallback(
    (
      aveData: Partial<Ave>,
      editId: string | null
    ) => {
      const newDb = { ...db };

      if (editId) {
        const idx =
          newDb.aves.findIndex(
            (a) => a.id === editId
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

      // Adicionar espécie à lista central
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

        setColorLists(
          newColorLists
        );
      }

      save(newDb);
    },
    [db, save, colorLists]
  );

  // ==============================================================
  // CASAIS
  // ==============================================================

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

  // ==============================================================
  // NINHOS
  // ==============================================================

  const saveNinho = useCallback(
    (
      ninho: Partial<Ninho> & {
        id?: string;
      }
    ) => {
      const newDb = { ...db };

      if (ninho.id) {
        const idx =
          newDb.ninhos.findIndex(
            (n) => n.id === ninho.id
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
          casalId:
            ninho.casalId || '',
          eggs: [],
          active: true
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
          (n) => n.id === ninhoId
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
          (n) => n.id === ninhoId
        );

      if (ninho) {
        (ninho as any)[field] =
          value;

        save(newDb);
      }
    },
    [db, save]
  );

  // ==============================================================
  // CASAIS - ATUALIZAÇÃO
  // ==============================================================

  const updateCasal = useCallback(
    (
      casalId: string,
      field: keyof Casal,
      value: any
    ) => {
      const newDb = { ...db };

      const casal =
        newDb.casais.find(
          (c) => c.id === casalId
        );

      if (casal) {
        (casal as any)[field] =
          value;

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
            (c) => c.id !== id
          );

        newDb.ninhos.forEach(
          (n) => {
            if (n.casalId === id) {
              n.casalId = "";
            }
          }
        );

        save(newDb);
      }
    },
    [db, save]
  );

  // ==============================================================
  // AVES - EXCLUSÃO
  // ==============================================================

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
            (a) => a.id !== id
          );

        // Remove a ave dos casais
        newDb.casais =
          newDb.casais.filter(
            (c) =>
              c.mId !== id &&
              c.fId !== id
          );

        save(newDb);
      }
    },
    [db, save]
  );

  // ==============================================================
  // NINHOS - EXCLUSÃO
  // ==============================================================

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
            (n) => n.id !== id
          );

        save(newDb);
      }
    },
    [db, save]
  );

  // ==============================================================
  // OVOS - ADICIONAR
  // ==============================================================

  const addEgg = useCallback(
    (ninhoId: string) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          (n) => n.id === ninhoId
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
            (c) =>
              c.id === ninho.casalId
          );

        if (casal) {
          const pai =
            newDb.aves.find(
              (a) =>
                a.id === casal.mId
            );

          const mae =
            newDb.aves.find(
              (a) =>
                a.id === casal.fId
            );

          // Usar espécie do pai como padrão,
          // ou da mãe se o pai não tiver
          if (pai?.species) {
            species =
              pai.species;
          } else if (mae?.species) {
            species =
              mae.species;
          }
        }

        // Adicionar espécie à lista central
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

        // Novo ovo começa sem local definido.
        // O local será escolhido na aba Ninhos.
        ninho.eggs.push({
          id: Date.now().toString(),
          postura: hoje,
          status: 'Em Espera',
          local: '',
          species: species
        });

        save(newDb);
      }
    },
    [db, save]
  );

  // ==============================================================
  // OVOS - REMOVER
  // ==============================================================

  const removeEgg = useCallback(
    (
      ninhoId: string,
      eggIdx: number
    ) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          (n) => n.id === ninhoId
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

  // ==============================================================
  // OVOS - ATUALIZAR
  // ==============================================================

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
          (n) => n.id === ninhoId
        );

      if (
        ninho &&
        ninho.eggs[eggIdx]
      ) {
        ninho.eggs[eggIdx][field] =
          value as any;

        // Se está atualizando a espécie,
        // adicionar à lista central
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

  // ==============================================================
  // ECLOSÃO
  // ==============================================================

  const eclodirOvo = useCallback(
    (
      ninhoId: string,
      eggIdx: number,
      dataEclosao: string
    ) => {
      const newDb = { ...db };

      const ninho =
        newDb.ninhos.find(
          (n) => n.id === ninhoId
        );

      if (
        ninho &&
        ninho.eggs[eggIdx]
      ) {
        ninho.eggs[
          eggIdx
        ].status = 'Eclodido';

        ninho.eggs[
          eggIdx
        ].dataEclosao =
          dataEclosao;

        save(newDb);
      }
    },
    [db, save]
  );

  // ==============================================================
  // ANILHAMENTO
  // ==============================================================

  const anilharFilhote =
    useCallback(
      (
        ninhoId: string,
        eggIdx: number,
        anilha: string,
        anoAnilha: number
      ) => {
        const newDb = { ...db };

        const ninho =
          newDb.ninhos.find(
            (n) =>
              n.id === ninhoId
          );

        if (
          ninho &&
          ninho.eggs[eggIdx]
        ) {
          const egg =
            ninho.eggs[eggIdx];

          // Marcar como anilhado
          egg.filhoteAnilhado =
            true;

          egg.anilha =
            anilha;

          egg.anoAnilha =
            anoAnilha;

          // Buscar casal original
          // (pais biológicos)
          const casalOriginal =
            newDb.casais.find(
              (c) =>
                c.id ===
                ninho.casalId
            );

          // Verificar se foi criado por amas
          const criadoPorAmas =
            egg.casalChocandoId &&
            egg.casalChocandoId !==
              ninho.casalId;

          // Criar ave no plantel
          const novaAve: Ave = {
            id: Date.now().toString(),
            species:
              egg.species ||
              'Não especificado',

            ring: anilha,

            ringYear:
              anoAnilha,

            name:
              `Filhote ${anilha}`,

            sex: 'Indefinido',

            status: 'No Ninho',

            creator:
              'Criação Própria',

            acqYear:
              anoAnilha,

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

          newDb.aves.push(
            novaAve
          );

          egg.filhoteId =
            novaAve.id;

          // Adicionar ao histórico do casal
          if (casalOriginal) {
            if (
              !casalOriginal.historico
            ) {
              casalOriginal.historico =
                [];
            }

            casalOriginal.historico.push(
              {
                id:
                  Date.now().toString() +
                  '_hist',

                anilha,

                anoAnilha,

                aveId:
                  novaAve.id,

                status:
                  'Ativo'
              }
            );
          }

          save(newDb);

          const mensagem =
            criadoPorAmas
              ? `Filhote anilhado com sucesso! Adicionado ao plantel com status "No Ninho". Criado por amas.`
              : `Filhote anilhado com sucesso! Adicionado ao plantel com status "No Ninho".`;

          alert(
            mensagem
          );
        }
      },
      [db, save]
    );

  // ==============================================================
  // REVERTER ECLOSÃO
  // ==============================================================

  const reverterEclosao =
    useCallback(
      (
        ninhoId: string,
        eggIdx: number
      ) => {
        const newDb = { ...db };

        const ninho =
          newDb.ninhos.find(
            (n) =>
              n.id === ninhoId
          );

        if (
          ninho &&
          ninho.eggs[eggIdx]
        ) {
          const egg =
            ninho.eggs[eggIdx];

          // Se o filhote foi anilhado,
          // remover a ave do plantel
          if (egg.filhoteId) {
            newDb.aves =
              newDb.aves.filter(
                (a) =>
                  a.id !==
                  egg.filhoteId
              );
          }

          // Reverter status
          egg.status =
            'Fértil';

          egg.dataEclosao =
            undefined;

          egg.filhoteAnilhado =
            false;

          egg.anilha =
            undefined;

          egg.anoAnilha =
            undefined;

          egg.filhoteId =
            undefined;

          save(newDb);
        }
      },
      [db, save]
    );

  // ==============================================================
  // CONFIGURAÇÃO
  // ==============================================================

  const saveConfig = useCallback(
    (config: Config) => {
      const configSegura: Config = {
        ...config,

        // Garantir que locaisOvos sempre seja um array
        locaisOvos:
          Array.isArray(
            config.locaisOvos
          )
            ? config.locaisOvos
            : [],

        // Garantir estrutura das espécies
        especies:
          Array.isArray(
            config.especies
          )
            ? config.especies
            : [],

        parametrosEspecies:
          config.parametrosEspecies ||
          {},

        parametrosPadrao:
          config.parametrosPadrao ||
          defaultParametros
      };

      const newDb = {
        ...db,
        config: configSegura
      };

      save(newDb);
    },
    [db, save]
  );

  // ==============================================================
  // BACKUP - EXPORTAR
  // ==============================================================

  const exportBackup =
    useCallback(() => {
      const blob = new Blob(
        [JSON.stringify(db)],
        {
          type: 'application/json'
        }
      );

      const a =
        document.createElement('a');

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

  // ==============================================================
  // BACKUP - IMPORTAR
  // ==============================================================

  const importBackup =
    useCallback(
      (file: File) => {
        const reader =
          new FileReader();

        reader.onload = (e) => {
          try {
            const imported =
              JSON.parse(
                e.target?.result as string
              );

            const configImportada =
              imported.config || {};

            const configNormalizada: Config =
              {
                ...defaultConfig,
                ...configImportada,

                especies:
                  Array.isArray(
                    configImportada.especies
                  )
                    ? configImportada.especies
                    : defaultConfig.especies,

                locaisOvos:
                  Array.isArray(
                    configImportada.locaisOvos
                  )
                    ? configImportada.locaisOvos
                    : [],

                parametrosEspecies:
                  configImportada.parametrosEspecies ||
                  {},

                parametrosPadrao:
                  configImportada.parametrosPadrao ||
                  defaultParametros
              };

            const newDb: Database = {
              ...db,
              ...imported,
              config:
                configNormalizada
            };

            save(newDb);

            alert(
              "Backup Importado com Sucesso!"
            );
          } catch (err) {
            console.error(
              err
            );

            alert(
              "Erro ao importar arquivo."
            );
          }
        };

        reader.readAsText(file);
      },
      [db, save]
    );

  // ==============================================================
  // LIMPAR TUDO
  // ==============================================================

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

  // ==============================================================
  // FINANCEIRO
  // ==============================================================

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
              (l) => l.id !== id
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
              (l) =>
                !idsSet.has(l.id)
            )
        };

        save(newDb);
      },
      [db, save]
    );

  // ==============================================================
  // HISTÓRICO DE FILHOTES
  // ==============================================================

  const addFilhoteToHistorico =
    useCallback(
      (
        casalId: string,
        filhote: Omit<
          Filhote,
          'id'
        >
      ) => {
        const newDb = {
          ...db
        };

        const casal =
          newDb.casais.find(
            (c) =>
              c.id === casalId
          );

        if (casal) {
          if (
            !casal.historico
          ) {
            casal.historico =
              [];
          }

          casal.historico.push(
            {
              id:
                Date.now().toString(),

              ...filhote
            }
          );

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
        updates: Partial<Filhote>
      ) => {
        const newDb = {
          ...db
        };

        const casal =
          newDb.casais.find(
            (c) =>
              c.id === casalId
          );

        if (
          casal &&
          casal.historico
        ) {
          const idx =
            casal.historico.findIndex(
              (f) =>
                f.id ===
                filhoteId
            );

          if (idx !== -1) {
            casal.historico[idx] =
              {
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
            (c) =>
              c.id === casalId
          );

        if (
          casal &&
          casal.historico
        ) {
          casal.historico =
            casal.historico.filter(
              (f) =>
                f.id !==
                filhoteId
            );

          save(newDb);
        }
      },
      [db, save]
    );

  // ==============================================================
  // RETORNO
  // ==============================================================

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
    reverterEclosao,

    saveConfig,

    exportBackup,
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
