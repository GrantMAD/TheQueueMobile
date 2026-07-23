import Constants from 'expo-constants';

export const Config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',

  // Pagination
  feedPageSize: 20,
  libraryPageSize: 30,
  searchPageSize: 20,
  groupsPageSize: 20,
  notificationsPageSize: 30,

  // Voting
  defaultVotesPerMember: 3,
  defaultVotingDurationMinutes: 60,

  // Bio / review limits (mirror DB constraints)
  maxBioLength: 300,
  maxReviewHookLength: 280,
  maxReviewBodyLength: 5000,
  maxProgressNoteLength: 500,

  // Image sizes
  avatarSizes: {
    sm: 32,
    md: 44,
    lg: 64,
    xl: 96,
  },

  appVersion: Constants.expoConfig?.version ?? '1.0.0',
} as const;
