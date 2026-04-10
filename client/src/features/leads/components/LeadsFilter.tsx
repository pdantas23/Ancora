export type LeadsFilterState = {
  search: string;
  status: string[];
  origin: string[];
  segment: string[];
  favorite: boolean;
  sortBy: "recent" | "oldest";
};

type LeadsFilterProps = {
  filters: LeadsFilterState;
  onFiltersChange: (filters: LeadsFilterState) => void;
};

export default function LeadsFilter({
  filters,
  onFiltersChange,
}: LeadsFilterProps) {
  function updateField<K extends keyof LeadsFilterState>(
    field: K,
    value: LeadsFilterState[K]
  ) {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="xl:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Buscar
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => updateField("search", e.target.value)}
          placeholder="Nome, email ou empresa"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          value={filters.status[0] || ""}
          onChange={(e) =>
            updateField("status", e.target.value ? [e.target.value] : [])
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
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
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Origem
        </label>
        <select
          value={filters.origin[0] || ""}
          onChange={(e) =>
            updateField("origin", e.target.value ? [e.target.value] : [])
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="">Todas</option>
          <option value="Google">Google</option>
          <option value="Instagram">Instagram</option>
          <option value="Facebook">Facebook</option>
          <option value="Site">Site</option>
          <option value="WhatsApp">WhatsApp</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Ordenação
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            updateField("sortBy", e.target.value as "recent" | "oldest")
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="recent">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
        </select>
      </div>
    </div>
  );
}