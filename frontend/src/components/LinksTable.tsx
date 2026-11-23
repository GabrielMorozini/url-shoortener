import type { ShortLink } from '../types'
import { LinkRow } from './LinkRow'

interface Props {
  links: ShortLink[]
  onUpdate: (code: string, url: string) => Promise<boolean>
  onDelete: (code: string) => Promise<boolean>
}

export function LinksTable({ links, onUpdate, onDelete }: Props) {
  if (links.length === 0) {
    return <p className="empty">Nenhum link criado ainda.</p>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Link curto</th>
            <th>URL original</th>
            <th>Pessoas</th>
            <th>Cliques</th>
            <th>Expira em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <LinkRow key={link.code} link={link} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  )
}