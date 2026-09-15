import React from "react";

interface BirdColorDiagramProps {
  corCabeca?: string;
  corPeito?: string;
  corDorso?: string;
  className?: string;
}

function obterCor(
  valor: string | undefined,
  corPadrao: string
): string {
  if (!valor || !valor.trim()) {
    return corPadrao;
  }

  const valorNormalizado = valor.trim().toLowerCase();

  const cores: Record<string, string> = {
    vermelho: "#E53935",
    vermelha: "#E53935",
    red: "#E53935",

    preto: "#202124",
    preta: "#202124",
    black: "#202124",

    roxo: "#9C6ADE",
    roxa: "#9C6ADE",
    purple: "#9C6ADE",

    azul: "#4285D4",
    azulada: "#4285D4",
    azulado: "#4285D4",
    blue: "#4285D4",

    verde: "#4CAF50",
    green: "#4CAF50",

    amarelo: "#F4D03F",
    amarela: "#F4D03F",
    yellow: "#F4D03F",

    branco: "#FFFFFF",
    branca: "#FFFFFF",
    white: "#FFFFFF",

    cinza: "#9E9E9E",
    cinzenta: "#9E9E9E",
    cinzento: "#9E9E9E",
    gray: "#9E9E9E",
    grey: "#9E9E9E",

    laranja: "#F39C12",
    orange: "#F39C12",

    rosa: "#EFA7C8",
    pink: "#EFA7C8",

    marrom: "#8D6E63",
    brown: "#8D6E63",

    creme: "#F5E6C8",
    cream: "#F5E6C8",

    lilas: "#B39DDB",
    lilás: "#B39DDB",

    turquesa: "#4DB6AC",
    turquoise: "#4DB6AC",
  };

  // Primeiro, verifica nomes de cores conhecidos.
  if (cores[valorNormalizado]) {
    return cores[valorNormalizado];
  }

  // Aceita hexadecimal curto ou completo.
  const hexadecimalValido =
    /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(valor.trim());

  if (hexadecimalValido) {
    return valor.trim();
  }

  // Mantém compatibilidade com outros valores CSS válidos.
  // Caso o valor seja um nome personalizado não convertido,
  // utiliza a cor padrão para evitar problemas no SVG.
  return corPadrao;
}

export function BirdColorDiagram({
  corCabeca,
  corPeito,
  corDorso,
  className = "",
}: BirdColorDiagramProps) {
  const corCabecaFinal = obterCor(corCabeca, "#E53935");
  const corPeitoFinal = obterCor(corPeito, "#9C6ADE");
  const corDorsoFinal = obterCor(corDorso, "#4CAF50");

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      aria-label="Representação visual das cores da ave"
    >
      <svg
        viewBox="0 0 420 430"
        width="100%"
        height="100%"
        role="img"
        aria-label="Diamante de Gould com regiões de cabeça, peito e dorso"
      >
        {/* CABEÇA */}
        <path
          d="M 83 112
             C 105 58, 185 35, 235 67
             C 265 86, 275 127, 258 166
             C 242 202, 204 220, 155 211
             C 113 204, 83 174, 83 112 Z"
          fill={corCabecaFinal}
          stroke="#202124"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* BICO */}
        <path
          d="M 83 112 L 35 142 L 83 169 L 102 143 Z"
          fill="#F5E6C8"
          stroke="#202124"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* OLHO */}
        <circle
          cx="177"
          cy="120"
          r="15"
          fill="#202124"
        />

        <circle
          cx="182"
          cy="115"
          r="4"
          fill="#FFFFFF"
        />

        {/* PEITO */}
        <path
          d="M 84 169
             C 78 217, 91 272, 128 310
             C 159 342, 203 348, 238 323
             C 260 307, 270 278, 260 242
             C 252 214, 237 190, 217 175
             C 180 201, 126 203, 84 169 Z"
          fill={corPeitoFinal}
          stroke="#202124"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* DORSO + ASAS + CAUDA */}
        <path
          d="M 235 67
             C 281 75, 313 111, 337 150
             C 365 195, 383 245, 394 302
             L 351 365
             L 315 313
             C 282 294, 252 269, 238 236
             C 222 199, 224 145, 235 67 Z"
          fill={corDorsoFinal}
          stroke="#202124"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* LINHA SIMPLES DA ASA */}
        <path
          d="M 244 224
             C 274 245, 306 266, 349 285"
          fill="none"
          stroke="#202124"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* BARRIGA — neutra, sem campo de cor */}
        <path
          d="M 128 310
             C 160 342, 205 348, 238 323
             C 266 343, 302 354, 332 345
             L 351 365
             C 302 388, 224 384, 169 353
             C 149 342, 136 327, 128 310 Z"
          fill="#FFFFFF"
          stroke="#202124"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* CAUDA — integrada ao dorso */}
        <path
          d="M 332 345 L 394 302 L 378 380 Z"
          fill={corDorsoFinal}
          stroke="#202124"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* PERNAS */}
        <path
          d="M 190 350 L 181 389
             M 265 360 L 253 397"
          fill="none"
          stroke="#D99A7A"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* PATAS */}
        <path
          d="M 181 389
             C 166 394, 154 402, 149 411
             M 181 389
             C 171 404, 170 414, 172 420
             M 181 389
             C 188 401, 198 405, 207 405

             M 253 397
             C 239 403, 229 411, 225 419
             M 253 397
             C 247 410, 247 419, 251 424
             M 253 397
             C 262 408, 272 411, 282 410"
          fill="none"
          stroke="#202124"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default BirdColorDiagram;
