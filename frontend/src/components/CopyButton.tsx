import { useEffect, useState } from 'react'

interface Props {
  text: string
}

export function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // clipboard indisponível (ex.: página sem HTTPS); ignora
    }
  }

  return (
    <button type="button" onClick={handleCopy}>
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  )
}