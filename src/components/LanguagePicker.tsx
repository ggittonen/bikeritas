import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings, type Language } from '@/i18n/strings';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { BigButton } from './BigButton';
import { BrandTitle } from './BrandHeader';

const LANGUAGES: Language[] = ['fi', 'en'];

/** Full-screen first-launch step: pick a language before the app opens. */
export function LanguagePicker({ onPick }: { onPick: (language: Language) => void }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <BrandTitle />
      </View>
      <View style={styles.content}>
        <AppText upper size={20} style={styles.center}>
          Valitse kieli{'\n'}Choose language
        </AppText>
        <View style={styles.buttons}>
          {LANGUAGES.map((lang) => (
            <BigButton key={lang} title={strings[lang].languageName} onPress={() => onPick(lang)} />
          ))}
        </View>
        <AppText size={13} color={colors.muted} style={styles.center}>
          Voit vaihtaa kielen myöhemmin MUUT-välilehdellä.{'\n'}You can change it later in the MORE tab.
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingVertical: spacing.md, backgroundColor: colors.chrome },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.xl },
  center: { textAlign: 'center', lineHeight: 30 },
  buttons: { gap: spacing.md },
});
