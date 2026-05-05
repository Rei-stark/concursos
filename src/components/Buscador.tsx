'use client'

import { useState } from 'react'
import styles from './Buscador.module.css'

const VERSION = 'v1.03'

interface Edital {
  titulo: string
  orgao: string
  esfera: string
  estado?: string
  vagas?: number | null
  salario?: string | null
  prazo?: string
  status: string
  link?: string | null
  descricao?: string
  requisitos?: string
}

interface ResultadoBusca {
  editais: Edital[]
  total: number
  data_consulta: string
  error?: string
}

function diasRestantes(prazo?: string): number | null {
  if (!prazo) return null
  const [d, m, y] = prazo.split('/')
  if (!d || !m || !y) return null
  const data = new Date(+y, +m - 1, +d)
  return Math.round((data.getTime() - Date.now()) / 86400000)
}

function UrgencyBadge({ prazo }: { prazo?: string }) {
  const dias = diasRestantes(prazo)
  if (dias === null) return null
  if (dias < 0) return <span className={`${styles.badge} ${styles.badgeExpired}`}>Encerrado</span>
  if (dias === 0) return <span className={`${styles.badge} ${styles.badgeUrgent}`}>Encerra hoje!</span>
  if (dias <= 7) return <span className={`${styles.badge} ${styles.badgeUrgent}`}>⚠ {dias}d restantes</span>
  if (dias <= 20) return <span className={`${styles.badge} ${styles.badgeSoon}`}>⏱ {dias}d restantes</span>
  return <span className={`${styles.badge} ${styles.badgeOk}`}>✓ {dias}d restantes</span>
}

function EsferaBadge({ esfera }: { esfera: string }) {
  const e = esfera.toLowerCase()
  const cls = e.includes('federal')
    ? styles.tagFederal
    : e.includes('estadual') || e.includes('estado')
    ? styles.tagEstadual
    : styles.tagMunicipal
  return <span className={`${styles.tag} ${cls}`}>{esfera}</span>
}

function EditalCard({ edital }: { edital: Edital }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`${styles.card} ${open ? styles.cardOpen : ''}`}>
      <div className={styles.cardTop}>
        <div>
          <div className={styles.cardTitle}>{edital.titulo}</div>
          <div className={styles.cardMeta}>
            {edital.orgao && <span>🏛 {edital.orgao}</span>}
            {edital.estado && <span>📍 {edital.estado}</span>}
            {edital.vagas && <span>👤 {edital.vagas} vaga{edital.vagas !== 1 ? 's' : ''}</span>}
            {edital.salario && <span>💰 {edital.salario}</span>}
            {edital.prazo && <span>📅 Prazo: {edital.prazo}</span>}
          </div>
          {edital.descricao && <p className={styles.cardDesc}>{edital.descricao}</p>}
        </div>
        <EsferaBadge esfera={edital.esfera} />
      </div>

      <div className={styles.cardFooter}>
        <UrgencyBadge prazo={edital.prazo} />
        <div className={styles.cardActions}>
          <button className={styles.toggleBtn} onClick={() => setOpen(!open)}>
            {open ? '− requisitos' : '+ requisitos'}
          </button>
          {edital.link && (
            <a href={edital.link} target="_blank" rel="noopener noreferrer" className={styles.btnVer}>
              Ver edital ↗
            </a>
          )}
        </div>
      </div>

      {open && edital.requisitos && (
        <div className={styles.cardBody}>
          <p>{edital.requisitos}</p>
        </div>
      )}
    </div>
  )
}

export default function Buscador() {
  const [disciplina, setDisciplina] = useState('')
  const [local, setLocal] = useState('')
  const [nivel, setNivel] = useState('')
  const [esfera, setEsfera] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<ResultadoBusca | null>(null)
  const [erro, setErro] = useState('')

  async function buscar() {
    if (!disciplina && !local && !nivel && !esfera) return
    setLoading(true)
    setErro('')
    setResultado(null)

    try {
      const res = await fetch('/api/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disciplina, nivel, local, esfera }),
      })
      const data: ResultadoBusca = await res.json()
      if (data.error) setErro(data.error)
      else setResultado(data)
    } catch (e) {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') buscar()
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.logo}>EDITAL.GOV</h1>
          <p className={styles.subtitle}>Buscador de concursos para professores</p>
        </div>
        <span className={styles.version}>{VERSION}</span>
      </header>

      <section className={styles.searchBox}>
        <span className={styles.label}>Buscar editais com inscrições abertas</span>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            placeholder="Disciplina ou área (ex: matemática, estatística)"
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value)}
            onKeyDown={handleKey}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Estado ou cidade (ex: Minas Gerais, SP)"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onKeyDown={handleKey}
          />
          <select className={`${styles.input} ${styles.select}`} value={nivel} onChange={(e) => setNivel(e.target.value)}>
            <option value="">Todos os níveis</option>
            <option value="ensino fundamental">Ensino fundamental</option>
            <option value="ensino médio">Ensino médio</option>
            <option value="ensino superior / universidade">Ensino superior</option>
            <option value="EJA">EJA</option>
            <option value="ensino técnico">Técnico / IFET</option>
          </select>
          <select className={`${styles.input} ${styles.select}`} value={esfera} onChange={(e) => setEsfera(e.target.value)}>
            <option value="">Todas as esferas</option>
            <option value="federal">Federal</option>
            <option value="estadual">Estadual</option>
            <option value="municipal">Municipal</option>
          </select>
          <button className={styles.btnBuscar} onClick={buscar} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar ↗'}
          </button>
        </div>
        <div className={styles.notice}>
          <span>ℹ</span> Somente editais com inscrições abertas hoje serão listados.
        </div>
      </section>

      {erro && <div className={styles.errorBox}>{erro}</div>}

      {loading && (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <p>Consultando portais oficiais do governo...</p>
        </div>
      )}

      {resultado && !loading && (
        <section>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsTitle}>Editais encontrados</span>
            <span className={styles.resultsCount}>
              {resultado.total ?? resultado.editais.length} resultado{resultado.total !== 1 ? 's' : ''} · consultado em {resultado.data_consulta}
            </span>
          </div>

          {resultado.editais.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📭</div>
              <p>Nenhum edital com inscrições abertas encontrado para os filtros informados.</p>
              <p>Tente ampliar os critérios de busca ou consulte novamente em outro dia.</p>
            </div>
          ) : (
            resultado.editais.map((e, i) => <EditalCard key={i} edital={e} />)
          )}
        </section>
      )}

      {!resultado && !loading && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔍</div>
          <p>Preencha os campos acima e clique em Buscar.</p>
          <p>A IA pesquisará em portais oficiais do governo em tempo real.</p>
        </div>
      )}

      <footer className={styles.footer}>
        EDITAL.GOV {VERSION} · Fontes: DOU, secretarias estaduais, prefeituras, IFET, universidades federais
      </footer>
    </main>
  )
}
