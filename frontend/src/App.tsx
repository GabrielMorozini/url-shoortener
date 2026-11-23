import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

interface ShortLink {
  code: string
  original_url: string
  short_url: string
  clicks: number
  unique_visitors: number
  expires_at: string
  is_expired: boolean
  is_owner: boolean
  owner?: { id: number; name: string; email: string } | null
}

interface Admin {
  id: number
  name: string
  email: string
}

// ID de sessão: vive só enquanto a aba estiver aberta (sem histórico de outros dias)
function getSessionId() {
  let id = sessionStorage.getItem('session_id')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('session_id', id)
  }
  return id
}

const SESSION_ID = getSessionId()

async function api(path: string, options: RequestInit = {}, adminToken?: string | null) {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Session-Id': SESSION_ID,
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    },
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  return { res, data }
}

function firstError(data: { errors?: Record<string, string[]>; message?: string } | null) {
  if (data?.errors) {
    const first = Object.values(data.errors)[0]
    if (first?.[0]) return first[0]
  }
  return data?.message
}

function App() {
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    sessionStorage.getItem('admin_token'),
  )
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [url, setUrl] = useState('')
  const [links, setLinks] = useState<ShortLink[]>([])
  const [result, setResult] = useState<ShortLink | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')

  const clearAdmin = useCallback(() => {
    sessionStorage.removeItem('admin_token')
    setAdminToken(null)
    setAdmin(null)
  }, [])

  const loadLinks = useCallback(async () => {
    try {
      const { res, data } = await api('/links', {}, adminToken)
      if (!res.ok) throw new Error()
      setLinks(data.data)
    } catch {
      setError('Não foi possível carregar os links. A API está rodando?')
    }
  }, [adminToken])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  // confirma que o token de admin guardado ainda é válido
  useEffect(() => {
    if (!adminToken) return
    api('/me', {}, adminToken)
      .then(({ res, data }) => (res.ok ? setAdmin(data) : clearAdmin()))
      .catch(() => setError('Erro de conexão com a API.'))
  }, [adminToken, clearAdmin])

  async function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { res, data } = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        setError(firstError(data) ?? 'Não foi possível entrar.')
        return
      }

      sessionStorage.setItem('admin_token', data.token)
      setAdminToken(data.token)
      setShowAdminLogin(false)
      setPassword('')
    } catch {
      setError('Erro de conexão com a API.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdminLogout() {
    try {
      await api('/logout', { method: 'POST' }, adminToken)
    } finally {
      clearAdmin()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const { res, data } = await api(
        '/links',
        { method: 'POST', body: JSON.stringify({ url }) },
        adminToken,
      )

      if (!res.ok) {
        setError(firstError(data) ?? 'Não foi possível encurtar a URL.')
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

  async function handleSaveEdit(code: string) {
    setError('')
    try {
      const { res, data } = await api(
        `/links/${code}`,
        { method: 'PATCH', body: JSON.stringify({ url: editUrl }) },
        adminToken,
      )
      if (!res.ok) {
        setError(firstError(data) ?? 'Não foi possível editar o link.')
        return
      }
      setEditing(null)
      loadLinks()
    } catch {
      setError('Erro de conexão com a API.')
    }
  }

  async function handleDelete(code: string) {
    if (!confirm('Apagar este link?')) return
    setError('')
    try {
      const { res, data } = await api(`/links/${code}`, { method: 'DELETE' }, adminToken)
      if (!res.ok) {
        setError(firstError(data) ?? 'Não foi possível apagar o link.')
        return
      }
      loadLinks()
    } catch {
      setError('Erro de conexão com a API.')
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 1500)
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleString('pt-BR')

  return (
    <main id="center">
      <h1>URL SHORTENER</h1>

      {admin ? (
        <p>
          Admin: {admin.email}{' '}
          <button type="button" onClick={handleAdminLogout}>
            Sair
          </button>
        </p>
      ) : (
        <p>
          <button type="button" onClick={() => setShowAdminLogin(!showAdminLogin)}>
            Sou administrador
          </button>
        </p>
      )}

      {showAdminLogin && !admin && (
        <form onSubmit={handleAdminLogin}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            Entrar
          </button>
        </form>
      )}

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
          <span>Seu link curto (expira em {formatDate(result.expires_at)}):</span>
          <a href={result.short_url} target="_blank" rel="noreferrer">
            {result.short_url}
          </a>
          <button type="button" onClick={() => copyToClipboard(result.short_url)}>
            {copied === result.short_url ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      )}

      <h2>{admin ? 'Todos os links' : 'Links desta sessão'}</h2>

      {links.length === 0 && <p className="empty">Nenhum link criado ainda.</p>}

      {links.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Link curto</th>
              <th>URL original</th>
              <th>Pessoas</th>
              <th>Cliques</th>
              <th>Expira em</th>
              {admin && <th>Dono</th>}
              <th>Ações</th>
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
                <td className="original">
                  {editing === link.code ? (
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                    />
                  ) : (
                    link.original_url
                  )}
                </td>
                <td>{link.unique_visitors}</td>
                <td>{link.clicks}</td>
                <td>{link.is_expired ? 'Expirado' : formatDate(link.expires_at)}</td>
                {admin && <td>{link.owner?.email ?? 'Visitante'}</td>}
                <td>
                  {link.is_owner &&
                    (editing === link.code ? (
                      <>
                        <button type="button" onClick={() => handleSaveEdit(link.code)}>
                          Salvar
                        </button>
                        <button type="button" onClick={() => setEditing(null)}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(link.code)
                            setEditUrl(link.original_url)
                          }}
                        >
                          Editar
                        </button>
                        <button type="button" onClick={() => handleDelete(link.code)}>
                          Apagar
                        </button>
                      </>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}

export default App