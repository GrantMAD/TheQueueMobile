import React, { forwardRef, useState } from 'react';
import { View, StyleSheet, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { BottomSheet, BottomSheetRef } from '../ui/BottomSheet';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { supabase } from '@/lib/supabase/client';
import { useUIStore } from '@/store/uiStore';

interface InviteSheetProps {
  groupId: string;
  onInviteSent?: () => void;
}

interface SearchedUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export const InviteSheet = forwardRef<BottomSheetRef, InviteSheetProps>(
  ({ groupId, onInviteSent }, ref) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [usersList, setUsersList] = useState<SearchedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [pendingInvites, setPendingInvites] = useState<Record<string, boolean>>({});
    
    const showToast = useUIStore((state) => state.showToast);

    const handleSearch = async (text: string) => {
      setSearchQuery(text);
      if (!text.trim()) {
        setUsersList([]);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .ilike('username', `%${text.trim()}%`)
          .limit(5);

        if (!error && data) {
          setUsersList(data as unknown as SearchedUser[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handleSendInvite = async (userId: string) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { error } = await supabase
          .from('group_invites')
          .insert({
            group_id: groupId,
            invited_by: session.user.id,
            invited_user_id: userId,
            status: 'pending',
          });

        if (error) {
          showToast(error.message, 'error');
        } else {
          showToast('Invite sent successfully!', 'success');
          setPendingInvites((prev) => ({ ...prev, [userId]: true }));
          if (onInviteSent) onInviteSent();
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to send invite', 'error');
      }
    };

    return (
      <BottomSheet ref={ref} title="Invite Friends" snapPoints={['60%', '80%']}>
        <View style={styles.container}>
          <Input
            placeholder="Search by username..."
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchBar}
            clearButtonMode="while-editing"
          />

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={usersList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const name = item.display_name ?? item.username;
                const invited = pendingInvites[item.id];
                return (
                  <View style={styles.userRow}>
                    <Avatar url={item.avatar_url} name={name} size="sm" />
                    <View style={styles.userInfo}>
                      <Text style={styles.name}>{name}</Text>
                      <Text style={styles.username}>@{item.username}</Text>
                    </View>
                    <Button
                      text={invited ? 'Invited' : 'Invite'}
                      variant={invited ? 'secondary' : 'primary'}
                      size="sm"
                      disabled={invited}
                      onPress={() => handleSendInvite(item.id)}
                      style={styles.inviteBtn}
                    />
                  </View>
                );
              }}
              ListEmptyComponent={
                searchQuery.trim() ? (
                  <Text style={styles.emptyText}>No users found</Text>
                ) : null
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    marginBottom: 16,
  },
  loader: {
    marginTop: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  username: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inviteBtn: {
    height: 32,
    borderRadius: 8,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
});
