import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@clerk/clerk-expo'
import * as Haptics from "expo-haptics"

const styles = StyleSheet.create({
  createIconContainer: {
    backgroundColor: Colors.itemBackground,
    padding: 6,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabBarIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const CreateTabIcon = ({ color, size, focused }: { color: string, size: number, focused: boolean }) => {
  return (
    <View style={styles.tabBarIconContainer}>
      <View style={styles.createIconContainer}>
        <Ionicons name='add' color={color} size={size} />
      </View>
    </View>
  )
}

const Layout = () => {

  const { signOut } = useAuth();

  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#000'
      }}
    >
      <Tabs.Screen
        name='feed'
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name='search'
        options={{
          headerShown: false,
          title: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name='create'
        options={{
          headerShown: false,
          title: "Create",
          tabBarIcon: ({ color, size, focused }) => (
            <CreateTabIcon color={color} size={size} focused={focused} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Haptics.selectionAsync();
            router.push('/(auth)/(modal)/create')
          }
        }}
      />
      <Tabs.Screen
        name='favorites'
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          )
        }}
      />
    </Tabs>
  )
}

export default Layout