import { useCallback, useEffect, useState } from 'react'
import { createLink, deleteLink, listLinks, updateLink } from '../Api'
import type { ShortLink } from '../types'

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Erro inesperado.'

export function useLinks() {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      setLinks(await listLinks())
    } catch (e) {
      setError(toMessage(e))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Executa uma ação da API, guarda o erro (se houver) e recarrega a lista.
  // Retorna undefined quando a ação falha.
  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    setError('')
    try {
      const result = await action()
      await refresh()
      return result
    } catch (e) {
      setError(toMessage(e))
      return undefined
    }
  }

  return {
    links,
    error,
    create: (url: string) => run(() => createLink(url)),
    update: async (code: string, url: string) =>
      (await run(() => updateLink(code, url))) !== undefined,
    remove: async (code: string) => (await run(() => deleteLink(code))) !== undefined,
  }
}