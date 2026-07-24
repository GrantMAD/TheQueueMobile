import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase/client';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';

export default function SettingsScreen() {
  const { session, profile, setProfile } = useAuthStore();
  const user = session?.user;

  const [displayName, setDisplayName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.display_name]);

  const handleSaveDisplayName = async () => {
    if (!user || !displayName.trim()) return;
    setIsSavingName(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setProfile(data as any);
        if (Platform.OS === 'web') {
          alert('Display name updated!');
        } else {
          Alert.alert('Success', 'Display name updated!');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (Platform.OS === 'web') alert('Failed to update display name.');
      else Alert.alert('Error', 'Failed to update display name.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePickImage = async () => {
    if (!user) return;
    
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      if (Platform.OS === 'web') alert('Permission to access camera roll is required!');
      else Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true, // Need base64 for supabase storage upload on some platforms
    });

    if (pickerResult.canceled || !pickerResult.assets?.[0]) {
      return;
    }

    const asset = pickerResult.assets[0];
    uploadAvatar(asset);
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user) return;
    setIsUploading(true);
    
    try {
      let fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      if (fileExt === 'jpeg') fileExt = 'jpg';
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;
      
      let uploadError;
      
      if (Platform.OS === 'web') {
        // For web, fetch the blob and upload
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const { error } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob, { upsert: true });
        uploadError = error;
      } else {
        // For native, use base64 decoding
        if (!asset.base64) throw new Error('No base64 data');
        const { error } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(asset.base64), { 
            contentType: `image/${fileExt}`,
            upsert: true 
          });
        uploadError = error;
      }

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      if (data) {
        setProfile(data as any);
        if (Platform.OS === 'web') alert('Profile picture updated!');
        else Alert.alert('Success', 'Profile picture updated!');
      }

    } catch (err) {
      console.error('Error uploading avatar:', err);
      if (Platform.OS === 'web') alert('Failed to update profile picture.');
      else Alert.alert('Error', 'Failed to update profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>
      
      {/* Profile Settings */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
            <Ionicons name="person" size={20} color="#6366f1" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Profile</Text>
            <Text style={styles.cardSubtitle}>Your account identity.</Text>
          </View>
        </View>

        <View style={styles.avatarSection}>
          <Avatar 
            url={profile?.avatar_url} 
            size="xl" 
          />
          <View style={styles.avatarActions}>
            <Button 
              text={isUploading ? "Uploading..." : "Change Picture"} 
              onPress={handlePickImage} 
              disabled={isUploading}
              variant="secondary"
              size="sm"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Input 
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your display name"
          />
          <Button 
            text={isSavingName ? "Saving..." : "Save Name"}
            onPress={handleSaveDisplayName}
            disabled={isSavingName || !displayName.trim() || displayName.trim() === profile?.display_name}
            style={styles.saveButton}
          />
        </View>

        <View style={styles.formSection}>
          <Input 
            label="Email"
            value={user?.email || ''}
            editable={false}
          />
        </View>
      </Card>

      {/* Appearance Settings */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
            <Ionicons name="color-palette" size={20} color="#a855f7" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Appearance</Text>
            <Text style={styles.cardSubtitle}>Customize how The Queue looks.</Text>
          </View>
        </View>
        
        <View style={styles.comingSoonBox}>
          <Ionicons name="phone-portrait-outline" size={32} color={Colors.textMuted} style={styles.comingSoonIcon} />
          <Text style={styles.comingSoonText}>Theme preferences are currently tied to your device settings.</Text>
        </View>
      </Card>

      {/* Notifications Settings */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
            <Ionicons name="notifications" size={20} color="#ec4899" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Notifications</Text>
            <Text style={styles.cardSubtitle}>Choose what you want to be notified about.</Text>
          </View>
        </View>
        
        <View style={styles.comingSoonBox}>
          <Ionicons name="notifications-off-outline" size={32} color={Colors.textMuted} style={styles.comingSoonIcon} />
          <Text style={styles.comingSoonText}>Notification preferences coming soon</Text>
          <Text style={styles.comingSoonSubText}>We're working on giving you fine-grained control over your alerts.</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  card: {
    marginBottom: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  avatarActions: {
    marginLeft: 20,
  },
  formSection: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 12,
  },
  comingSoonBox: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
  },
  comingSoonIcon: {
    marginBottom: 8,
    opacity: 0.5,
  },
  comingSoonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  comingSoonSubText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  }
});
