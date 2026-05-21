import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';

type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    padding: 20,
    backgroundColor: colors.background,
  },
});
