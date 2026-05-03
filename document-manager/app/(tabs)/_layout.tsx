import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/src/constants/config';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarStyle: {
          backgroundColor: THEME.colors.surface,
          borderTopColor: THEME.colors.border,
          borderTopWidth: 1,
          paddingTop: 4,
          height: Platform.OS === 'ios' ? 84 : 60,
          ...THEME.shadow.sm,
        },
        tabBarLabelStyle: {
          fontSize: THEME.fontSize.xs,
          fontWeight: THEME.fontWeight.semibold,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
      }}
    >
      {/* Tab 1 – Scanner */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Tab 2 – Documents */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hide the new screen files from the tab bar — they are used via re-exports */}
      <Tabs.Screen name="scanner" options={{ href: null }} />
      <Tabs.Screen name="documents" options={{ href: null }} />
      <Tabs.Screen name="viewer" options={{ href: null }} />
    </Tabs>
  );
}
