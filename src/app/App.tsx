import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { NinhosSection } from "./components/NinhosSection";
import { AvesSection } from "./components/AvesSection";
import { CasaisSection } from "./components/CasaisSection";
import { CalendarioSection } from "./components/CalendarioSection";
import { FinanceiroSection } from "./components/FinanceiroSection";
import { ConfigSection } from "./components/ConfigSection";
import { Modal } from "./components/Modal";
import { PhotoZoom } from "./components/PhotoZoom";
import { AveDetalhesModal } from "./components/AveDetalhesModal";
import { useDatabase } from "./hooks/useDatabase";

export type TabType =
  | "ninhos"
  | "aves"
  | "casais"
  | "calendario"
  | "financeiro"
  | "config";
export type ModalType = "ave" | "ninho" | "casal" | null;

export interface Ave {
  id: string;
  species: string;
  ring: string;
  ringYear: number;
  name: string;
  sex: "Macho" | "Fêmea" | "Indefinido";
  status: "Ativo" | "Vendido" | "Óbito" | "No Ninho";
  creator: string;
  acqYear: number;
  photo?: string;
  parentMaleId?: string; // Pai (sempre quem botou)
  parentFemaleId?: string; // Mãe (sempre quem botou)
  birthDate?: string; // Data de nascimento
  birthNestId?: string; // Ninho de origem
  criadoPorAmas?: boolean; // Se foi criado por amas
  casalAmasId?: string; // ID do casal de amas que criou
  corCabeca?: string; // Cor da cabeça
  corPeito?: string; // Cor do peito
  corDorso?: string; // Cor do dorso
}

export interface Filhote {
  id: string;
  anilha: string;
  anoAnilha: number;
  aveId?: string; // ID da ave no plantel
  dataVenda?: string;
  valorVenda?: number;
  comprador?: string;
  status: "Ativo" | "Vendido";
}

export interface Casal {
  id: string;
  mId: string;
  fId: string;
  cage: string;
  lastEggDate?: string; // Última postura
  historico: Filhote[]; // Histórico de filhotes
}

export interface Egg {
  id: string;
  postura: string; // Data de postura
  local?: "ninho" | "caixa"; // Local do ovo
  species?: string; // Espécie (herdada dos pais, mas editável)
  status:
    | "Em Espera"
    | "Chocando"
    | "Fértil"
    | "Infértil"
    | "Eclodido"
    | "Perdido";
  inicioChoca?: string; // Data início da choca
  casalChocandoId?: string; // Casal que está chocando (pode ser diferente do casal que botou)
  localChoca?: string; // Local onde está sendo chocado (se diferente do ninho original)
  dataEclosao?: string; // Data real de eclosão
  filhoteId?: string; // ID da ave se eclodiu
  filhoteAnilhado?: boolean; // Se já foi anilhado
  anilha?: string; // Número da anilha
  anoAnilha?: number; // Ano da anilha
}

export interface Ninho {
  id: string;
  name?: string; // Agora opcional
  casalId: string;
  eggs: Egg[];
  active: boolean;
}

export interface ParametrosEspecie {
  diasFertilidade: number; // Dias para verificar fertilidade
  duracaoChoca: number; // Dias de choca até eclosão
  diasSaidaNinho: number; // Dias até filhote sair do ninho
  diasAnilhamento: number; // Dias após eclosão para anilhar
}

export interface Config {
  prazoAlertaPostura: number; // Dias sem postura para alertar
  especies: string[]; // Lista de espécies cadastradas
  parametrosEspecies: {
    [especie: string]: ParametrosEspecie; // Parâmetros por espécie
  };
  parametrosPadrao: ParametrosEspecie; // Parâmetros padrão para espécies não configuradas
}

export interface Lancamento {
  id: string;
  tipo: "Receita" | "Despesa";
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  aveId?: string; // Se for venda de ave
  casalId?: string; // Associar ao casal
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("ninhos");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(
    null,
  );
  const [aveDetalheId, setAveDetalheId] = useState<
    string | null
  >(null);
  const {
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
    deleteFilhoteHistorico,
  } = useDatabase();

