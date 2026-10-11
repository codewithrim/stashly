import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Href, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/auth.context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

export default function SignupScreen() {
  const theme = useTheme();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState(false);

  const handleSignup = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const { requiresEmailVerification } = await signUp(trimmedEmail, password);
      if (requiresEmailVerification) {
        setVerificationNotice(true);
      } else {
        router.replace('/' as Href);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: theme.backgroundElement },
              ]}>
              <Ionicons name="person-add" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Join Stashly to keep your notes, links, and images synced.
            </Text>
          </View>

          {/* Verification Notice */}
          {verificationNotice ? (
            <View
              style={[
                styles.noticeBanner,
                {
                  backgroundColor: theme.badgeNote,
                  borderColor: theme.primary,
                },
              ]}>
              <Ionicons name="mail" size={24} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.noticeTitle, { color: theme.text }]}>
                  Check your email
                </Text>
                <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
                  We sent a confirmation link to {email}. Click it to verify your account and sign in.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Error Banner */}
              {errorMessage && (
                <View
                  style={[
                    styles.errorBanner,
                    {
                      backgroundColor: theme.destructiveLight,
                      borderColor: theme.destructive,
                    },
                  ]}>
                  <Ionicons name="alert-circle" size={18} color={theme.destructive} />
                  <Text style={[styles.errorText, { color: theme.destructive }]}>
                    {errorMessage}
                  </Text>
                </View>
              )}

              {/* Form */}
              <View style={styles.form}>
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                />

                <Input
                  label="Password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  isPassword
                  returnKeyType="next"
                />

                <Input
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  isPassword
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />

                <Button
                  title="Sign Up"
                  variant="primary"
                  onPress={handleSignup}
                  loading={loading}
                  style={styles.signupBtn}
                />
              </View>
            </>
          )}

          {/* Footer switch to log in */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go to log in"
              onPress={() => router.push('/(auth)/login' as Href)}>
              <Text style={[styles.loginLink, { color: theme.primary }]}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.sm,
    marginTop: Spacing.half,
    textAlign: 'center',
  },
  noticeBanner: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  noticeTitle: {
    fontSize: Typography.base,
    fontWeight: '700',
    marginBottom: 2,
  },
  noticeText: {
    fontSize: Typography.xs,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  errorText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    flex: 1,
  },
  form: {
    marginBottom: Spacing.three,
  },
  signupBtn: {
    marginTop: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  footerText: {
    fontSize: Typography.sm,
  },
  loginLink: {
    fontSize: Typography.sm,
    fontWeight: '700',
  },
});
