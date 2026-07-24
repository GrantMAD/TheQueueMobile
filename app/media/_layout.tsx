import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export default function MediaLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTitleStyle: {
          fontFamily: FontFamily.bold,
          fontSize: FontSize.lg,
          color: Colors.textPrimary,
        },
        headerTintColor: Colors.primary,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
