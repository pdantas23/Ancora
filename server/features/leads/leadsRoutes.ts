import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import {
  createLeadConsorcioService,
  createLeadSeguroService,
  listLeadsService,
  getLeadByIdService,
  updateLeadStatusService,
} from "./leadService";
import type { Vertente } from "./leadTypes";

const router = Router();

// ─── Helper interno ───────────────────────────────────────────────────────────

function parseArrayParam(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch { return []; }
  }
  return [];
}

// ─── GET /api/leads ───────────────────────────────────────────────────────────
// Leitura unificada das duas tabelas. Acessível por admin, comercial e marketing.

router.get("/", requireAuth(["admin", "comercial", "marketing"]), async (req, res) => {
  try {
    const page     = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const search   = String(req.query.search ?? "");
    const sortBy   = req.query.sortBy === "oldest" ? "oldest" : "recent";
    const status   = parseArrayParam(req.query.status);
    const origin   = parseArrayParam(req.query.origin);
    const segment  = parseArrayParam(req.query.segment);
    const dateFrom = String(req.query.dateFrom ?? "");
    const dateTo   = String(req.query.dateTo ?? "");

    // Filtro de vertente: "Consórcio", "Seguro" ou "" (todos)
    const rawVertente = String(req.query.vertente ?? "");
    const vertente = (rawVertente === "Consórcio" || rawVertente === "Seguro")
      ? rawVertente as Vertente
      : "";

    const result = await listLeadsService({
      page, pageSize, search, sortBy, status, origin, segment, dateFrom, dateTo, vertente,
    });

    res.json(result);
  } catch (error) {
    console.error("Erro ao listar leads:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao listar leads" });
  }
});

// ─── GET /api/leads/:id ───────────────────────────────────────────────────────

router.get("/:id", requireAuth(["admin", "comercial", "marketing"]), async (req, res) => {
  try {
    const lead = await getLeadByIdService(req.params.id as string);
    res.json(lead);
  } catch (error) {
    console.error("Erro ao buscar lead:", error);
    res.status(404).json({ message: "Lead não encontrado" });
  }
});

// ─── PATCH /api/leads/:id/status ─────────────────────────────────────────────

router.patch("/:id/status", requireAuth(["admin", "comercial"]), async (req, res) => {
  try {
    const updatedLead = await updateLeadStatusService(req.params.id as string, req.body.status);
    res.json(updatedLead);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(400).json({ message: "Erro ao atualizar status" });
  }
});

// ─── POST /api/leads/consorcio ────────────────────────────────────────────────
// Público — chamado pela landing page de Consórcio

router.post("/consorcio", async (req, res) => {
  try {
    const { name, email, telefone, valor_simulado } = req.body;
    const lead = await createLeadConsorcioService({ name, email, telefone, valor_simulado });
    res.status(201).json(lead);
  } catch (error) {
    console.error("Erro ao criar lead consórcio:", error);
    res.status(500).json({ message: "Erro ao criar lead." });
  }
});

// ─── POST /api/leads/seguro ───────────────────────────────────────────────────
// Público — chamado pela landing page de Seguro

router.post("/seguro", async (req, res) => {
  try {
    const { name, email, telefone, segmento, descricao } = req.body;
    const lead = await createLeadSeguroService({ name, email, telefone, segmento, descricao });
    res.status(201).json(lead);
  } catch (error) {
    console.error("Erro ao criar lead seguro:", error);
    res.status(500).json({ message: "Erro ao criar lead." });
  }
});

export default router;
