import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase/client'

export function useUser() {
  const { session, profile, isLoading, setSession, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    async function getProfile() {
      if (!session?.user) return
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          setProfile(data as any)
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user && !profile) {
      getProfile()
    }
  }, [session, profile, setProfile, setLoading])

  return {
    user: session?.user ?? null,
    profile,
    isLoading: isLoading || !session,
    isAuthenticated: !!session?.user,
  }
}
