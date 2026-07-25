import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLibrary } from '@/hooks/useLibrary';
import { useGroups } from '@/hooks/useGroups';
import { useFeed } from '@/hooks/useFeed';
import { supabase } from '@/lib/supabase/client';
import { MediaCard } from '@/components/media/MediaCard';
import { ActivityCard } from '@/components/feed/ActivityCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { VotingRound } from '@/types';

export default function DashboardScreen() {
  const { library, isLoading: libraryLoading } = useLibrary();
  const { groups, isLoading: groupsLoading } = useGroups();
  const { data: feedPages, isLoading: feedLoading } = useFeed();

  const [activeVotes, setActiveVotes] = useState<(VotingRound & { groups: any })[]>([]);
  const [votesLoading, setVotesLoading] = useState(false);

  const groupIds = useMemo(() => groups.map((g) => g.id), [groups]);

  useEffect(() => {
    async function fetchActiveVotes() {
      if (groupIds.length === 0) {
        setActiveVotes([]);
        return;
      }
      setVotesLoading(true);
      try {
        const { data, error } = await supabase
          .from('voting_rounds')
          .select('*, groups(name)')
          .in('group_id', groupIds)
          .eq('status', 'active');
        if (!error && data) {
          setActiveVotes(data as any);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setVotesLoading(false);
      }
    }
    fetchActiveVotes();
  }, [groupIds]);

  const continueItems = useMemo(() => {
    return library.filter((item) => item.status === 'current').slice(0, 5);
  }, [library]);

  const recentFeed = feedPages?.pages?.[0]?.slice(0, 5) || [];

  const SectionHeader = ({ title, subtitle, icon }: { title: string; subtitle: string; icon: any }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={24} color={Colors.primary} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Your Queue</Text>
        <Text style={styles.heroSubtitle}>
          Your personal hub for tracking everything you watch, read, and listen to — and sharing it with the people who matter.
        </Text>
      </View>

      <View style={styles.section}>
        <SectionHeader 
          title="Continue Where You Left Off" 
          subtitle="Pick up right where you stopped."
          icon="time-outline" 
        />
        {libraryLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} width={120} height={180} style={{ borderRadius: 12, marginRight: 12 }} />
            ))}
          </ScrollView>
        ) : continueItems.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {continueItems.map((item) => (
              <View key={item.id} style={styles.horizontalCard}>
                <MediaCard 
                  item={item.media_item!} 
                  status={item.status} 
                  onPress={() => router.push(`/media/${item.media_item?.external_id}`)}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>You aren't currently tracking any active media.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader 
          title="Active Votes in Your Groups" 
          subtitle="Help your crew decide what to watch or read next."
          icon="stats-chart-outline" 
        />
        {groupsLoading || votesLoading ? (
          <Skeleton width="100%" height={100} style={{ borderRadius: 12 }} />
        ) : activeVotes.length > 0 ? (
          activeVotes.map((vote) => (
            <Pressable 
              key={vote.id} 
              style={styles.voteCard} 
              onPress={() => router.push(`/groups/${vote.group_id}`)}
            >
              <View style={styles.voteCardContent}>
                <View style={styles.voteIconBg}>
                  <Ionicons name="stats-chart" size={24} color={Colors.primary} />
                </View>
                <View style={styles.voteCardInfo}>
                  <Text style={styles.voteCardTitle}>Active round</Text>
                  <Text style={styles.voteCardGroup}>{vote.groups?.name}</Text>
                </View>
                <View style={styles.voteBadge}>
                  <Text style={styles.voteBadgeText}>Vote Now</Text>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="stats-chart-outline" size={32} color={Colors.textMuted} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No active voting rounds.</Text>
            <Text style={styles.emptySubtitle}>Check back later or start one in your groups.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader 
          title="Recent Friend Activity" 
          subtitle="See what the people you follow have been up to."
          icon="pulse-outline" 
        />
        {feedLoading ? (
          <View style={{ gap: 16 }}>
            <Skeleton width="100%" height={120} style={{ borderRadius: 12 }} />
            <Skeleton width="100%" height={120} style={{ borderRadius: 12 }} />
          </View>
        ) : recentFeed.length > 0 ? (
          <View style={{ gap: 16 }}>
            {recentFeed.map((activity: any, index: number) => (
              <ActivityCard key={activity?.id || `feed-item-${index}`} activity={activity as any} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="pulse-outline" size={32} color={Colors.textMuted} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No activity yet.</Text>
            <Text style={styles.emptySubtitle}>Follow some people to see their updates here.</Text>
          </View>
        )}
      </View>

    </ScrollView>
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
  hero: {
    marginBottom: 32,
    marginTop: 8,
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 32,
  },
  horizontalScroll: {
    paddingVertical: 4,
  },
  horizontalCard: {
    width: 280,
    marginRight: 12,
  },
  voteCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
  },
  voteCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  voteCardInfo: {
    flex: 1,
  },
  voteCardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  voteCardGroup: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginTop: 2,
  },
  voteBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  voteBadgeText: {
    color: Colors.textInverse,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
