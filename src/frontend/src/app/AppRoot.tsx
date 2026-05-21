import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';
import { paperTheme } from '../theme/paperTheme';

export function AppRoot() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <RootNavigator />
        <StatusBar style="dark" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
