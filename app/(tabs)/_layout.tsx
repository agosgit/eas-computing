import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeContext } from '@/hooks/theme-context';

export default function TabLayout() {
  const { isDark } = useThemeContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: isDark ? '#888' : '#666',
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarStyle: {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderTopColor: isDark ? '#2D2D2D' : '#E5E5E5',

          height: Platform.OS === 'ios' ? 90 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={26}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cookbook"
        options={{
          title: 'Cookbook',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={26}
              name="book.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}