import { Tabs } from 'expo-router';
import { Home, Camera, Database, BarChart3, Leaf } from 'lucide-react-native';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopColor: Colors.light.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Басты',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Сканерлеу',
          tabBarIcon: ({ color, size }) => <Camera size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Талдау',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="eco"
        options={{
          title: 'Эко Білім',
          tabBarIcon: ({ color, size }) => <Leaf size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}