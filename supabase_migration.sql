-- ============================================================
--  ÂNCORA — Migration de unificação (Consórcio + Seguro)
--  Execute no SQL Editor do painel Supabase.
--
--  O que este script faz:
--    1. Cria a tabela de leads do Consórcio  (leads_ancora_consorcio)
--    2. Cria a tabela de leads do Seguro     (leads_ancora_seguro)
--    3. Cria/garante a tabela de perfis      (profiles_ancora) com role
--    4. Configura RLS e políticas em todas as tabelas
--    5. Cria trigger de sincronização de perfil no cadastro de usuário
--
--  Idempotente: pode ser re-executado sem erros (IF NOT EXISTS / OR REPLACE).
-- ============================================================

-- Extensão UUID (habilitada por padrão no Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
--  1. TABELA DE LEADS — CONSÓRCIO
--     Nome: leads_ancora_consorcio
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.leads_ancora_consorcio (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT          NOT NULL,
  email          TEXT          NOT NULL,
  telefone       TEXT,
  valor_simulado NUMERIC(12,2),
  origin         TEXT          DEFAULT '',
  status         TEXT          NOT NULL DEFAULT 'novo',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads_ancora_consorcio
  DROP CONSTRAINT IF EXISTS leads_ancora_consorcio_status_check;
ALTER TABLE public.leads_ancora_consorcio
  ADD CONSTRAINT leads_ancora_consorcio_status_check
  CHECK (status IN ('novo','em_atendimento','qualificado','proposta','fechado','perdido'));

CREATE INDEX IF NOT EXISTS leads_ancora_consorcio_email_idx      ON public.leads_ancora_consorcio (email);
CREATE INDEX IF NOT EXISTS leads_ancora_consorcio_status_idx     ON public.leads_ancora_consorcio (status);
CREATE INDEX IF NOT EXISTS leads_ancora_consorcio_created_at_idx ON public.leads_ancora_consorcio (created_at DESC);

ALTER TABLE public.leads_ancora_consorcio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_ancora_consorcio_service_role_all" ON public.leads_ancora_consorcio;
CREATE POLICY "leads_ancora_consorcio_service_role_all" ON public.leads_ancora_consorcio
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "leads_ancora_consorcio_anon_insert" ON public.leads_ancora_consorcio;
CREATE POLICY "leads_ancora_consorcio_anon_insert" ON public.leads_ancora_consorcio
  FOR INSERT TO anon WITH CHECK (true);

COMMENT ON TABLE  public.leads_ancora_consorcio IS 'Leads captados pela landing page de Consórcio Âncora';
COMMENT ON COLUMN public.leads_ancora_consorcio.valor_simulado IS 'Valor de crédito selecionado no simulador (R$)';
COMMENT ON COLUMN public.leads_ancora_consorcio.status IS 'novo | em_atendimento | qualificado | proposta | fechado | perdido';

-- ─────────────────────────────────────────────────────────────
--  2. TABELA DE LEADS — SEGURO
--     Nome: leads_ancora_seguro
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.leads_ancora_seguro (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  telefone   TEXT,
  segmento   TEXT,
  descricao  TEXT,
  origin     TEXT        DEFAULT '',
  status     TEXT        NOT NULL DEFAULT 'novo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads_ancora_seguro
  DROP CONSTRAINT IF EXISTS leads_ancora_seguro_status_check;
ALTER TABLE public.leads_ancora_seguro
  ADD CONSTRAINT leads_ancora_seguro_status_check
  CHECK (status IN ('novo','em_atendimento','qualificado','proposta','fechado','perdido'));

CREATE INDEX IF NOT EXISTS leads_ancora_seguro_email_idx      ON public.leads_ancora_seguro (email);
CREATE INDEX IF NOT EXISTS leads_ancora_seguro_status_idx     ON public.leads_ancora_seguro (status);
CREATE INDEX IF NOT EXISTS leads_ancora_seguro_created_at_idx ON public.leads_ancora_seguro (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_ancora_seguro_segmento_idx   ON public.leads_ancora_seguro (segmento);

ALTER TABLE public.leads_ancora_seguro ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_ancora_seguro_service_role_all" ON public.leads_ancora_seguro;
CREATE POLICY "leads_ancora_seguro_service_role_all" ON public.leads_ancora_seguro
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "leads_ancora_seguro_anon_insert" ON public.leads_ancora_seguro;
CREATE POLICY "leads_ancora_seguro_anon_insert" ON public.leads_ancora_seguro
  FOR INSERT TO anon WITH CHECK (true);

COMMENT ON TABLE  public.leads_ancora_seguro IS 'Leads captados pela landing page de Seguro Âncora';
COMMENT ON COLUMN public.leads_ancora_seguro.segmento IS 'Tipo de seguro solicitado (ex: Seguro de Carro, Seguro de Vida)';
COMMENT ON COLUMN public.leads_ancora_seguro.descricao IS 'Mensagem livre do solicitante';
COMMENT ON COLUMN public.leads_ancora_seguro.status IS 'novo | em_atendimento | qualificado | proposta | fechado | perdido';

-- ─────────────────────────────────────────────────────────────
--  3. TABELA DE PERFIS — USUÁRIOS DO PAINEL
--     Nome: profiles_ancora
--     Ligada a auth.users pelo mesmo UUID.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles_ancora (
  id         UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email      TEXT,
  role       TEXT        NOT NULL DEFAULT 'comercial',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles_ancora
  DROP CONSTRAINT IF EXISTS profiles_ancora_role_check;
ALTER TABLE public.profiles_ancora
  ADD CONSTRAINT profiles_ancora_role_check
  CHECK (role IN ('admin', 'comercial', 'marketing'));

ALTER TABLE public.profiles_ancora ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_ancora_service_role_all" ON public.profiles_ancora;
CREATE POLICY "profiles_ancora_service_role_all" ON public.profiles_ancora
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_ancora_self_select" ON public.profiles_ancora;
CREATE POLICY "profiles_ancora_self_select" ON public.profiles_ancora
  FOR SELECT TO authenticated USING (auth.uid() = id);

COMMENT ON TABLE  public.profiles_ancora       IS 'Perfis internos dos usuários do painel Âncora (admin, comercial, marketing)';
COMMENT ON COLUMN public.profiles_ancora.id    IS 'Mesmo UUID do usuário em auth.users';
COMMENT ON COLUMN public.profiles_ancora.email IS 'Email do usuário (espelho de auth.users)';
COMMENT ON COLUMN public.profiles_ancora.role  IS 'admin | comercial | marketing';

-- ─────────────────────────────────────────────────────────────
--  4. TRIGGER — sincroniza perfil ao criar usuário no Auth
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user_ancora()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles_ancora (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'comercial')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_ancora ON auth.users;

CREATE TRIGGER on_auth_user_created_ancora
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_ancora();

-- ─────────────────────────────────────────────────────────────
--  5. MIGRAÇÃO DE DADOS LEGADOS (opcional)
--
--  Se você possui dados existentes nas tabelas antigas
--  (leads_ancora e/ou leads), execute os blocos abaixo
--  para migrar para as novas tabelas.
--  Remova ou comente se não houver dados a migrar.
-- ─────────────────────────────────────────────────────────────

-- Migrar leads antigos de consórcio (tabela "leads_ancora"):
-- INSERT INTO public.leads_ancora_consorcio
--   (id, name, email, telefone, valor_simulado, origin, status, created_at)
-- SELECT id, name, email, telefone, valor_simulado, origin, status, created_at
--   FROM public.leads_ancora
-- ON CONFLICT (id) DO NOTHING;

-- Migrar leads antigos de seguro (tabela "leads"):
-- INSERT INTO public.leads_ancora_seguro
--   (id, name, email, telefone, segmento, descricao, origin, status, created_at)
-- SELECT id, name, email, telefone, segmento, descricao, origin, status, created_at
--   FROM public.leads
-- ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
--  REFERÊNCIA RÁPIDA
--
--  Criar usuário admin via SQL (após criar no Supabase Auth):
--    INSERT INTO public.profiles_ancora (id, email, role)
--    VALUES ('<uuid-do-usuario>', 'admin@ancora.com', 'admin');
--
--  Roles disponíveis: admin | comercial | marketing
-- ─────────────────────────────────────────────────────────────
