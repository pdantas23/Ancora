import type { AppRole } from "@/features/auth/authTypes";

/**
 * Mapeamento de role → rota padrão após login.
 *
 * Altere este objeto ao adicionar novas roles ou módulos ao projeto.
 * O Login e outros redirecionamentos usam esta função — não precisam
 * conhecer as rotas diretamente.
 */
const ROLE_DEFAULT_ROUTES: Record<AppRole, string> = {
  admin:     "/comercial",
  comercial: "/comercial",
  marketing: "/marketing",
  // catalogo: "/catalogo",    ← adicione ao criar a feature
};

/**
 * Retorna a rota padrão para uma role.
 * Retorna "/" como fallback seguro se a role não estiver mapeada.
 */
export function getDefaultRouteByRole(role: AppRole | null | undefined): string {
  if (!role) return "/";
  return ROLE_DEFAULT_ROUTES[role] ?? "/";
}
