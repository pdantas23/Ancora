import type {
  Lead,
  LeadStatus,
  ListLeadsParams,
  ListLeadsResponse,
} from "./leadTypes";

const API_URL = "https://api.ancoraprime.com";

// ─── Listar leads (unificado) ─────────────────────────────────────────────────

export async function listLeads(
  params: ListLeadsParams
): Promise<ListLeadsResponse> {
  const query = new URLSearchParams();

  query.set("page",     String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 20));
  query.set("search",   params.search ?? "");
  query.set("sortBy",   params.sortBy ?? "recent");
  query.set("status",   JSON.stringify(params.status ?? []));
  query.set("origin",   JSON.stringify(params.origin ?? []));
  query.set("segment",  JSON.stringify(params.segment ?? []));
  query.set("dateFrom", params.dateFrom ?? "");
  query.set("dateTo",   params.dateTo ?? "");
  query.set("vertente", params.vertente ?? "");

  const response = await fetch(`${API_URL}/api/leads?${query.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Não foi possível listar os leads. Status: ${response.status}. Resposta: ${rawText}`
    );
  }

  return JSON.parse(rawText) as ListLeadsResponse;
}

// ─── Buscar por ID ────────────────────────────────────────────────────────────

export async function getLeadById(id: string): Promise<Lead> {
  const response = await fetch(`${API_URL}/api/leads/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Não foi possível carregar o lead.");
  return response.json();
}

// ─── Atualizar status ─────────────────────────────────────────────────────────

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<Lead> {
  const response = await fetch(`${API_URL}/api/leads/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  if (!response.ok) throw new Error("Não foi possível atualizar o status.");
  return response.json();
}

// ─── Criar lead — Consórcio ───────────────────────────────────────────────────
// Chamado pela landing page /  (HomeConsorcio)

export async function createLeadConsorcio(data: {
  name: string;
  email: string;
  telefone: string;
  valor_simulado?: number;
}) {
  const response = await fetch(`${API_URL}/api/leads/consorcio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Erro ao enviar dados.");
  return response.json();
}

// ─── Criar lead — Seguro ──────────────────────────────────────────────────────
// Chamado pela landing page /seguros  (HomeSeguro)

export async function createLeadSeguro(data: {
  name: string;
  email: string;
  telefone: string;
  segmento: string;
  descricao: string;
}) {
  const response = await fetch(`${API_URL}/api/leads/seguro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Erro ao enviar orçamento.");
  return response.json();
}
