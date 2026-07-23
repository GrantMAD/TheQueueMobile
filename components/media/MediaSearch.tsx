import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { MediaItem, MediaType } from '@/types';
import { searchMedia } from '@/lib/api/mediaSearch';
import { Input } from '../ui/Input';
import { MediaCard } from './MediaCard';
import { Button } from '../ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { debounce } from '@/lib/utils/helpers';

interface MediaSearchProps {
  onItemSelect: (item: MediaItem) => void;
  placeholder?: string;
  initialType?: MediaType | 'all';
}

export function MediaSearch({ onItemSelect, placeholder = 'Search movies, books, anime...', initialType = 'all' }: MediaSearchProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<MediaType | 'all'>(initialType);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (searchQuery: string, searchType: MediaType | 'all') => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchMedia({ query: searchQuery, type: searchType });
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((q: string, t: MediaType | 'all') => performSearch(q, t), 400),
    []
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text, type);
  };

  const handleTypeChange = (newType: MediaType | 'all') => {
    setType(newType);
    performSearch(query, newType);
  };

  const filterChips: { label: string; value: MediaType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Movies', value: 'movie' },
    { label: 'TV', value: 'tv' },
    { label: 'Books', value: 'book' },
    { label: 'Anime', value: 'anime' },
  ];

  return (
    <View style={styles.container}>
      <Input
        placeholder={placeholder}
        value={query}
        onChangeText={handleQueryChange}
        style={styles.searchInput}
        clearButtonMode="while-editing"
      />

      <View style={styles.chipContainer}>
        {filterChips.map((chip) => {
          const isActive = type === chip.value;
          return (
            <Button
              key={chip.value}
              text={chip.label}
              variant={isActive ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => handleTypeChange(chip.value)}
              style={styles.chipButton}
              textStyle={isActive ? styles.chipTextActive : styles.chipText}
            />
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.api_source}_${item.external_id}`}
          renderItem={({ item }) => (
            <MediaCard item={item} onPress={() => onItemSelect(item)} />
          )}
          ListEmptyComponent={
            query.trim() ? (
              <Text style={styles.emptyText}>No results found</Text>
            ) : null
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
  searchInput: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  chipButton: {
    borderRadius: 20,
    height: 32,
    paddingHorizontal: 12,
  },
  chipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    fontSize: FontSize.xs,
    color: Colors.textInverse,
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
