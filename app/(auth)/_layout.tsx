import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/constants/colors'

export default function AuthLayout() {
  const { session, isInitialized } = useAuthStore()

  useEffect(() => {
    // Redirect to tabs if user is already authenticated
    if (isInitialized && session) {
      router.replace('/(tabs)')
    }
  }, [session, isInitialized])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
    </Stack>
  )
}
