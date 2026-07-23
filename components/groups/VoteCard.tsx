import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MediaItem } from '@/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface VoteCardProps {
  mediaItem: MediaItem;
  votesCount: number;
  onVotePress: () => void;
  disabled?: boolean;
}

export function VoteCard({ mediaItem, votesCount, onVotePress, disabled = false }: VoteCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {mediaItem.title}
          </Text>
          <Text style={styles.votes}>
            {votesCount} {votesCount === 1 ? 'vote' : 'votes'}
          </Text>
        </View>

        <Button
          text="▲ Upvote"
          variant="secondary"
          size="sm"
          onPress={onVotePress}
          disabled={disabled}
          style={styles.voteBtn}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  votes: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  voteBtn: {
    height: 32,
    borderRadius: 8,
  },
});