  const openModal = (
    type: ModalType,
    id: string | null = null,
  ) => {
    setModalType(type);
    setEditId(id);
  };

  const closeModal = () => {
    setModalType(null);
    setEditId(null);
  };

  // Mensagem antes de sair sugerindo backup
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Verificar se há dados para fazer backup
      if (
        db.aves.length > 0 ||
        db.casais.length > 0 ||
        db.ninhos.length > 0 ||
        db.lancamentos.length > 0
      ) {
        e.preventDefault();
        e.returnValue =
          "Você tem dados não salvos. Não se esqueça de fazer backup dos seus dados antes de sair!";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
    };
  }, [db]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onConfigClick={() => setActiveTab("config")} />
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 pb-32">
        {activeTab === "ninhos" && (
          <NinhosSection
            ninhos={db.ninhos}
            casais={db.casais}
            config={db.config}
            aves={db.aves}
            onOpenModal={openModal}
            onAddEgg={addEgg}
            onRemoveEgg={removeEgg}
            onUpdateEgg={updateEgg}
            onEclodirOvo={eclodirOvo}
            onAnilharFilhote={anilharFilhote}
            onReverterEclosao={reverterEclosao}
            onUpdateNinhoCasal={updateNinhoCasal}
            onUpdateNinho={updateNinho}
            onSaveCasal={saveCasal}
            onDeleteNinho={deleteNinho}
            onSaveConfig={saveConfig}
            onViewDetails={setAveDetalheId}
          />
        )}

        {activeTab === "aves" && (
          <AvesSection
            aves={db.aves}
            onOpenModal={openModal}
            onDeleteAve={deleteAve}
            onPhotoClick={setZoomPhoto}
            onViewDetails={setAveDetalheId}
          />
        )}

        {activeTab === "casais" && (
          <CasaisSection
            casais={db.casais}
            aves={db.aves}
            onOpenModal={openModal}
            onDeleteCasal={deleteCasal}
            onUpdateCasal={updateCasal}
            onAddFilhote={addFilhoteToHistorico}
            onUpdateFilhote={updateFilhoteHistorico}
            onDeleteFilhote={deleteFilhoteHistorico}
            onViewDetails={setAveDetalheId}
          />
        )}

        {activeTab === "calendario" && (
          <CalendarioSection
            aves={db.aves}
            casais={db.casais}
            ninhos={db.ninhos}
            config={db.config}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "financeiro" && (
          <FinanceiroSection
            lancamentos={db.lancamentos}
            onSaveLancamento={saveLancamento}
            onDeleteLancamento={deleteLancamento}
            onDeleteMultiple={deleteMultipleLancamentos}
          />
        )}

        {activeTab === "config" && (
          <ConfigSection
            config={db.config}
            onSaveConfig={saveConfig}
            onExport={exportBackup}
            onImport={importBackup}
            onClear={clearEverything}
            onRestoreBackup={(data) => {
              importBackup(
                new File(
                  [JSON.stringify(data)],
                  "restore.json",
                  { type: "application/json" },
                ),
              );
            }}
          />
        )}
      </main>

      {modalType && (
        <Modal
          type={modalType}
          editId={editId}
          aves={db.aves}
          casais={db.casais}
          colorLists={colorLists}
          config={db.config}
          onClose={closeModal}
          onSaveAve={saveAve}
          onSaveCasal={saveCasal}
          onSaveNinho={saveNinho}
          onUpdateNinhoCasal={updateNinhoCasal}
          onSaveConfig={saveConfig}
        />
      )}

      {zoomPhoto && (
        <PhotoZoom
          src={zoomPhoto}
          onClose={() => setZoomPhoto(null)}
        />
      )}

      {aveDetalheId && (
        <AveDetalhesModal
          ave={db.aves.find((a) => a.id === aveDetalheId)!}
          aves={db.aves}
          casais={db.casais}
          ninhos={db.ninhos}
          onClose={() => setAveDetalheId(null)}
          onNavigate={(id) => setAveDetalheId(id)}
          onPhotoClick={setZoomPhoto}
        />
      )}
    </div>
  );
}