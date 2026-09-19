import React from "react";
import type { Ave, Casal, Ninho, Config } from "../App";

interface DashboardSectionProps {
  aves: Ave[];
  casais: Casal[];
  ninhos: Ninho[];
  config: Config;
}

interface KpiCardProps {
  titulo: string;
  valor: number;
  icone: string;
}

function KpiCard({ titulo, valor, icone }: KpiCardProps) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", minHeight: 125, boxSizing: "border-box", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>{titulo}</span>
        <i className={`fas ${icone}`} style={{ fontSize: 18, color: "#64748b" }} />
      </div>
      <div style={{ fontSize: 32, lineHeight: 1, fontWeight: 700, color: "#1e293b", marginTop: 18 }}>{valor}</div>
    </div>
  );
}

export function DashboardSection({ aves, casais, ninhos, config: _config }: DashboardSectionProps) {
  const avesAtivas = aves.filter((ave) => {
    const status = String((ave as any).status ?? "").toLowerCase();
    return status !== "morta" && status !== "óbito" && status !== "obito";
  }).length;

  const casaisAtivos = casais.filter((casal) => {
    const status = String((casal as any).status ?? "").toLowerCase();
    return status !== "inativo" && status !== "encerrado";
  }).length;

  const ninhosAtivos = ninhos.filter((ninho) => {
    const status = String((ninho as any).status ?? "").toLowerCase();
    return status !== "inativo" && status !== "encerrado";
  }).length;

  const ovos = ninhos.reduce((total, ninho) => total + (Array.isArray(ninho.ovos) ? ninho.ovos.length : 0), 0);

  const filhotes = casais.reduce((total, casal) => {
    const historico = (casal as any).historicoFilhotes;
    if (Array.isArray(historico)) return total + historico.length;
    const filhotesDoCasal = (casal as any).filhotes;
    if (Array.isArray(filhotesDoCasal)) return total + filhotesDoCasal.length;
    return total;
  }, 0);

  return (
    <div style={{ width: "100%", boxSizing: "border-box", padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 700, color: "#1e293b" }}>Visão geral</h1>
        <p style={{ margin: "7px 0 0", fontSize: 14, color: "#64748b" }}>Resumo do seu plantel e reprodução</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 16 }}>
        <KpiCard titulo="Aves ativas" valor={avesAtivas} icone="fa-dove" />
        <KpiCard titulo="Casais ativos" valor={casaisAtivos} icone="fa-heart" />
        <KpiCard titulo="Ninhos ativos" valor={ninhosAtivos} icone="fa-egg" />
        <KpiCard titulo="Ovos" valor={ovos} icone="fa-circle" />
        <KpiCard titulo="Filhotes" valor={filhotes} icone="fa-feather-alt" />
      </div>
    </div>
  );
}

export default DashboardSection;
