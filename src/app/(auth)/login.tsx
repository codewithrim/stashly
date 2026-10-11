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

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      await signIn(trimmedEmail, password);
      router.replace('/' as Href);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
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
              <Ionicons name="bookmark" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Stashly</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Save and organize notes, links, and images.
            </Text>
          </View>

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
              placeholder="Enter your password"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (errorMessage) setErrorMessage(null);
              }}
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Button
              title="Log In"
              variant="primary"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />
          </View>

          {/* Footer switch to sign up */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {"Don't have an account? "}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go to sign up"
              onPress={() => router.push('/(auth)/signup' as Href)}>
              <Text style={[styles.signupLink, { color: theme.primary }]}>
                Sign Up
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
  loginBtn: {
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
  signupLink: {
    fontSize: Typography.sm,
    fontWeight: '700',
  },
});
