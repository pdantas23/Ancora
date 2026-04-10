import { createSupabaseAdminClient } from "../../lib/supabase";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../../shared/const";
import type {
  Lead,
  LeadStatus,
  LeadMetrics,
  ListLeadsParams,
  ListLeadsResponse,
  Vertente,
} from "./leadTypes";
import { LEAD_STATUSES } from "./leadTypes";

const TABLE_CONSORCIO = "leads_ancora_consorcio";
const TABLE_SEGURO    = "leads_ancora_seguro";

// ─── Helpers internos ────────────────────────────────────────────────────────

function applyFilters(query: any, params: ListLeadsParams) {
  const { search, status, origin, dateFrom, dateTo } = params;

  if (search?.trim()) {
    const s = search.trim();
    query = query.or(`name.ilike.*${s}*,email.ilike.*${s}*`);
  }
  if (status?.length)   query = query.in("status", status);
  if (origin?.length)   query = query.in("origin", origin);
  if (dateFrom)         query = query.gte("created_at", new Date(`${dateFrom}T00:00:00`).toISOString());
  if (dateTo)           query = query.lte("created_at", new Date(`${dateTo}T23:59:59.999`).toISOString());

  return query;
}

// Busca todos os registros de uma tabela com filtros (sem paginação — feita em memória)
async function fetchAllFromTable(
  table: string,
  vertente: Vertente,
  params: ListLeadsParams
): Promise<Lead[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from(table).select("*");
  query = applyFilters(query, params);

  // Segmento só existe na tabela de seguro
  if (table === TABLE_SEGURO && params.segment?.length) {
    query = query.in("segmento", params.segment);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Erro Supabase [${table}]:`, error);
    throw new Error(error.message);
  }

  // Injeta campo virtual vertente em cada lead
  return (data ?? []).map((row: any): Lead => ({
    id:             row.id,
    name:           row.name,
    email:          row.email,
    telefone:       row.telefone ?? null,
    valor_simulado: row.valor_simulado ?? null,
    segmento:       row.segmento ?? null,
    descricao:      row.descricao ?? null,
    origin:         row.origin ?? null,
    status:         row.status,
    created_at:     row.created_at,
    vertente,
  }));
}

// ─── Criar lead — Consórcio ──────────────────────────────────────────────────

export async function createLeadConsorcioService(data: {
  name: string;
  email: string;
  telefone: string;
  valor_simulado?: number;
}) {
  const supabase = createSupabaseAdminClient();

  const { data: lead, error } = await supabase
    .from(TABLE_CONSORCIO)
    .insert([{
      name:           data.name.trim(),
      email:          data.email.trim().toLowerCase(),
      telefone:       data.telefone.replace(/\D/g, ""),
      valor_simulado: data.valor_simulado ?? null,
      origin:         "",
      status:         "novo",
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return lead;
}

// ─── Criar lead — Seguro ─────────────────────────────────────────────────────

export async function createLeadSeguroService(data: {
  name: string;
  email: string;
  telefone: string;
  segmento: string;
  descricao: string;
}) {
  const supabase = createSupabaseAdminClient();

  const { data: lead, error } = await supabase
    .from(TABLE_SEGURO)
    .insert([{
      name:      data.name.trim(),
      email:     data.email.trim().toLowerCase(),
      telefone:  data.telefone.replace(/\D/g, ""),
      segmento:  data.segmento,
      descricao: data.descricao.trim(),
      origin:    "",
      status:    "novo",
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return lead;
}

// ─── Listar leads — unificado ─────────────────────────────────────────────────

export async function listLeadsService(
  params: ListLeadsParams
): Promise<ListLeadsResponse> {
  const page     = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(params.pageSize) || DEFAULT_PAGE_SIZE));

  // Decide quais tabelas consultar com base no filtro de vertente
  const vertenteFilter = params.vertente ?? "";

  const fetchConsorcio = !vertenteFilter || vertenteFilter === "Consórcio";
  const fetchSeguro    = !vertenteFilter || vertenteFilter === "Seguro";

  const [consorcioLeads, seguroLeads] = await Promise.all([
    fetchConsorcio ? fetchAllFromTable(TABLE_CONSORCIO, "Consórcio", params) : Promise.resolve([]),
    fetchSeguro    ? fetchAllFromTable(TABLE_SEGURO,    "Seguro",    params) : Promise.resolve([]),
  ]);

  // Mescla e ordena
  const allLeads = [...consorcioLeads, ...seguroLeads].sort((a, b) => {
    const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return params.sortBy === "oldest" ? -diff : diff;
  });

  const total      = allLeads.length;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const from       = (page - 1) * pageSize;
  const pagedLeads = allLeads.slice(from, from + pageSize);

  // Métricas calculadas sobre o total (não apenas a página)
  const metrics: LeadMetrics = {
    total,
    novo:           allLeads.filter((l) => l.status === "novo").length,
    em_atendimento: allLeads.filter((l) => l.status === "em_atendimento").length,
    qualificado:    allLeads.filter((l) => l.status === "qualificado").length,
    proposta:       allLeads.filter((l) => l.status === "proposta").length,
    fechado:        allLeads.filter((l) => l.status === "fechado").length,
    perdido:        allLeads.filter((l) => l.status === "perdido").length,
  };

  const conversionRate = total > 0 ? (metrics.fechado / total) * 100 : 0;

  return { data: pagedLeads, total, page, pageSize, totalPages, metrics, conversionRate };
}

// ─── Buscar por ID — tenta as duas tabelas ────────────────────────────────────

export async function getLeadByIdService(id: string): Promise<Lead> {
  const supabase = createSupabaseAdminClient();

  // Tenta consórcio primeiro
  const { data: consorcio, error: e1 } = await supabase
    .from(TABLE_CONSORCIO)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (consorcio) {
    return { ...consorcio, vertente: "Consórcio" } as Lead;
  }

  // Fallback: seguro
  const { data: seguro, error: e2 } = await supabase
    .from(TABLE_SEGURO)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (seguro) {
    return { ...seguro, vertente: "Seguro" } as Lead;
  }

  throw new Error(`Lead não encontrado: ${e1?.message ?? e2?.message ?? "id inexistente"}`);
}

// ─── Atualizar status — detecta tabela automaticamente ───────────────────────

export async function updateLeadStatusService(
  id: string,
  status: LeadStatus
): Promise<Lead> {
  if (!LEAD_STATUSES.includes(status)) {
    throw new Error(`Status inválido: "${status}".`);
  }

  const supabase = createSupabaseAdminClient();

  // Tenta consórcio
  const { data: existing } = await supabase
    .from(TABLE_CONSORCIO)
    .select("id")
    .eq("id", id)
    .maybeSingle();

  const table    = existing ? TABLE_CONSORCIO : TABLE_SEGURO;
  const vertente: Vertente = existing ? "Consórcio" : "Seguro";

  const { data, error } = await supabase
    .from(table)
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return { ...data, vertente } as Lead;
}
