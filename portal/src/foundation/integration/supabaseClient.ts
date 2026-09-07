import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import {
  PortalIntegrationConfigurationError,
  readSupabasePublicConfig,
} from './supabaseConfig'

let cachedClient: SupabaseClient | null | undefined

export function isPortalSupabaseConfigured(): boolean {
  try {
    return readSupabasePublicConfig() !== null
  } catch {
    return false
  }
}

export function getPortalSupabaseClient(): SupabaseClient {
  if (cachedClient === undefined) {
    const config = readSupabasePublicConfig()
    cachedClient = config
      ? createClient(config.url, config.publishableKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        })
      : null
  }

  if (!cachedClient) {
    throw new PortalIntegrationConfigurationError(
      'Auratio Portal Supabase configuration is missing for this build.',
    )
  }

  return cachedClient
}
