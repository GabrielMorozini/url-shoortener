export interface ShortLink {
  code: string
  original_url: string
  short_url: string
  clicks: number
  unique_visitors: number
  expires_at: string
  is_expired: boolean
  is_owner: boolean
}