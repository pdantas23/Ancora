import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "../lib/supabase";

// ─── Tipos exportados ─────────────────────────────────────────────────────────
// AppRole é a fonte única de verdade para roles no servidor.
// requireAuth.ts e outros middlewares importam daqui.
export type AppRole = "admin" | "comercial" | "marketing";

export type UserProfile = {
  id: string;
  email: string | null;
  role: AppRole | null;
};

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginWithEmailAndPassword(
  email: string,
  password: string
) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    return {
      session: null,
      user: null,
      profile: null,
      error: error?.message || "Credenciais inválidas.",
    };
  }

  const profile = await getUserProfile(data.user.id);

  return {
    session: data.session,
    user: data.user,
    profile,
    error: null,
  };
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("profiles_ancora")
    .select("id, email, role")
    .eq("id", userId)
    .maybeSingle();

  console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
  console.log("USER ID:", userId);
  console.log("PROFILE DATA:", data);
  console.log("PROFILE ERROR:", error);

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    role: data.role,
  };
}

// ─── Validação de token ───────────────────────────────────────────────────────
export async function getUserFromAccessToken(accessToken: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) return null;

  const profile = await getUserProfile(data.user.id);

  return {
    user: data.user,
    profile,
  };
}