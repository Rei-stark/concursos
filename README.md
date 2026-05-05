# EDITAL.GOV v1.03

Buscador de editais de concursos públicos para professores, com busca em tempo real via IA (Claude + web search).

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Anthropic Claude API** (com web search)
- **Deploy:** Vercel

## Como rodar localmente

```bash
# 1. Instale as dependências
npm install

# 2. Configure a chave da API
cp .env.example .env.local
# edite .env.local e adicione sua ANTHROPIC_API_KEY

# 3. Rode o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Deploy no Vercel

1. Suba o repositório no GitHub
2. Importe o projeto no [vercel.com](https://vercel.com)
3. Em **Settings → Environment Variables**, adicione:
   - `ANTHROPIC_API_KEY` = `sk-ant-...`
4. Clique em **Deploy**

## Estrutura

```
src/
  app/
    api/buscar/route.ts   # API Route — chama Anthropic no servidor
    layout.tsx            # Layout raiz com metadados SEO
    page.tsx              # Página principal
    globals.css           # Variáveis CSS globais
  components/
    Buscador.tsx          # Componente principal
    Buscador.module.css   # Estilos
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `ANTHROPIC_API_KEY` | Chave da API Anthropic (obrigatória) |

> ⚠️ Nunca comite o `.env.local` no Git. Ele já está no `.gitignore`.
