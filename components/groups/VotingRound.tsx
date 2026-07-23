import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { VotingRound as VotingRoundType } from '@/types';
import { Button } from '../ui/Button';

interface VotingRoundProps {
  round: VotingRoundType;
  votesRemaining: number;
  onEndRound?: () => void;
  isOwner: boolean;
  children?: React.ReactNode;
}

export function VotingRound({
  round,
  votesRemaining,
  onEndRound,
  isOwner,
  children,
}: VotingRoundProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!round.ends_at) return;

    const interval = setInterval(() => {
      const remainingMs = new Date(round.ends_at!).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft('Voting finished');
        clearInterval(interval);
      } else {
        const secs = Math.floor((remainingMs / 1000) % 60);
        const mins = Math.floor((remainingMs / 60000) % 60);
        const hours = Math.floor(remainingMs / 3600000);
        setTimeLeft(
          `${hours > 0 ? `${hours}h ` : ''}${mins}m ${secs}s remaining`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [round.ends_at]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ACTIVE VOTING</Text>
        </View>
        <Text style={styles.timer}>{timeLeft}</Text>
      </View>

      <Text style={styles.info}>
        You have <Text style={styles.bold}>{votesRemaining}</Text> votes remaining for this round.
      </Text>

      <View style={styles.listContainer}>{children}</View>

      {isOwner && onEndRound && (
        <Button
          text="End Voting Round"
          variant="destructive"
          onPress={onEndRound}
          style={styles.endBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: Colors.primaryAlpha10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  timer: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.error,
  },
  info: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  bold: {
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  listContainer: {
    gap: 12,
    marginBottom: 16,
  },
  endBtn: {
    marginTop: 10,
  },
});
