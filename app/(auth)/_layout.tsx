import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { View, ActivityIndicator, SafeAreaView, Text } from 'react-native'

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth()

  // Wait for auth to load before making decisions
  if (!isLoaded) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingTop: 60, // Extra padding to avoid camera punch hole
      }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ 
          marginTop: 20, 
          fontSize: 16, 
          color: '#6b7280',
          textAlign: 'center' 
        }}>Preparing sign in...</Text>
      </SafeAreaView>
    )
  }

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}