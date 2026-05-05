import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EDITAL.GOV — Buscador de concursos para professores',
  description:
    'Encontre editais de concurso público e processos seletivos para professores em sites oficiais do governo federal, estadual e municipal. Busca em tempo real com IA.',
  keywords: 'concurso professor, edital professor, secretaria educação concurso, SEDUC concurso, universidade federal professor',
  openGraph: {
    title: 'EDITAL.GOV — Buscador de concursos para professores',
    description: 'Busca de editais de concursos para professores com IA, em portais oficiais do governo.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
