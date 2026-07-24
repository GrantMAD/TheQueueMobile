import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Platform, ColorValue } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({
  name,
  color,
}: {
  name: IoniconsName;
  color: ColorValue;
}) {
  return <Ionicons name={name} size={24} color={color as string} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.surfaceBorder,
          height: 80,
          paddingBottom: 18,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: FontFamily.medium,
          fontSize: FontSize.xs,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: Colors.background,
          ...Platform.select({
            web: { boxShadow: 'none' },
            default: { shadowColor: 'transparent' },
          }),
          borderBottomWidth: 1,
          borderBottomColor: Colors.surfaceBorder,
        },
        headerTitleStyle: {
          fontFamily: FontFamily.bold,
          fontSize: FontSize.lg,
          color: Colors.textPrimary,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'compass' : 'compass-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'library' : 'library-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
