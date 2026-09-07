export interface SupabasePublicConfig {
  url: string
  publishableKey: string
}

export class PortalIntegrationConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PortalIntegrationConfigurationError'
  }
}

export function readSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
  const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim()

  if (!url && !publishableKey) return null

  if (!url || !publishableKey) {
    throw new PortalIntegrationConfigurationError(
      'Both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required.',
    )
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new PortalIntegrationConfigurationError('VITE_SUPABASE_URL is not a valid URL.')
  }

  if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('.supabase.co')) {
    throw new PortalIntegrationConfigurationError(
      'VITE_SUPABASE_URL must be an https://*.supabase.co project URL.',
    )
  }

  return { url: parsedUrl.origin, publishableKey }
}
