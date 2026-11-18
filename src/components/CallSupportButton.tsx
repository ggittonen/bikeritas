import { Linking, StyleSheet, View } from 'react-native';

import { useI18n } from '@/i18n/LanguageContext';
import { SUPPORT_PHONE } from '@/services/support/supportContact';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

/**
 * Talk to a person: opens the phone's dialler with the customer service number.
 * Shows the case number once there is one, so the agent finds the case at once.
 * Only for Bikeritas Turva subscribers (the caller decides).
 */
export function CallSupportButton({ caseId }: { caseId?: string }) {
  const { s } = useI18n();
  return (
    <View style={styles.wrap}>
      <BigButton
        title={s.support.call}
        variant="secondary"
        onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE.dial}`)}
      />
      <AppText size={13} color={colors.muted} style={styles.center}>
        {SUPPORT_PHONE.display}
        {caseId ? ` · ${s.support.caseRef(caseId)}` : ''}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  center: { textAlign: 'center' },
});
