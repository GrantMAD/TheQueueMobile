import React from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, RefreshControl, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGroups } from '@/hooks/useGroups';
import { GroupCard } from '@/components/groups/GroupCard';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Skeleton } from '@/components/ui/Skeleton';

export default function GroupsTab() {
  const { groups, isLoading, refetch } = useGroups();

  return (
    <View style={styles.container}>
      {isLoading && groups.length === 0 ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={styles.skeletonCard}>
              <View style={styles.skeletonHeader}>
                <Skeleton width={48} height={48} style={{ borderRadius: 12 }} />
                <View style={styles.skeletonInfo}>
                  <Skeleton width={150} height={20} />
                  <Skeleton width={100} height={14} style={{ marginTop: 8 }} />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isLoading && groups.length > 0} onRefresh={refetch} tintColor={Colors.primary} />}
          removeClippedSubviews={true}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => router.push(`/groups/${item.id}`)}
              isMember
            />
          )}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Ionicons name="people-circle-outline" size={28} color={Colors.textPrimary} style={styles.titleIcon} />
                <Text style={styles.sectionTitle}>Your Groups ({groups.length})</Text>
              </View>
              <Text style={styles.description}>Manage your crews and see what everyone is up to.</Text>
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
      <View style={styles.bottomContainer}>
        <Button
          text="Create New Crew"
          variant="primary"
          onPress={() => router.push('/groups/create')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skeletonContainer: {
    padding: 16,
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
  },
  skeletonInfo: {
    marginLeft: 16,
    flex: 1,
  },
  header: {
    marginBottom: 16,
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
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
  bottomContainer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
});
