import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { Group, MediaItem, VotingRound as VotingRoundType } from '@/types';
import { GroupHeader } from '@/components/groups/GroupHeader';
import { GroupMediaPool } from '@/components/groups/GroupMediaPool';
import { VotingRound } from '@/components/groups/VotingRound';
import { VoteCard } from '@/components/groups/VoteCard';
import { GroupHistory } from '@/components/groups/GroupHistory';
import { ProgressFeed } from '@/components/groups/ProgressFeed';
import { InviteSheet } from '@/components/groups/InviteSheet';
import { MediaSearch } from '@/components/media/MediaSearch';
import { BottomSheetRef } from '@/components/ui/BottomSheet';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useUser } from '@/hooks/useUser';
import { useVoting } from '@/hooks/useVoting';
import { useUIStore } from '@/store/uiStore';
import { useRealtime } from '@/hooks/useRealtime';

type SubTab = 'pool' | 'vote' | 'history' | 'progress';

export default function GroupHomeScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('pool');

  const { profile } = useUser();
  const showToast = useUIStore((state) => state.showToast);

  // Group detailed states
  const [poolItems, setPoolItems] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<any[]>([]);
  
  const inviteSheetRef = useRef<BottomSheetRef>(null);
  const addMediaSheetRef = useRef<BottomSheetRef>(null);

  // Voting hook
  const { activeRound, startVotingRound, castVote } = useVoting(groupId);
  const [votesCast, setVotesCast] = useState(0);

  // Realtime updates
  useRealtime({
    channelName: `group-pool-${groupId}`,
    tableName: 'group_media_pool',
    filter: `group_id=eq.${groupId}`,
    queryKeyToInvalidate: ['active-voting-round', groupId],
  });

  const fetchGroupDetails = async () => {
    setLoadingGroup(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();
      if (!error && data) setGroup(data as unknown as Group);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroup(false);
    }
  };

  const fetchPoolItems = async () => {
    try {
      const { data, error } = await supabase
        .from('group_media_pool')
        .select('*, media_item:media_items(*)')
        .eq('group_id', groupId);
      if (!error && data) setPoolItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('group_history')
        .select('*, media_item:media_items(*)')
        .eq('group_id', groupId)
        .order('decided_at', { ascending: false });
      if (!error && data) setHistoryItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProgressUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_updates')
        .select('*, media_item:media_items(*), profile:profiles(*)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      if (!error && data) setProgressUpdates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserVotesInRound = async () => {
    if (!activeRound || !profile?.id) return;
    try {
      const { count, error } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('voting_round_id', activeRound.id)
        .eq('user_id', profile.id);
      if (!error && count !== null) setVotesCast(count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
    fetchPoolItems();
    fetchHistoryItems();
    fetchProgressUpdates();
  }, [groupId]);

  useEffect(() => {
    if (activeRound) {
      fetchUserVotesInRound();
    } else {
      setVotesCast(0);
    }
  }, [activeRound, profile]);

  const handleProposeMedia = async (item: MediaItem) => {
    addMediaSheetRef.current?.close();
    try {
      // Upsert to DB cache first
      const { data: cachedItem, error: cacheError } = await supabase
        .from('media_items')
        .upsert(
          {
            external_id: item.external_id,
            api_source: item.api_source,
            type: item.type,
            title: item.title,
            cover_url: item.cover_url,
            release_year: item.release_year,
            description: item.description,
            genres: item.genres ?? [],
            metadata: item.metadata ?? {},
          },
          { onConflict: 'external_id,api_source' }
        )
        .select('id')
        .single();

      if (cacheError) throw cacheError;

      const { error } = await supabase
        .from('group_media_pool')
        .insert({
          group_id: groupId,
          media_item_id: (cachedItem as any).id,
          added_by: profile?.id,
        });

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Proposed successfully to the crew pool!', 'success');
        fetchPoolItems();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to propose media', 'error');
    }
  };

  const handleRemovePoolItem = async (poolItemId: string) => {
    try {
      const { error } = await supabase
        .from('group_media_pool')
        .delete()
        .eq('id', poolItemId);
      if (error) throw error;
      showToast('Removed from pool', 'success');
      fetchPoolItems();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove', 'error');
    }
  };

  const handleUpvote = async (mediaPoolId: string) => {
    if (!activeRound) return;
    try {
      await castVote({ roundId: activeRound.id, mediaPoolId });
      showToast('Vote cast!', 'success');
      fetchUserVotesInRound();
      fetchPoolItems();
    } catch (err: any) {
      showToast(err.message || 'Failed to cast vote', 'error');
    }
  };

  const handleEndRound = async () => {
    if (!activeRound) return;
    try {
      const { error } = await supabase.rpc('complete_voting_round', {
        round_id: activeRound.id,
      });
      if (error) throw error;
      showToast('Voting round finalized!', 'success');
      fetchGroupDetails();
      fetchPoolItems();
      fetchHistoryItems();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete round', 'error');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', profile?.id);
      if (error) throw error;
      showToast('Left group successfully', 'success');
      router.replace('/(tabs)/groups');
    } catch (err: any) {
      showToast(err.message || 'Failed to leave group', 'error');
    }
  };

  if (loadingGroup || !group) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const isOwner = group.owner_id === profile?.id;
  const showProgress = group.type === 'private';
  const votesAllowed = group.votes_per_member;

  return (
    <View style={styles.container}>
      <GroupHeader
        group={group}
        isOwner={isOwner}
        onSettingsPress={() => router.push(`/groups/${groupId}/settings`)}
        onLeavePress={handleLeaveGroup}
      />

      <View style={styles.subTabRow}>
        <Pressable
          style={[styles.subTab, activeSubTab === 'pool' && styles.subTabActive]}
          onPress={() => setActiveSubTab('pool')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'pool' && styles.subTabTextActive]}>Pool</Text>
        </Pressable>
        {group.voting_enabled && (
          <Pressable
            style={[styles.subTab, activeSubTab === 'vote' && styles.subTabActive]}
            onPress={() => setActiveSubTab('vote')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'vote' && styles.subTabTextActive]}>Vote</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.subTab, activeSubTab === 'history' && styles.subTabActive]}
          onPress={() => setActiveSubTab('history')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'history' && styles.subTabTextActive]}>History</Text>
        </Pressable>
        {showProgress && (
          <Pressable
            style={[styles.subTab, activeSubTab === 'progress' && styles.subTabActive]}
            onPress={() => setActiveSubTab('progress')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'progress' && styles.subTabTextActive]}>Progress</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.tabContent}>
        {activeSubTab === 'pool' && (
          <GroupMediaPool
            poolItems={poolItems}
            onRemoveItem={handleRemovePoolItem}
            onAddItemPress={() => addMediaSheetRef.current?.open()}
            currentUserId={profile?.id ?? ''}
            isOwner={isOwner}
          />
        )}

        {activeSubTab === 'vote' && group.voting_enabled && (
          <View style={styles.votingContainer}>
            {activeRound ? (
              <VotingRound
                round={activeRound}
                votesRemaining={Math.max(0, votesAllowed - votesCast)}
                onEndRound={handleEndRound}
                isOwner={isOwner}
              >
                {poolItems.map((item) => (
                  <VoteCard
                    key={item.id}
                    mediaItem={item.media_item}
                    votesCount={item.votes_count}
                    onVotePress={() => handleUpvote(item.id)}
                    disabled={votesCast >= votesAllowed}
                  />
                ))}
              </VotingRound>
            ) : (
              <View style={styles.noRound}>
                <Text style={styles.noRoundText}>No active voting round</Text>
                {isOwner && (
                  <Button
                    text="Start Voting Round"
                    onPress={() => startVotingRound(group.voting_duration_minutes)}
                    style={styles.startBtn}
                  />
                )}
              </View>
            )}
          </View>
        )}

        {activeSubTab === 'history' && <GroupHistory historyItems={historyItems} />}

        {activeSubTab === 'progress' && showProgress && (
          <ProgressFeed progressUpdates={progressUpdates} />
        )}
      </View>

      <BottomSheet ref={addMediaSheetRef} title="Propose Media" snapPoints={['80%']}>
        <MediaSearch onItemSelect={handleProposeMedia} />
      </BottomSheet>

      <InviteSheet ref={inviteSheetRef} groupId={groupId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  subTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabActive: {
    borderBottomColor: Colors.primary,
  },
  subTabText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  subTabTextActive: {
    color: Colors.primary,
    fontFamily: FontFamily.bold,
  },
  tabContent: {
    flex: 1,
  },
  votingContainer: {
    flex: 1,
  },
  noRound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noRoundText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  startBtn: {
    width: '100%',
  },
});
