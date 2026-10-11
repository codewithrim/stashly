import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_PREF_KEY = '@stashly_biometric_enabled';

interface BiometricsContextType {
  isSupported: boolean;
  isEnrolled: boolean;
  isBiometricEnabled: boolean;
  isUnlocked: boolean;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
  promptUnlock: () => Promise<boolean>;
}

const BiometricsContext = createContext<BiometricsContextType | null>(null);

export function BiometricsProvider({ children }: { children: React.ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function checkHardware() {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        const savedPref = await SecureStore.getItemAsync(BIOMETRIC_PREF_KEY);
        const enabled = savedPref === 'true';

        if (isCurrent) {
          setIsSupported(hasHardware);
          setIsEnrolled(enrolled);
          setIsBiometricEnabled(enabled);
          // If not enabled or device doesn't have it, unlock automatically
          setIsUnlocked(!enabled);
        }
      } catch (err) {
        console.warn('Biometrics check error:', err);
        if (isCurrent) {
          setIsUnlocked(true);
        }
      }
    }

    checkHardware();

    return () => {
      isCurrent = false;
    };
  }, []);

  const promptUnlock = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Stashly',
        fallbackLabel: 'Use Device Passcode',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setIsUnlocked(true);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Authentication prompt error:', err);
      return false;
    }
  };

  const enableBiometrics = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable Biometric Lock for Stashly',
        fallbackLabel: 'Use Device Passcode',
      });

      if (result.success) {
        await SecureStore.setItemAsync(BIOMETRIC_PREF_KEY, 'true');
        setIsBiometricEnabled(true);
        setIsUnlocked(true);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to enable biometrics:', err);
      return false;
    }
  };

  const disableBiometrics = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_PREF_KEY);
      setIsBiometricEnabled(false);
      setIsUnlocked(true);
    } catch (err) {
      console.warn('Failed to disable biometrics:', err);
    }
  };

  const value = useMemo(
    () => ({
      isSupported,
      isEnrolled,
      isBiometricEnabled,
      isUnlocked,
      enableBiometrics,
      disableBiometrics,
      promptUnlock,
    }),
    [isSupported, isEnrolled, isBiometricEnabled, isUnlocked]
  );

  return (
    <BiometricsContext.Provider value={value}>
      {children}
    </BiometricsContext.Provider>
  );
}

export function useBiometrics(): BiometricsContextType {
  const context = useContext(BiometricsContext);
  if (!context) {
    throw new Error('useBiometrics must be used within a BiometricsProvider');
  }
  return context;
}
