import { useState } from 'react'
import type { FormEvent } from 'react'

interface Props {
  onSubmit: (url: string) => Promise<boolean>
}

export function ShortenForm({ onSubmit }: Props) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      if (await onSubmit(url)) setUrl('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="url-input">
        <input
          type="url"
          aria-label="URL para encurtar"
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
  )
}