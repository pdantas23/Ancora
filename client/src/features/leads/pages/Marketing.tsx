import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { listLeads } from "@/features/leads/leadApi";
import type { Lead, LeadMetrics, LeadStatus, Vertente } from "@/features/leads/leadTypes";

const LEADS_NAV = [
  { label: "Comercial", href: "/comercial" },
  { label: "Marketing", href: "/marketing" },
];

type Filters = {
  search: string;
  status: string;
  vertente: Vertente | "";
  sortBy: "recent" | "oldest";
  dateFrom: string;
  dateTo: string;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  status: "",
  vertente: "",
  sortBy: "recent",
  dateFrom: "",
  dateTo: "",
};

const DEFAULT_METRICS: LeadMetrics = {
  total: 0, novo: 0, em_atendimento: 0,
  qualificado: 0, proposta: 0, fechado: 0, perdido: 0,
};

function formatBRL(value: number | null | undefined) {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getStatusLabel(status: LeadStatus) {
  const labels: Record<LeadStatus, string> = {
    novo: "Novo", em_atendimento: "Em atendimento", qualificado: "Qualificado",
    proposta: "Proposta", fechado: "Fechado", perdido: "Perdido",
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

export default function Marketing() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    document.title = "Painel Marketing - Âncora";
  }, []);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [metrics, setMetrics] = useState<LeadMetrics>(DEFAULT_METRICS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    !!filters.search || !!filters.status || !!filters.vertente ||
    filters.sortBy !== "recent" || !!filters.dateFrom || !!filters.dateTo;

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const result = await listLeads({
          ...filters,
          status:   filters.status ? [filters.status] : [],
          origin:   [],
          vertente: filters.vertente,
          page,
          pageSize,
        });
        setLeads(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setMetrics(result.metrics);
      } catch {
        setErrorMessage("Não foi possível carregar os leads.");
        setLeads([]);
        setTotal(0);
        setMetrics(DEFAULT_METRICS);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [page, pageSize, filters]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function handleExportCSV() {
    if (leads.length === 0) return;
    setIsExporting(true);

    const headers = ["Vertente", "Nome", "Email", "Telefone", "Segmento", "Crédito Simulado", "Descrição", "Origem", "Status", "Data"];
    const rows = leads.map((l) => [
      l.vertente,
      l.name,
      l.email,
      l.telefone ?? "",
      l.segmento ?? "",
      l.valor_simulado != null ? String(l.valor_simulado) : "",
      l.descricao ?? "",
      l.origin ?? "",
      l.status,
      new Date(l.created_at).toLocaleDateString("pt-BR"),
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `leads_ancora_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  }

  return (
    <DashboardLayout navItems={LEADS_NAV}>
      <div className="space-y-4 sm:space-y-6">

        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-3xl">Painel Marketing</h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-base">
            Análise de leads e performance — Âncora Consórcio e Seguro
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
          {[
            { label: "Total",    value: metrics.total,          color: "border-slate-200 bg-slate-50",     text: "text-slate-700"  },
            { label: "Novos",    value: metrics.novo,           color: "border-blue-200 bg-blue-50",       text: "text-blue-700"   },
            { label: "Contato",  value: metrics.em_atendimento, color: "border-amber-300 bg-amber-50",     text: "text-amber-700"  },
            { label: "Qualif.",  value: metrics.qualificado,    color: "border-violet-200 bg-violet-50",   text: "text-violet-700" },
            { label: "Fechados", value: metrics.fechado,        color: "border-emerald-200 bg-emerald-50", text: "text-emerald-700"},
            { label: "Perdidos", value: metrics.perdido,        color: "border-red-200 bg-red-50",         text: "text-red-700"    },
          ].map(({ label, value, color, text }) => (
            <div key={label} className={`rounded-lg border px-3 py-3 ${color}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</p>
              <p className={`mt-1 text-base font-bold sm:text-xl ${text}`}>{value}</p>
            </div>
          ))}
        </div>
        
        {/* Filtros */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setFiltersOpen((p) => !p)}
            className="flex w-full items-center justify-between px-4 py-3 sm:hidden"
          >
            <span className="text-sm font-semibold text-slate-700">
              Filtros{hasActiveFilters && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">ativos</span>
              )}
            </span>
            <svg className={`h-4 w-4 text-slate-500 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`p-4 sm:block sm:p-6 ${filtersOpen ? "block" : "hidden"}`}>
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
                    value={filters.status}
                    onChange={(e) => updateFilter("status", e.target.value)}
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
        </div>

        {/* Tabela */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-slate-900 sm:text-lg">
              Leads <span className="text-slate-400">({total})</span>
            </h2>
            <div className="flex items-center gap-2">
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-400 sm:px-3 sm:text-sm">
                <option value={25}>25 / pág</option>
                <option value={50}>50 / pág</option>
                <option value={100}>100 / pág</option>
              </select>
              <button type="button" onClick={handleExportCSV} disabled={isExporting || leads.length === 0}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm">
                {isExporting ? "Exportando..." : "Exportar CSV"}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Carregando leads...</div>
          ) : leads.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">Nenhum lead encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-center">
                <thead className="border-b bg-slate-50">
                  <tr>
                    {["Vertente", "Nome", "Email", "Telefone", "Segmento / Crédito", "Status", "Origem", "Data"].map((h) => (
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
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{lead.telefone || "—"}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {lead.vertente === "Consórcio"
                          ? <span className="font-semibold text-blue-700">{formatBRL(lead.valor_simulado)}</span>
                          : <span className="text-slate-600">{lead.segmento || "—"}</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{lead.origin || "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 sm:px-6">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed sm:px-4 sm:text-sm">
                ← Anterior
              </button>
              <span className="text-xs text-slate-500 sm:text-sm">{page} / {totalPages}</span>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed sm:px-4 sm:text-sm">
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
