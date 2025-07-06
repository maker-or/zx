import { Slot } from 'expo-router';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { ActivityIndicator } from 'react-native';
import { Suspense } from 'react';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../drizzle/migrations';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

export const DATABASE_NAME = 'users_table';

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    console.error('Migration error:', error);
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <Suspense fallback={<ActivityIndicator size="large" />}>
            <SQLiteProvider
              databaseName={DATABASE_NAME}
              options={{ enableChangeListener: true }}
              useSuspense
            >
              <Slot />
            </SQLiteProvider>
          </Suspense>
        </ThemeProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
