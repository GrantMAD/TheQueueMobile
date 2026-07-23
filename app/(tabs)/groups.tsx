import React from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useGroups } from '@/hooks/useGroups';
import { GroupCard } from '@/components/groups/GroupCard';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export default function GroupsTab() {
  const { groups, isLoading, refetch } = useGroups();

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => router.push(`/groups/${item.id}`)}
              isMember
            />
          )}
          ListHeaderComponent={
            <View style={styles.header}>
              <Button
                text="Create New Crew"
                variant="primary"
                onPress={() => router.push('/groups/create')}
                style={styles.createBtn}
              />
              <Text style={styles.sectionTitle}>Your Groups ({groups.length})</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>You are not in any groups yet.</Text>
              <Text style={styles.emptySubtext}>Crews help you vote and track progress with friends!</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    marginTop: 40,
  },
  header: {
    marginBottom: 16,
  },
  createBtn: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginTop: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
