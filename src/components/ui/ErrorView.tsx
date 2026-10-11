import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography } from '@/constants/theme';

export interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorView({
  message,
  onRetry,
  style,
}: ErrorViewProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.destructiveLight },
        ]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.destructive} />
      </View>

      <Text style={[styles.title, { color: theme.text }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </Text>

      {onRetry && (
        <View style={styles.actionWrapper}>
          <Button
            title="Try Again"
            onPress={onRetry}
            variant="primary"
            icon={<Ionicons name="reload" size={18} color={theme.primaryForeground} style={{ marginRight: 6 }} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  message: {
    fontSize: Typography.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  actionWrapper: {
    marginTop: Spacing.four,
    width: 180,
  },
});
