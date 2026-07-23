import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase/client';
import { useUIStore } from '@/store/uiStore';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export default function ProfileSettingsScreen() {
  const { user, profile } = useUser();
  const setProfile = useAuthStore((state) => state.setProfile);
  const showToast = useUIStore((state) => state.showToast);

  const [displayName, setDisplayName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  const handleSaveDisplayName = async () => {
    if (!user || !displayName.trim()) return;
    setIsSavingName(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user.id);

      if (error) throw error;
      
      if (profile) {
        setProfile({ ...profile, display_name: displayName.trim() });
      }
      
      showToast('Display name updated!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to update display name.', 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // Need base64 to upload via Supabase storage from Expo
      });

      if (!result.canceled && result.assets[0].base64 && user) {
        setIsUploadingAvatar(true);
        const fileExt = result.assets[0].uri.split('.').pop() || 'jpg';
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(result.assets[0].base64), {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;
        
        if (profile) {
          setProfile({ ...profile, avatar_url: publicUrl });
        }

        showToast('Profile picture updated!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to upload avatar.', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const name = profile?.display_name ?? profile?.username ?? 'Anonymous';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.avatarSection}>
            <Avatar url={profile?.avatar_url} name={name} size="xl" ringColor={Colors.primary} />
            <Button
              text="Change Picture"
              variant="secondary"
              size="sm"
              loading={isUploadingAvatar}
              onPress={handlePickAvatar}
              style={styles.changePictureBtn}
            />
          </View>

          <View style={styles.inputSection}>
            <Input
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your display name"
            />
            <Button
              text="Save Name"
              loading={isSavingName}
              onPress={handleSaveDisplayName}
              disabled={!displayName.trim() || displayName.trim() === profile?.display_name}
              style={styles.saveNameBtn}
            />
          </View>
        </Card>

        <Button
          text="Back to Profile"
          variant="ghost"
          onPress={() => router.back()}
          style={styles.backBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  changePictureBtn: {
    marginTop: 16,
  },
  inputSection: {
    gap: 16,
  },
  saveNameBtn: {
    marginTop: 8,
  },
  backBtn: {
    marginTop: 24,
  },
});
