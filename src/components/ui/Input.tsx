import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, TouchTarget, Typography } from '@/constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  helperText?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  onClear?: () => void;
  showClear?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  containerStyle,
  isPassword = false,
  onClear,
  showClear = false,
  value,
  style,
  multiline,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: hasError ? theme.destructive : theme.text,
            },
          ]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.card,
            borderColor: hasError
              ? theme.destructive
              : isFocused
              ? theme.primary
              : theme.border,
            minHeight: multiline ? 96 : TouchTarget.inputHeight,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          multiline={multiline}
          value={value}
          style={[
            styles.textInput,
            {
              color: theme.text,
              paddingTop: multiline ? Spacing.two : 0,
              paddingBottom: multiline ? Spacing.two : 0,
            },
            style,
          ]}
          {...rest}
        />

        {showClear && Boolean(value) && onClear && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear input"
            hitSlop={12}
            onPress={onClear}
            style={styles.actionIcon}>
            <Ionicons name="close-circle" size={20} color={theme.textMuted} />
          </Pressable>
        )}

        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            hitSlop={12}
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.actionIcon}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.textMuted}
            />
          </Pressable>
        )}
      </View>

      {hasError ? (
        <Text style={[styles.feedbackText, { color: theme.destructive }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.feedbackText, { color: theme.textSecondary }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: '600',
    marginBottom: Spacing.half,
  },
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.two,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.base,
    minHeight: TouchTarget.inputHeight,
  },
  actionIcon: {
    padding: Spacing.half,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  feedbackText: {
    fontSize: Typography.xs,
    marginTop: Spacing.quarter,
    paddingHorizontal: Spacing.half,
  },
});
