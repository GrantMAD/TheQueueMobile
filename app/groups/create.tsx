import React, { useState } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useGroups } from '@/hooks/useGroups';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';

export default function CreateGroupScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const { createGroup, isCreating } = useGroups();
  const showToast = useUIStore((state) => state.showToast);

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('Please enter a group name', 'error');
      return;
    }

    try {
      const data = await createGroup({
        name: name.trim(),
        description: description.trim(),
        type: isPublic ? 'public' : 'private',
      });
      showToast('Group created successfully!', 'success');
      router.replace(`/groups/${(data as any).id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create group', 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create a Crew</Text>
          <Text style={styles.subtitle}>Vote on titles and share progress with friends</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Group Name *"
            placeholder="Name your crew"
            value={name}
            onChangeText={setName}
            charLimit={50}
          />

          <Input
            label="Description"
            placeholder="What is this crew about?"
            value={description}
            onChangeText={setDescription}
            charLimit={300}
            multiline
            numberOfLines={3}
            style={styles.descInput}
          />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Make Group Public</Text>
              <Text style={styles.toggleDesc}>Anyone can search and instant join</Text>
            </View>
            <Button
              text={isPublic ? 'Public' : 'Private'}
              variant={isPublic ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => setIsPublic(!isPublic)}
            />
          </View>

          <Button
            text="Create Crew"
            onPress={handleCreate}
            loading={isCreating}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  form: {
    gap: 20,
  },
  descInput: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    padding: 16,
    borderRadius: 14,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  toggleDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  submitBtn: {
    marginTop: 10,
  },
});
