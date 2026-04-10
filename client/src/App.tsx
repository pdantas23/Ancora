import { Route, Switch, Redirect } from "wouter";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import Catalog from "@/features/catalog/pages/Catalog";

// ─── Páginas base ─────────────────────────────────────────────────────────────
import HomeConsorcio from "@/pages/HomeConsorcio";
import HomeSeguro    from "@/pages/HomeSeguro";
import Login         from "@/pages/Login";
import NotFound      from "@/pages/NotFound";

// ─── Feature: Leads (painel unificado) ───────────────────────────────────────
import Comercial from "@/features/leads/pages/Comercial";
import Marketing from "@/features/leads/pages/Marketing";

export default function App() {
  return (
    <Switch>

      {/* ── Rotas públicas ──────────────────────────────────────────────────── */}
      <Route path="/">
        <Redirect to="/consorcio" />
      </Route>
      <Route path="/consorcio"        component={HomeConsorcio} />
      <Route path="/seguros" component={HomeSeguro}    />
      <Route path="/login"   component={Login}         />
      <Route path="/catalogo" component={Catalog}      />

      {/* ── Painel Comercial (unificado) ─────────────────────────────────────── */}
      <Route path="/comercial">
        <ProtectedRoute allowedRoles={["admin", "comercial"]}>
          <Comercial />
        </ProtectedRoute>
      </Route>

      {/* ── Painel Marketing (unificado) ─────────────────────────────────────── */}
      <Route path="/marketing">
        <ProtectedRoute allowedRoles={["admin", "marketing"]}>
          <Marketing />
        </ProtectedRoute>
      </Route>

      {/* ── Fallback 404 ─────────────────────────────────────────────────────── */}
      <Route component={NotFound} />

    </Switch>
  );
}
