import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

interface ShortLink {
  code: string
  original_url: string
  short_url: string
  clicks?: number
}

function App() {
  const [url, setUrl] = useState('')
  const [links, setLinks] = useState<ShortLink[]>([])
  const [result, setResult] = useState<ShortLink | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')

  async function loadLinks() {
    try {
      const res = await fetch(`${API_URL}/api/links`, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error()
      setLinks(await res.json())
    } catch {
      setError('Não foi possível carregar os links. A API está rodando?')
    }
  }

  useEffect(() => {
    loadLinks()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.errors?.url?.[0] ?? 'Não foi possível encurtar a URL.')
        return
      }

      setResult(data)
      setUrl('')
      loadLinks()
    } catch {
      setError('Erro de conexão com a API.')
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <main id="center">
      <h1>URL SHORTENER</h1>

      <form onSubmit={handleSubmit}>
        <label className="url-input">
          <input
            type="url"
            placeholder="https://cole-sua-url.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Encurtando...' : 'Encurtar'}
          </button>
        </label>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <span>Seu link curto:</span>
          <a href={result.short_url} target="_blank" rel="noreferrer">
            {result.short_url}
          </a>
          <button type="button" onClick={() => copyToClipboard(result.short_url)}>
            {copied === result.short_url ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      )}

      <h2>Links recentes</h2>

      {links.length === 0 && <p className="empty">Nenhum link criado ainda.</p>}

      {links.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Link curto</th>
              <th>URL original</th>
              <th>Cliques</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.code}>
                <td>
                  <a href={link.short_url} target="_blank" rel="noreferrer">
                    {link.short_url}
                  </a>
                </td>
                <td className="original">{link.original_url}</td>
                <td>{link.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}

export default App
