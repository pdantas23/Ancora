// Vertente identifica de qual tabela o lead veio
export type Vertente = "Consórcio" | "Seguro";

export type LeadStatus =
  | "novo"
  | "em_atendimento"
  | "qualificado"
  | "proposta"
  | "fechado"
  | "perdido";

export const LEAD_STATUSES: LeadStatus[] = [
  "novo",
  "em_atendimento",
  "qualificado",
  "proposta",
  "fechado",
  "perdido",
];

// Tipo unificado — campos exclusivos de cada vertente são opcionais
export type Lead = {
  id: string;
  name: string;
  email: string;
  telefone: string | null;
  // Consórcio
  valor_simulado: number | null;
  // Seguro
  segmento: string | null;
  descricao: string | null;
  // Compartilhados
  origin: string | null;
  status: LeadStatus;
  created_at: string;
  // Campo virtual — derivado da tabela de origem, não existe no banco
  vertente: Vertente;
};

export type LeadMetrics = {
  total: number;
  novo: number;
  em_atendimento: number;
  qualificado: number;
  proposta: number;
  fechado: number;
  perdido: number;
};

export type ListLeadsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string[];
  origin?: string[];
  segment?: string[];
  vertente?: Vertente | "";
  sortBy?: "recent" | "oldest";
  dateFrom?: string;
  dateTo?: string;
};

export type ListLeadsResponse = {
  data: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  metrics: LeadMetrics;
  conversionRate: number;
};
