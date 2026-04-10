import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ─── Rotas base (núcleo fixo — não alterar entre projetos) ────────────────────
import authRouter from "./routes/authRoutes";

// ─── Features (adicione novos módulos aqui) ───────────────────────────────────
import leadsRouter from "./features/leads/leadsRoutes";
// import catalogRouter from "./features/catalog/catalogRoutes";   ← exemplo futuro
// import ordersRouter  from "./features/orders/ordersRoutes";     ← exemplo futuro

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// ─── Middlewares globais ──────────────────────────────────────────────────────

app.use(cors({
  origin: "https://ancoraprime.com",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  optionsSuccessStatus: 200 
}));
app.use(express.json());
app.use(cookieParser());

// ─── Registro de rotas ────────────────────────────────────────────────────────

app.use("/auth",       authRouter);
app.use("/api/leads",  leadsRouter);
// app.use("/api/catalog", catalogRouter);   ← descomente ao criar a feature
// app.use("/api/orders",  ordersRouter);

// ─── Servir frontend em produção ──────────────────────────────────────────────

if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001; // Permite que a Hostinger defina a porta
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
