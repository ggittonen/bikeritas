import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { Card } from '@/components/Card';
import { useI18n } from '@/i18n/LanguageContext';
import { strings, type Language } from '@/i18n/strings';
import { TAG_SOURCE_IDS, type TagSourceId } from '@/services';
import { formatBikeId, normalizeBikeId } from '@/services/backend/bikeChannel';
import { backendConfigured } from '@/services/backend/firebase';
import { useBike } from '@/state/BikeContext';
import { colors, fonts, spacing } from '@/theme';

const LANGUAGES: Language[] = ['fi', 'en'];

/** More tab: language, subscription, where the location comes from, and tag mode. */
export default function MoreScreen() {
  const { s, language, setLanguage } = useI18n();
  const { tagSource, remoteBikeId, setTagSource, subscriptionActive, setSubscription } = useBike();
  const [showCodeInput, setShowCodeInput] = useState(false);

  const onSelectSource = (id: TagSourceId) => {
    if (id === 'remote') setShowCodeInput(true);
    else {
      setShowCodeInput(false);
      setTagSource(id);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card title={s.more.languageTitle}>
        <View style={styles.languageRow}>
          {LANGUAGES.map((lang) => (
            <Option key={lang} selected={lang === language} onPress={() => setLanguage(lang)} style={styles.flex}>
              {strings[lang].languageName}
            </Option>
          ))}
        </View>
      </Card>

      <Card title={s.more.subscriptionTitle}>
        <AppText size={14} style={styles.body}>
          {s.more.subscriptionBody}
        </AppText>
        <View style={styles.switchRow}>
          <AppText upper bold color={subscriptionActive ? colors.success : colors.muted}>
            {subscriptionActive ? s.more.subscriptionActive : s.more.noSubscription}
          </AppText>
          <Switch
            value={subscriptionActive}
            onValueChange={setSubscription}
            trackColor={{ true: colors.success, false: colors.divider }}
          />
        </View>
        <AppText size={12} color={colors.muted}>
          {s.more.subscriptionNote}
        </AppText>
      </Card>

      <Card title={s.more.sourceTitle}>
        {TAG_SOURCE_IDS.map((id) => (
          <Option key={id} selected={id === tagSource} onPress={() => onSelectSource(id)}>
            {s.more.sources[id]}
            {id === 'remote' && tagSource === 'remote' && remoteBikeId ? (
              <AppText size={13} color={colors.muted}>
                {'\n'}
                {s.more.code(formatBikeId(remoteBikeId))}
              </AppText>
            ) : null}
          </Option>
        ))}
        {showCodeInput || (tagSource === 'remote' && !remoteBikeId) ? (
          <PairWithTag
            onPair={(id) => {
              setTagSource('remote', id);
              setShowCodeInput(false);
            }}
          />
        ) : null}
        <AppText size={12} color={colors.muted}>
          {s.more.sourceChangeNote}
        </AppText>
      </Card>

      <Card title={s.more.tagModeTitle}>
        <AppText size={14} style={styles.body}>
          {s.more.tagModeBody}
        </AppText>
        <BigButton title={s.more.startTagMode} onPress={() => router.push('/tag-mode')} />
      </Card>
    </ScrollView>
  );
}

function Option({
  selected,
  onPress,
  children,
  style,
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  style?: object;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected, style]}
    >
      <AppText upper color={selected ? colors.text : colors.muted}>
        {selected ? '● ' : '○ '}
        {children}
      </AppText>
    </Pressable>
  );
}

function PairWithTag({ onPair }: { onPair: (bikeId: string) => void }) {
  const { s } = useI18n();
  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState(false);

  if (!backendConfigured) {
    return (
      <AppText size={13} color={colors.warning}>
        {s.more.backendMissing}
      </AppText>
    );
  }

  const submit = () => {
    const id = normalizeBikeId(code);
    setInvalid(!id);
    if (id) onPair(id);
  };

  return (
    <View style={styles.pair}>
      <AppText size={13} color={colors.muted}>
        {s.more.pairHint}
      </AppText>
      <TextInput
        value={code}
        onChangeText={setCode}
        onSubmitEditing={submit}
        placeholder="ABCD-EFGH"
        placeholderTextColor={colors.muted}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={9}
        style={styles.input}
      />
      {invalid ? (
        <AppText size={13} color={colors.danger}>
          {s.more.pairInvalid}
        </AppText>
      ) : null}
      <BigButton title={s.more.connect} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  body: { lineHeight: 21 },
  flex: { flex: 1 },
  languageRow: { flexDirection: 'row', gap: spacing.sm },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  option: { padding: spacing.md, borderWidth: 2, borderColor: colors.divider },
  optionSelected: { borderColor: colors.text },
  pair: { gap: spacing.sm },
  input: {
    borderWidth: 2,
    borderColor: colors.text,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 22,
    letterSpacing: 3,
    padding: spacing.md,
    textAlign: 'center',
  },
});
