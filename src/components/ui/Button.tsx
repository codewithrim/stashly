import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, TouchTarget, Typography } from '@/constants/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  testID,
}: ButtonProps) {
  const theme = useTheme();

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let backgroundColor: string = theme.primary;
    let borderColor: string = 'transparent';
    let borderWidth = 0;

    switch (variant) {
      case 'primary':
        backgroundColor = pressed ? theme.primaryPressed : theme.primary;
        break;
      case 'secondary':
        backgroundColor = pressed ? theme.backgroundSelected : theme.backgroundElement;
        break;
      case 'destructive':
        backgroundColor = pressed ? '#B91C1C' : theme.destructive;
        break;
      case 'outline':
        backgroundColor = pressed ? theme.backgroundElement : 'transparent';
        borderColor = theme.border;
        borderWidth = 1;
        break;
      case 'ghost':
        backgroundColor = pressed ? theme.backgroundElement : 'transparent';
        break;
    }

    if (disabled) {
      backgroundColor = variant === 'ghost' || variant === 'outline' ? 'transparent' : theme.backgroundSelected;
      borderColor = theme.border;
    }

    let minHeight: number = TouchTarget.buttonHeight;
    let paddingHorizontal: number = Spacing.three;

    if (size === 'sm') {
      minHeight = 40;
      paddingHorizontal = Spacing.two;
    } else if (size === 'lg') {
      minHeight = 52;
      paddingHorizontal = Spacing.four;
    }

    return {
      minHeight,
      paddingHorizontal,
      backgroundColor,
      borderColor,
      borderWidth,
      borderRadius: BorderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.one,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextColor = (): string => {
    if (disabled) return theme.textMuted;
    switch (variant) {
      case 'primary':
      case 'destructive':
        return theme.primaryForeground;
      case 'outline':
      case 'ghost':
      case 'secondary':
        return theme.text;
    }
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [getContainerStyle(pressed), style]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? theme.primaryForeground : theme.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? Typography.sm : Typography.base,
              },
              textStyle,
            ]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
