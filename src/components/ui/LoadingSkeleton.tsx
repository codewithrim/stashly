import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.border,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export function ItemCardSkeleton() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}>
      <View style={styles.headerRow}>
        <Skeleton width={60} height={22} borderRadius={BorderRadius.sm} />
        <Skeleton width={70} height={16} />
      </View>
      <Skeleton width="80%" height={20} style={{ marginVertical: Spacing.one }} />
      <Skeleton width="95%" height={14} style={{ marginBottom: Spacing.half }} />
      <Skeleton width="60%" height={14} style={{ marginBottom: Spacing.two }} />
      <View style={styles.tagsRow}>
        <Skeleton width={50} height={20} borderRadius={BorderRadius.sm} />
        <Skeleton width={65} height={20} borderRadius={BorderRadius.sm} />
      </View>
    </View>
  );
}

export function ItemListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <ItemCardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardContainer: {
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
});
