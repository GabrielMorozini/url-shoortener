import type { ShortLink } from '../types'
import { formatDate } from '../utils/format'
import { CopyButton } from './CopyButton'

interface Props {
  link: ShortLink
}

export function LinkResult({ link }: Props) {
  return (
    <div className="result">
      <span>Seu link curto (expira em {formatDate(link.expires_at)}):</span>
      <a href={link.short_url} target="_blank" rel="noreferrer">
        {link.short_url}
      </a>
      <CopyButton text={link.short_url} />
    </div>
  )
}