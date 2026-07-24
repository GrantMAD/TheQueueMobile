import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/constants/colors'

// Keep splash screen visible until fonts are loaded
SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,  // 2 minutes
      retry: 1,
    },
  },
})

export default function RootLayout() {
  const { setSession, setProfile, setInitialized, session, isInitialized } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    // Bootstrap existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const { data } = await (supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single() as any)
        if (data) setProfile(data)
      }
      setInitialized(true)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          const { data } = await (supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single() as any)
          if (data) setProfile(data)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setSession, setProfile, setInitialized])

  // Protected routing logic
  useEffect(() => {
    if (!isInitialized || !fontsLoaded) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      // Redirect unauthenticated users to the welcome screen
      router.replace('/(auth)/welcome')
    } else if (session && inAuthGroup) {
      // Redirect authenticated users to the main tabs
      router.replace('/(drawer)/(tabs)')
    }
  }, [session, isInitialized, fontsLoaded, segments])

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(drawer)" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
