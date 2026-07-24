import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from 'expo-router/drawer';
import { supabase } from '@/lib/supabase/client';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

function CustomDrawerContent(props: any) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>The Queue</Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.footer}>
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={Colors.error} />}
          onPress={handleLogout}
          labelStyle={styles.logoutLabel}
        />
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textPrimary,
        drawerStyle: {
          backgroundColor: Colors.surface,
        },
        drawerLabelStyle: {
          fontFamily: FontFamily.medium,
          fontSize: FontSize.md,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
          drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background,
            borderBottomWidth: 1,
            borderBottomColor: Colors.surfaceBorder,
          },
          headerTitleStyle: {
            fontFamily: FontFamily.bold,
            fontSize: FontSize.lg,
            color: Colors.textPrimary,
          },
          headerTintColor: Colors.textPrimary,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background,
            borderBottomWidth: 1,
            borderBottomColor: Colors.surfaceBorder,
          },
          headerTitleStyle: {
            fontFamily: FontFamily.bold,
            fontSize: FontSize.lg,
            color: Colors.textPrimary,
          },
          headerTintColor: Colors.textPrimary,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingTop: 0,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    marginBottom: 10,
  },
  headerText: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
  },
  footer: {
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  logoutLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.error,
  }
});
