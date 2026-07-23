import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { MediaItem, LibraryEntry, Review } from '@/types';
import { MediaDetail } from '@/components/media/MediaDetail';
import { AddToLibrarySheet } from '@/components/media/AddToLibrarySheet';
import { ProgressTracker } from '@/components/media/ProgressTracker';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { BottomSheetRef } from '@/components/ui/BottomSheet';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useAuthStore } from '@/store/authStore';

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [libraryEntry, setLibraryEntry] = useState<LibraryEntry | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const session = useAuthStore((state) => state.session);
  const addSheetRef = useRef<BottomSheetRef>(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (mediaError || !mediaData) throw mediaError;
      setMediaItem(mediaData as unknown as MediaItem);

      if (session?.user?.id) {
        const { data: libData } = await supabase
          .from('library')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('media_item_id', id)
          .single();
        if (libData) setLibraryEntry(libData as unknown as LibraryEntry);
      }

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*, profile:profiles(*)')
        .eq('media_item_id', id)
        .order('created_at', { ascending: false });
      
      if (reviewsData) setReviews(reviewsData as any[]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id, session]);

  const handleUpdateProgress = async (newVal: number, field: string) => {
    if (!libraryEntry || !session?.user?.id) return;
    try {
      const { data } = await supabase
        .from('library')
        .update({ [field]: newVal })
        .eq('id', libraryEntry.id)
        .select()
        .single();
      if (data) setLibraryEntry(data as unknown as LibraryEntry);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (status: any) => {
    if (!session?.user?.id) return;
    try {
      if (libraryEntry) {
        const { data } = await supabase.from('library').update({ status }).eq('id', libraryEntry.id).select().single();
        if (data) setLibraryEntry(data as unknown as LibraryEntry);
      } else {
        const { data } = await supabase.from('library').insert({ user_id: session.user.id, media_item_id: id, status }).select().single();
        if (data) setLibraryEntry(data as unknown as LibraryEntry);
      }
      addSheetRef.current?.close();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!mediaItem) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Media not found</Text>
      </View>
    );
  }

  let progressLabel = '';
  let progressValue = 0;
  let progressField = '';
  let progressMax: number | undefined;

  if (mediaItem.type === 'book') {
    progressLabel = 'Pages Read';
    progressValue = libraryEntry?.current_page || 0;
    progressField = 'current_page';
    progressMax = (mediaItem.metadata?.page_count as number) || undefined;
  } else if (mediaItem.type === 'tv' || mediaItem.type === 'anime') {
    progressLabel = 'Episodes Watched';
    progressValue = libraryEntry?.current_episode || 0;
    progressField = 'current_episode';
    progressMax = (mediaItem.metadata?.total_episodes as number) || undefined;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerStyle: { backgroundColor: Colors.surface } }} />
      <MediaDetail
        item={mediaItem}
        status={libraryEntry?.status}
        onStatusPress={() => addSheetRef.current?.open()}
        actionButtonText="Write Review"
        onActionButtonPress={() => { /* Navigate to review form */ }}
      >
        {libraryEntry?.status === 'current' && progressField !== '' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <ProgressTracker
              label={progressLabel}
              value={progressValue}
              max={progressMax}
              onChange={(val) => handleUpdateProgress(val, progressField)}
            />
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewWrapper}>
                <ReviewCard 
                  review={review} 
                  onUserPress={() => router.push(`/profile/${review.profile?.username}`)}
                />
              </View>
            ))
          )}
        </View>
      </MediaDetail>

      <AddToLibrarySheet 
        ref={addSheetRef} 
        currentStatus={libraryEntry?.status} 
        onStatusSelect={handleUpdateStatus} 
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
  },
  reviewWrapper: {
    marginBottom: 16,
  }
});
