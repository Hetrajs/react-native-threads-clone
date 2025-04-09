import { Ionicons } from '@expo/vector-icons'
import { router, Stack } from 'expo-router'
import { Platform, Text, TouchableOpacity } from 'react-native'

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "white",
        },
        headerShadowVisible: false
      }}
    >
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='(modal)/create' options={{
        presentation: "modal",
        title: "New Thread",
        headerRight: () => (
          <TouchableOpacity>
            <Ionicons name='ellipsis-horizontal-circle' size={24} />
          </TouchableOpacity>
        )
      }} />
      <Stack.Screen name='(modal)/edit-profile' options={{
        presentation: "modal",
        title: Platform.OS === "ios" ? "Edit Profile" : "",
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.dismiss()}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        )
      }} />
    </Stack>
  )
}

export default Layout