import { Slot } from 'expo-router'
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite'
import { ActivityIndicator } from 'react-native';
import { Suspense, useState } from 'react'
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from 'drizzle/migrations'

export const DATABASE_NAME = 'users_table';

export default function RootLayout() {
  const [isDbReady, setIsDbReady] = useState(false);

  // Use synchronous version instead of async version
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider databaseName={DATABASE_NAME} options={{enableChangeListener:true}} useSuspense>
        <Slot />
      </SQLiteProvider>
    </Suspense>
  )
}