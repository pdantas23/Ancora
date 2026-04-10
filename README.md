# Âncora — Plataforma Unificada (Consórcio + Seguro)

Repositório único contendo as duas vertentes da Âncora com painel administrativo compartilhado.

---

## Arquitetura

```
ancora/
├── client/                    # Frontend React + Vite + Tailwind
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx        # Landing page — Consórcio (rota /)
│       │   ├── HomeSeguro.tsx  # Landing page — Seguro    (rota /seguros)
│       │   ├── Login.tsx
│       │   └── NotFound.tsx
│       └── features/
│           ├── auth/           # Autenticação via Supabase
│           └── leads/
│               ├── leadTypes.ts       # Tipo unificado Lead + Vertente
│               ├── leadApi.ts         # API calls (consorcio / seguro / listagem)
│               └── pages/
│                   ├── Comercial.tsx  # Painel Comercial — leitura unificada
│                   └── Marketing.tsx  # Painel Marketing — leitura unificada
├── server/                    # Backend Node.js + Express
│   ├── features/leads/
│   │   ├── leadTypes.ts       # Tipos + constantes de status
│   │   ├── leadService.ts     # Serviço unificado (lê/grava nas duas tabelas)
│   │   └── leadsRoutes.ts     # Rotas /api/leads (GET, PATCH, POST /consorcio, POST /seguro)
│   ├── routes/authRoutes.ts   # Login / logout / me
│   ├── services/authService.ts
│   ├── middlewares/requireAuth.ts
│   └── lib/supabase.ts
├── shared/const.ts            # Constantes compartilhadas (nomes de tabelas, etc.)
└── supabase_migration.sql     # Migration SQL para executar no Supabase
```

---

## Banco de dados (Supabase — único)

O projeto usa **exclusivamente o Supabase** como banco de dados.

### Tabelas de leads

| Tabela | Vertente | Campos exclusivos |
|---|---|---|
| `leads_ancora_consorcio` | Consórcio | `valor_simulado` |
| `leads_ancora_seguro` | Seguro | `segmento`, `descricao` |

Campos comuns às duas tabelas: `id`, `name`, `email`, `telefone`, `origin`, `status`, `created_at`.

### Tabela de perfis

| Tabela | Descrição |
|---|---|
| `profiles_ancora` | Perfis de usuários do painel, ligados a `auth.users` |

A tabela `profiles_ancora` armazena o `role` de cada usuário. Roles disponíveis:

| Role | Acesso |
|---|---|
| `admin` | Comercial + Marketing |
| `comercial` | Painel Comercial |
| `marketing` | Painel Marketing |

---

## Consumo unificado no Comercial e Marketing

Mesmo com leads persistidos em tabelas separadas, os painéis **leem as duas tabelas em paralelo** e exibem tudo em um único fluxo.

Cada lead exibe uma **tag de origem** (Vertente):

- 🔵 **Consórcio** — lead veio de `leads_ancora_consorcio`
- 🟠 **Seguro** — lead veio de `leads_ancora_seguro`

Ambos os painéis possuem filtro por Vertente ("Todas / Consórcio / Seguro") para visualização segmentada ou unificada.

---

## Rotas da aplicação

| Rota | Descrição | Acesso |
|---|---|---|
| `/` | Landing page Consórcio | Público |
| `/seguros` | Landing page Seguro | Público |
| `/login` | Login | Público |
| `/comercial` | Painel Comercial | `admin`, `comercial` |
| `/marketing` | Painel Marketing | `admin`, `marketing` |

### Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/leads/consorcio` | Cria lead na tabela `leads_ancora_consorcio` |
| `POST` | `/api/leads/seguro` | Cria lead na tabela `leads_ancora_seguro` |
| `GET` | `/api/leads` | Lista leads unificados (ambas as tabelas) |
| `GET` | `/api/leads/:id` | Busca lead por ID (detecta tabela automaticamente) |
| `PATCH` | `/api/leads/:id/status` | Atualiza status (detecta tabela automaticamente) |

O endpoint `GET /api/leads` aceita o parâmetro `vertente=Consórcio` ou `vertente=Seguro` para filtrar por origem.

---

## Setup

### 1. Variáveis de ambiente

Crie um `.env` na raiz com:

```env
# Supabase
VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>

SUPABASE_URL=https://<projeto>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# App
CORS_ORIGIN=http://localhost:3000

# WhatsApp — Consórcio
VITE_WHATSAPP_NUMBER=5586994458461
VITE_WHATSAPP_MESSAGE=Olá, gostaria de mais informações sobre consórcio.

# Contato — Seguro
VITE_CONTACT_EMAIL=ancoraprimeseguros@gmail.com
VITE_CONTACT_PHONE=(86) 99445-8461
VITE_CONTACT_ADDRESS=Teresina, PI
```

### 2. Executar a migration SQL

No painel do Supabase → **SQL Editor**, execute o arquivo `supabase_migration.sql`.

Isso cria:
- `leads_ancora_consorcio`
- `leads_ancora_seguro`
- `profiles_ancora` (com `role`)
- Trigger de sincronização de perfil no cadastro de usuário

### 3. Criar o primeiro usuário admin

No Supabase → **Authentication → Users → Add user**, crie o usuário.

Em seguida, no SQL Editor, defina a role:

```sql
INSERT INTO public.profiles_ancora (id, email, role)
VALUES ('<uuid-do-usuario>', 'admin@ancora.com', 'admin');
```

### 4. Instalar dependências e rodar

```bash
npm install
npm run dev       # roda frontend + backend simultaneamente
```

---

## Migração de dados legados

Se você tinha dados nas tabelas antigas (`leads_ancora` e/ou `leads`), o arquivo `supabase_migration.sql` contém blocos comentados ao final para migrar os registros. Descomente e execute conforme necessário.
