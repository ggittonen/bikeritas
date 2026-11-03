import { StyleSheet, View } from 'react-native';
import { colors, fonts } from '@/theme';
import { AppText } from './AppText';
import { BikeIcon } from './icons';

export function BrandTitle() {
  return (
    <View style={styles.row}>
      <AppText size={20} style={styles.word}>
        BIKERITAS
      </AppText>
      <BikeIcon size={28} />
    </View>
  );
}

/** Shared header look for every navigator: dark bar, centered logo. */
export const brandHeaderOptions = {
  headerStyle: { backgroundColor: colors.chrome },
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: fonts.regular },
  headerShadowVisible: false,
  headerTitleAlign: 'center' as const,
  headerTitle: () => <BrandTitle />,
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  word: { letterSpacing: 2 },
});
