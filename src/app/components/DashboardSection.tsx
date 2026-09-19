import React from "react";
import type { Ave, Casal, Ninho, Config, TabType } from "../App";

interface DashboardSectionProps {
  aves: Ave[];
  casais: Casal[];
  ninhos: Ninho[];
  config: Config;
  onNavigate: (tab: TabType) => void;
}

interface KpiCardProps {
  titulo: string;
  valor: number;
  icone: string;
  onClick: () => void;
}

function KpiCard({ titulo, valor, icone, onClick }: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Abrir ${titulo}`}
      style={{
        width: "100%",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "20px 22px",
        minHeight: 125,
        boxSizing: "border-box",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "left",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 5px 14px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#64748b",
          }}
        >
          {titulo}
        </span>

        <i
          className={`fas ${icone}`}
          style={{
            fontSize: 18,
            color: "#64748b",
          }}
        />
      </div>

      <div
        style={{
          fontSize: 32,
          lineHeight: 1,
          fontWeight: 700,
          color: "#1e293b",
          marginTop: 18,
        }}
      >
        {valor}
      </div>
    </button>
  );
}

export function DashboardSection({
  aves,
  casais,
  ninhos,
  config: _config,
  onNavigate,
}: DashboardSectionProps) {
  const avesAtivas = aves.filter(
    (ave) => ave.status === "Ativo" || ave.status === "No Ninho",
  ).length;

  const casaisAtivos = casais.length;

  const ninhosAtivos = ninhos.filter((ninho) => ninho.active).length;

  const ovos = ninhos.reduce(
    (total, ninho) =>
      total + (Array.isArray(ninho.eggs) ? ninho.eggs.length : 0),
    0,
  );

  const filhotes = casais.reduce(
    (total, casal) =>
      total + (Array.isArray(casal.historico) ? casal.historico.length : 0),
    0,
  );

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "24px",
      }}
    >
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            lineHeight: 1.2,
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          Visão geral
        </h1>

        <p
          style={{
            margin: "7px 0 0",
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Resumo do seu plantel e reprodução
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <KpiCard
          titulo="Aves ativas"
          valor={avesAtivas}
          icone="fa-dove"
          onClick={() => onNavigate("aves")}
        />

        <KpiCard
          titulo="Casais ativos"
          valor={casaisAtivos}
          icone="fa-heart"
          onClick={() => onNavigate("casais")}
        />

        <KpiCard
          titulo="Ninhos ativos"
          valor={ninhosAtivos}
          icone="fa-egg"
          onClick={() => onNavigate("ninhos")}
        />

        <KpiCard
          titulo="Ovos"
          valor={ovos}
          icone="fa-circle"
          onClick={() => onNavigate("ninhos")}
        />

        <KpiCard
          titulo="Filhotes"
          valor={filhotes}
          icone="fa-feather-alt"
          onClick={() => onNavigate("casais")}
        />
      </div>
    </div>
  );
}

export default DashboardSection;
