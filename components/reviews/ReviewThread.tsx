import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { relativeDate } from '@/lib/utils/formatters';

export interface Comment {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

interface ReviewThreadProps {
  comments: Comment[];
  onAddComment: (text: string, parentId?: string) => void;
}

export function ReviewThread({ comments, onAddComment }: ReviewThreadProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    onAddComment(inputText.trim());
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CommentItem item={item} onReply={onAddComment} />
        )}
        ListHeaderComponent={<Text style={styles.title}>Comments ({comments.length})</Text>}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputBar}>
        <Input
          placeholder="Add a comment..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.inputField}
        />
        <Button
          text="Send"
          variant="primary"
          size="sm"
          onPress={handleSubmit}
          disabled={!inputText.trim()}
          style={styles.sendBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function CommentItem({ item, onReply }: { item: Comment; onReply: (text: string, parentId?: string) => void }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const authorName = item.profile?.display_name ?? item.profile?.username ?? 'Anonymous';

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(replyText.trim(), item.id);
    setReplyText('');
    setShowReplyInput(false);
  };

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Avatar url={item.profile?.avatar_url} name={authorName} size="sm" />
        <View style={styles.commentHeaderInfo}>
          <Text style={styles.author}>{authorName}</Text>
          <Text style={styles.date}>{relativeDate(item.created_at)}</Text>
        </View>
      </View>

      <Text style={styles.body}>{item.body}</Text>

      <View style={styles.commentActions}>
        <Button
          text="Reply"
          variant="ghost"
          size="sm"
          onPress={() => setShowReplyInput(!showReplyInput)}
          style={styles.replyBtn}
          textStyle={styles.replyBtnText}
        />
      </View>

      {showReplyInput && (
        <View style={styles.replyInputRow}>
          <Input
            placeholder={`Reply to ${authorName}...`}
            value={replyText}
            onChangeText={setReplyText}
            style={styles.replyField}
          />
          <Button
            text="Post"
            variant="primary"
            size="sm"
            onPress={handleReplySubmit}
            disabled={!replyText.trim()}
          />
        </View>
      )}

      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesList}>
          {item.replies.map((reply) => {
            const replyAuthor = reply.profile?.display_name ?? reply.profile?.username ?? 'Anonymous';
            return (
              <View key={reply.id} style={styles.replyCard}>
                <View style={styles.commentHeader}>
                  <Avatar url={reply.profile?.avatar_url} name={replyAuthor} size="sm" />
                  <View style={styles.commentHeaderInfo}>
                    <Text style={styles.author}>{replyAuthor}</Text>
                    <Text style={styles.date}>{relativeDate(reply.created_at)}</Text>
                  </View>
                </View>
                <Text style={styles.replyBody}>{reply.body}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  commentCard: {
    marginBottom: 20,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentHeaderInfo: {
    marginLeft: 10,
  },
  author: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  date: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginLeft: 42,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginLeft: 42,
    marginTop: 6,
  },
  replyBtn: {
    paddingHorizontal: 0,
    height: 'auto',
  },
  replyBtnText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  replyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 42,
    marginTop: 10,
    gap: 8,
  },
  replyField: {
    flex: 1,
    height: 38,
  },
  repliesList: {
    marginLeft: 42,
    marginTop: 12,
    borderLeftWidth: 1,
    borderLeftColor: Colors.surfaceBorder,
    paddingLeft: 14,
    gap: 16,
  },
  replyCard: {
    marginBottom: 4,
  },
  replyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 42,
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    gap: 10,
  },
  inputField: {
    flex: 1,
  },
  sendBtn: {
    height: 48,
  },
});
