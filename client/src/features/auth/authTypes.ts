// ─── Roles ────────────────────────────────────────────────────────────────────
// "admin" é obrigatório em todos os projetos.
// Para adicionar roles, estenda este tipo em cada projeto:
//
//   import type { AppRole as BaseRole } from "@/features/auth/authTypes";
//   export type AppRole = BaseRole | "comercial" | "marketing" | "editor";
//
// Por ora declaramos aqui mesmo para manter o projeto compilável.
export type AppRole = "admin" | "comercial" | "marketing";

// ─── Usuário autenticado (retorno do Supabase) ─────────────────────────────
export type AuthUser = {
  id: string;
  email: string | null;
};

// ─── Perfil estendido (tabela profiles no Supabase) ─────────────────────────
export type UserProfile = {
  id: string;
  email: string;
  role: AppRole;
};

// ─── Resultado do login ────────────────────────────────────────────────────
export type LoginResult = {
  error: string | null;
  profile: UserProfile | null;
};

// ─── Contexto global de autenticação ────────────────────────────────────────
export type AuthContextType = {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};
