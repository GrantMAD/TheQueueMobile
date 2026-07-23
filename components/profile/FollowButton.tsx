import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onToggle?: (isFollowing: boolean) => void;
}

export function FollowButton({ userId, initialIsFollowing = false, onToggle }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    // We only fetch if we want to confirm status, but usually initialIsFollowing is reliable.
    // For safety, let's fetch real status on mount if logged in.
    let isMounted = true;
    const checkFollow = async () => {
      if (!session?.user?.id) return;
      try {
        const { data } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', session.user.id)
          .eq('following_id', userId)
          .single();
        
        if (isMounted && data) {
          setIsFollowing(true);
        }
      } catch (err) {
        // Not following or error
      }
    };
    checkFollow();
    return () => { isMounted = false; };
  }, [userId, session]);

  const handleToggle = async () => {
    if (!session?.user?.id) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    
    const newStatus = !isFollowing;
    setIsFollowing(newStatus);
    onToggle?.(newStatus);

    try {
      if (newStatus) {
        await supabase
          .from('follows')
          .insert({
            follower_id: session.user.id,
            following_id: userId,
          });
      } else {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);
      }
    } catch (err) {
      // Revert on error
      setIsFollowing(!newStatus);
      onToggle?.(!newStatus);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user?.id || session.user.id === userId) {
    return null;
  }

  return (
    <Button
      text={isFollowing ? 'Following' : 'Follow'}
      variant={isFollowing ? 'secondary' : 'primary'}
      size="sm"
      onPress={handleToggle}
      loading={loading}
    />
  );
}
