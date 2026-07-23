import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

/**
 * ExpoSecureStoreAdapter — persists the Supabase auth session securely on-device.
 * expo-secure-store values are limited to 2048 bytes, so we chunk large values.
 */
const CHUNK_SIZE = 1800

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunk_count`)
    if (chunkCountStr) {
      const chunkCount = parseInt(chunkCountStr, 10)
      let value = ''
      for (let i = 0; i < chunkCount; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`)
        if (chunk) value += chunk
      }
      return value
    }
    return SecureStore.getItemAsync(key)
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length > CHUNK_SIZE) {
      const chunks = Math.ceil(value.length / CHUNK_SIZE)
      await SecureStore.setItemAsync(`${key}_chunk_count`, String(chunks))
      for (let i = 0; i < chunks; i++) {
        await SecureStore.setItemAsync(
          `${key}_chunk_${i}`,
          value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        )
      }
    } else {
      await SecureStore.setItemAsync(key, value)
    }
  },
  removeItem: async (key: string): Promise<void> => {
    const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunk_count`)
    if (chunkCountStr) {
      const chunkCount = parseInt(chunkCountStr, 10)
      await SecureStore.deleteItemAsync(`${key}_chunk_count`)
      for (let i = 0; i < chunkCount; i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`)
      }
    } else {
      await SecureStore.deleteItemAsync(key)
    }
  },
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
