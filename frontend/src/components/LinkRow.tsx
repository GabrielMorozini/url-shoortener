import { useState } from 'react'
import type { ShortLink } from '../types'
import { formatDate } from '../utils/format'

interface Props {
  link: ShortLink
  onUpdate: (code: string, url: string) => Promise<boolean>
  onDelete: (code: string) => Promise<boolean>
}

export function LinkRow({ link, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editUrl, setEditUrl] = useState(link.original_url)

  function startEditing() {
    setEditUrl(link.original_url)
    setIsEditing(true)
  }

  async function handleSave() {
    if (await onUpdate(link.code, editUrl)) setIsEditing(false)
  }

  async function handleDelete() {
    if (confirm('Apagar este link?')) await onDelete(link.code)
  }

  return (
    <tr>
      <td data-label="Link curto">
        <a href={link.short_url} target="_blank" rel="noreferrer">
          {link.short_url}
        </a>
      </td>
      <td className="original" data-label="URL original">
        {isEditing ? (
          <input
            type="url"
            aria-label="Nova URL"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
          />
        ) : (
          link.original_url
        )}
      </td>
      <td data-label="Pessoas">{link.unique_visitors}</td>
      <td data-label="Cliques">{link.clicks}</td>
      <td data-label="Expira em">
        {link.is_expired ? 'Expirado' : formatDate(link.expires_at)}
      </td>
      <td data-label="Ações">
        {link.is_owner &&
          (isEditing ? (
            <>
              <button type="button" onClick={handleSave}>
                Salvar
              </button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={startEditing}>
                Editar
              </button>
              <button type="button" onClick={handleDelete}>
                Apagar
              </button>
            </>
          ))}
      </td>
    </tr>
  )
}