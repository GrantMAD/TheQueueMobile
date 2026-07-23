import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { Group, GroupMember } from '@/types';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/store/uiStore';

export default function GroupSettingsScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const showToast = useUIStore((state) => state.showToast);

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const [groupRes, membersRes] = await Promise.all([
        supabase.from('groups').select('*').eq('id', groupId).single(),
        supabase.from('group_members').select('*, profile:profiles(*)').eq('group_id', groupId),
      ]);

      if (!groupRes.error && groupRes.data) {
        setGroup(groupRes.data as unknown as Group);
        setName((groupRes.data as any).name);
        setDescription((groupRes.data as any).description || '');
      }

      if (!membersRes.error && membersRes.data) {
        setMembers(membersRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const handleUpdateSettings = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { error } = await (supabase
        .from('groups')
        .update({
          name: name.trim(),
          description: description.trim(),
        })
        .eq('id', groupId) as any);

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Settings updated successfully', 'success');
        router.back();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleKickMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
      showToast('Kicked member from crew', 'success');
      fetchGroupData();
    } catch (err: any) {
      showToast(err.message || 'Failed to kick', 'error');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
      showToast('Crew disbanded', 'success');
      router.replace('/(tabs)/groups');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete crew', 'error');
    }
  };

  if (loading || !group) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.user_id}
      renderItem={({ item }) => {
        const name = item.profile?.display_name ?? item.profile?.username;
        const isSelf = item.user_id === group.owner_id;
        return (
          <View style={styles.memberRow}>
            <Avatar url={item.profile?.avatar_url} name={name} size="sm" />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{name}</Text>
              <Text style={styles.memberRole}>{item.role.toUpperCase()}</Text>
            </View>
            {!isSelf && (
              <Button
                text="Kick"
                variant="destructive"
                size="sm"
                onPress={() => handleKickMember(item.user_id)}
                style={styles.kickBtn}
              />
            )}
          </View>
        );
      }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Crew Settings</Text>

          <Input
            label="Group Name"
            placeholder="Change crew name"
            value={name}
            onChangeText={setName}
            charLimit={50}
            style={styles.input}
          />

          <Input
            label="Description"
            placeholder="Change description"
            value={description}
            onChangeText={setDescription}
            charLimit={300}
            multiline
            numberOfLines={3}
            style={styles.descInput}
          />

          <Button
            text="Save Settings"
            onPress={handleUpdateSettings}
            loading={saving}
            style={styles.saveBtn}
          />

          <Text style={styles.sectionTitle}>Crew Members</Text>
        </View>
      }
      ListFooterComponent={
        <View style={styles.footer}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <Button
            text="Disband Crew"
            variant="destructive"
            onPress={handleDeleteGroup}
            style={styles.deleteBtn}
          />
        </View>
      }
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingBottom: 16,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  descInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveBtn: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  memberRole: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs - 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
  kickBtn: {
    height: 28,
    borderRadius: 8,
  },
  footer: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: 24,
  },
  deleteBtn: {
    marginTop: 8,
  },
});
