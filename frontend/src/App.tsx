import { useState } from 'react'
import './App.css'
import { LinkResult } from './components/LinkResult'
import { LinksTable } from './components/LinksTable'
import { ShortenForm } from './components/ShortenForm'
import { useLinks } from './hooks/useLinks'
import type { ShortLink } from './types'

function App() {
  const { links, error, create, update, remove } = useLinks()
  const [result, setResult] = useState<ShortLink | null>(null)

  async function handleCreate(url: string) {
    setResult(null)
    const link = await create(url)
    if (link) setResult(link)
    return link !== undefined
  }

  return (
    <main id="center">
      <h1>URL SHORTENER</h1>

      <ShortenForm onSubmit={handleCreate} />

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {result && <LinkResult link={result} />}

      <h2>Links desta sessão</h2>
      <LinksTable links={links} onUpdate={update} onDelete={remove} />
    </main>
  )
}

export default App