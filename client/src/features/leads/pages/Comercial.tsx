import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { listLeads, updateLeadStatus } from "@/features/leads/leadApi";
import { MessageCircle } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Lead, LeadStatus, ListLeadsResponse, Vertente } from "@/features/leads/leadTypes";

const LEADS_NAV = [
  { label: "Comercial", href: "/forms/comercial" },
  { label: "Marketing", href: "/forms/marketing" },
];

type Filters = {
  search: string;
  status: string[];
  origin: string[];
  vertente: Vertente | "";
  sortBy: "recent" | "oldest";
  dateFrom: string;
  dateTo: string;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  status: [],
  origin: [],
  vertente: "",
  sortBy: "recent",
  dateFrom: "",
  dateTo: "",
};

function formatBRL(value: number | null | undefined) {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getStatusLabel(status: LeadStatus) {
  const labels: Record<LeadStatus, string> = {
    novo: "Novo",
    em_atendimento: "Em atendimento",
    qualificado: "Qualificado",
    proposta: "Proposta",
    fechado: "Fechado",
    perdido: "Perdido",
  };
  return labels[status];
}

function getStatusColor(status: LeadStatus) {
  const colors: Record<LeadStatus, string> = {
    novo:           "bg-blue-50 text-blue-700 border border-blue-200",
    em_atendimento: "bg-amber-50 text-amber-700 border border-amber-200",
    qualificado:    "bg-violet-50 text-violet-700 border border-violet-200",
    proposta:       "bg-purple-50 text-purple-700 border border-purple-200",
    fechado:        "bg-emerald-50 text-emerald-700 border border-emerald-200",
    perdido:        "bg-red-50 text-red-700 border border-red-200",
  };
  return colors[status];
}

function getVertenteColor(vertente: Vertente) {
  return vertente === "Consórcio"
    ? "bg-blue-100 text-blue-800 border border-blue-300"
    : "bg-orange-100 text-orange-800 border border-orange-300";
}

function buildWhatsAppLink(lead: Lead) {
  if (!lead.telefone) return "";
  const digits = lead.telefone.replace(/\D/g, "");
  const phone = digits.startsWith("55") ? digits : `55${digits}`;
  const text = encodeURIComponent(`Olá, ${lead.name}! Aqui é da equipe Âncora.`);
  return `https://wa.me/${phone}?text=${text}`;
}

export default function Comercial() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    document.title = "Painel Comercial - Âncora";
  }, []);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const result: ListLeadsResponse = await listLeads({
          page,
          pageSize: limit,
          search: filters.search,
          status: filters.status,
          origin: filters.origin,
          vertente: filters.vertente,
          sortBy: filters.sortBy,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });
        setLeads(result.data);
        setTotal(result.total);
        setTotalPages(Math.max(1, result.totalPages));
      } catch {
        setErrorMessage("Não foi possível carregar os leads.");
        setLeads([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [page, limit, filters]);

  async function handleStatusChange(leadId: string, newStatus: LeadStatus) {
    try {
      await updateLeadStatus(leadId, newStatus);
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    } catch {
      console.error("Erro ao atualizar status.");
    }
  }

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  return (
    <DashboardLayout navItems={LEADS_NAV}>
      <div className="space-y-4 sm:space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Painel Comercial</h1>
          <p className="mt-1 text-sm text-slate-600">Gestão e acompanhamento dos leads Âncora — Consórcio e Seguro</p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Filtros */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="space-y-3">

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Buscar</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Nome ou email"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Data inicial</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  max={filters.dateTo || undefined}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Data final</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                  min={filters.dateFrom || undefined}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Vertente</label>
                <select
                  value={filters.vertente}
                  onChange={(e) => updateFilter("vertente", e.target.value as Filters["vertente"])}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">Todas</option>
                  <option value="Consórcio">Consórcio</option>
                  <option value="Seguro">Seguro</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Status</label>
                <select
                  value={filters.status[0] ?? ""}
                  onChange={(e) => updateFilter("status", e.target.value ? [e.target.value] : [])}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">Todos</option>
                  <option value="novo">Novo</option>
                  <option value="em_atendimento">Em atendimento</option>
                  <option value="qualificado">Qualificado</option>
                  <option value="proposta">Proposta</option>
                  <option value="fechado">Fechado</option>
                  <option value="perdido">Perdido</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Ordenação</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter("sortBy", e.target.value as Filters["sortBy"])}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-400"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="oldest">Mais antigos</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">&#8203;</label>
                <button
                  type="button"
                  onClick={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm bg-gray-400 text-slate-700 transition active:scale-95 cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Leads <span className="text-slate-400">({total})</span>
            </h2>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">Carregando leads...</div>
          ) : leads.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">Nenhum lead encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-center">
                <thead className="border-b bg-slate-50">
                  <tr>
                    {["Vertente", "Nome", "Email", "Telefone", "Segmento / Crédito", "Status", "Data", "Detalhes"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b transition hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${getVertenteColor(lead.vertente)}`}>
                          {lead.vertente}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">{lead.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{lead.email}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div className="flex items-center justify-center gap-2">
                          {lead.telefone ? (
                            <>
                              <a href={buildWhatsAppLink(lead)} target="_blank" rel="noreferrer"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                                title="WhatsApp">
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                              <span className="whitespace-nowrap">{lead.telefone}</span>
                            </>
                          ) : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {lead.vertente === "Consórcio"
                          ? <span className="font-semibold text-blue-700">{formatBRL(lead.valor_simulado)}</span>
                          : <span className="text-slate-600">{lead.segmento || "—"}</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                ← Anterior
              </button>
              <span className="text-sm text-slate-500">Página {page} de {totalPages}</span>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal detalhes */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900">Detalhes do lead</h3>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getVertenteColor(selectedLead.vertente)}`}>
                    {selectedLead.vertente}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Informações completas para atendimento</p>
              </div>
              <button type="button" onClick={() => setSelectedLead(null)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { label: "Nome",     value: selectedLead.name },
                { label: "Email",    value: selectedLead.email },
                { label: "Telefone", value: selectedLead.telefone || "—" },
                { label: "Origem",   value: selectedLead.origin || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-2 text-sm text-slate-900">{value}</p>
                </div>
              ))}

              {/* Campo exclusivo Consórcio */}
              {selectedLead.vertente === "Consórcio" && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Crédito simulado</p>
                  <p className="mt-2 text-sm font-semibold text-blue-700">{formatBRL(selectedLead.valor_simulado)}</p>
                </div>
              )}

              {/* Campos exclusivos Seguro */}
              {selectedLead.vertente === "Seguro" && (
                <>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Segmento</p>
                    <p className="mt-2 text-sm text-slate-900">{selectedLead.segmento || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mensagem</p>
                    <p className="mt-2 text-sm text-slate-900 leading-6">{selectedLead.descricao?.trim() || "—"}</p>
                  </div>
                </>
              )}

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                <div className="mt-2">
                  <Select
                    value={selectedLead.status}
                    onValueChange={(v) => handleStatusChange(selectedLead.id, v as LeadStatus)}
                  >
                    <SelectTrigger className="h-auto w-fit border-0 bg-transparent p-0 shadow-none focus:ring-0">
                      <SelectValue asChild>
                        <span className={`inline-flex cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(selectedLead.status)}`}>
                          {getStatusLabel(selectedLead.status)}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="em_atendimento">Em atendimento</SelectItem>
                      <SelectItem value="qualificado">Qualificado</SelectItem>
                      <SelectItem value="proposta">Proposta</SelectItem>
                      <SelectItem value="fechado">Fechado</SelectItem>
                      <SelectItem value="perdido">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Data de criação</p>
                <p className="mt-2 text-sm text-slate-900">
                  {new Date(selectedLead.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <a href={buildWhatsAppLink(selectedLead)} target="_blank" rel="noreferrer"
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${
                  selectedLead.telefone ? "bg-emerald-600 hover:bg-emerald-700" : "pointer-events-none bg-slate-300"
                }`}>
                Enviar mensagem no WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
