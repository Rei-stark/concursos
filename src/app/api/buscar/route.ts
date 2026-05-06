import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY não configurada no servidor.' },
      { status: 500 }
    )
  }

  const { disciplina, nivel, local, esfera } = await req.json()

  const partes: string[] = []
  if (disciplina) partes.push(`disciplina: ${disciplina}`)
  if (nivel) partes.push(`nível: ${nivel}`)
  if (local) partes.push(`local: ${local}`)
  if (esfera) partes.push(`esfera: ${esfera}`)
  const contexto = partes.length > 0 ? ` (${partes.join(', ')})` : ''

  const hoje = new Date().toLocaleDateString('pt-BR')

  const prompt = `Busque na web editais de concurso público ou processo seletivo para contratação de professores${contexto}.

Pesquise em sites oficiais: Diário Oficial da União, portais de secretarias estaduais de educação, prefeituras, institutos federais e universidades federais.

IMPORTANTE: Liste APENAS editais com inscrições abertas hoje (${hoje}). Não inclua editais encerrados, em andamento ou previstos.

Retorne SOMENTE um JSON válido, sem markdown, sem explicações:
{
  "editais": [
    {
      "titulo": "nome do concurso/edital",
      "orgao": "nome do órgão",
      "esfera": "Federal" | "Estadual" | "Municipal",
      "estado": "sigla ou cidade/UF",
      "vagas": número ou null,
      "salario": "R$ X.XXX,XX" ou null,
      "prazo": "DD/MM/AAAA",
      "status": "Inscrições abertas",
      "link": "URL oficial" ou null,
      "descricao": "resumo em 1-2 frases",
      "requisitos": "titulação e requisitos principais"
    }
  ],
  "total": número de editais,
  "data_consulta": "${hoje}"
}`

  let anthropicRes: Response
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    })
  } catch (fetchErr: unknown) {
    const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
    return NextResponse.json({ error: `Erro de rede ao chamar Anthropic: ${msg}` }, { status: 502 })
  }

  if (!anthropicRes.ok) {
    const err = await anthropicRes.json()
    return NextResponse.json(
      { error: err.error?.message || `Erro Anthropic HTTP ${anthropicRes.status}` },
      { status: anthropicRes.status }
    )
  }

  const data = await anthropicRes.json()
  const fullText = (data.content as Array<{ type: string; text?: string }>)
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('')

  let json = fullText
  const fence = json.match(/```json\s*([\s\S]*?)```/)
  if (fence) json = fence[1]
  else {
    const start = json.indexOf('{')
    const end = json.lastIndexOf('}')
    if (start !== -1 && end !== -1) json = json.slice(start, end + 1)
  }

  try {
    const parsed = JSON.parse(json.trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json(
      { error: 'Falha ao interpretar resposta da IA.', raw: fullText },
      { status: 500 }
    )
  }
}
