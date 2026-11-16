import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import type { BikeProfile } from '@/domain/types';
import { useI18n } from '@/i18n/LanguageContext';
import { useBike } from '@/state/BikeContext';
import { colors, fonts, spacing } from '@/theme';

const MAX_PHOTOS = 4;

/**
 * Bike details: shown once after the language choice and editable from the
 * More tab. Saved details go into the theft report automatically.
 */
export default function BikeSetupScreen() {
  const { s } = useI18n();
  const { profile, setupDone, setProfile } = useBike();
  const [draft, setDraft] = useState<BikeProfile>(profile);
  const [cameraDenied, setCameraDenied] = useState(false);

  type TextField = 'make' | 'model' | 'color' | 'frameNumber' | 'insurer' | 'policyNumber';
  const set = (field: TextField) => (value: string) =>
    setDraft((d) => ({ ...d, [field]: value }));

  const pickImage = async (fromCamera: boolean): Promise<string | null> => {
    if (fromCamera) {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      setCameraDenied(!granted);
      if (!granted) return null;
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6 };
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    return result.canceled ? null : result.assets[0].uri;
  };

  const addPhoto = async (fromCamera: boolean) => {
    const uri = await pickImage(fromCamera);
    if (uri) setDraft((d) => ({ ...d, photos: [...d.photos, uri].slice(0, MAX_PHOTOS) }));
  };

  const setReceipt = async (fromCamera: boolean) => {
    const uri = await pickImage(fromCamera);
    if (uri) setDraft((d) => ({ ...d, receiptUri: uri }));
  };

  // First launch comes here by redirect, so there may be nothing to go back to.
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const save = () => {
    setProfile({
      ...draft,
      make: draft.make.trim(),
      model: draft.model.trim(),
      color: draft.color.trim(),
      frameNumber: draft.frameNumber.trim(),
      insurer: draft.insurer.trim(),
      policyNumber: draft.policyNumber.trim(),
    });
    leave();
  };

  const skip = () => {
    setProfile(profile); // marks setup done without changing anything
    leave();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <AppText bold upper size={22}>
        {s.setup.title}
      </AppText>
      <AppText size={14} style={styles.body}>
        {s.setup.intro}
      </AppText>

      <Field label={s.setup.make} value={draft.make} onChangeText={set('make')} />
      <Field label={s.setup.model} value={draft.model} onChangeText={set('model')} />
      <Field label={s.setup.color} value={draft.color} onChangeText={set('color')} />
      <Field
        label={s.setup.frameNumber}
        hint={s.setup.frameHint}
        value={draft.frameNumber}
        onChangeText={set('frameNumber')}
        autoCapitalize="characters"
      />

      <View style={styles.section}>
        <AppText upper size={13} color={colors.muted}>
          {s.setup.photos}
        </AppText>
        <View style={styles.thumbs}>
          {draft.photos.map((uri) => (
            <Thumb
              key={uri}
              uri={uri}
              removeLabel={s.setup.remove}
              onRemove={() => setDraft((d) => ({ ...d, photos: d.photos.filter((p) => p !== uri) }))}
            />
          ))}
        </View>
        {draft.photos.length < MAX_PHOTOS ? (
          <PickButtons s={s.setup} onPick={addPhoto} />
        ) : null}
      </View>

      <View style={styles.section}>
        <AppText upper size={13} color={colors.muted}>
          {s.setup.receipt}
        </AppText>
        {draft.receiptUri ? (
          <Thumb
            uri={draft.receiptUri}
            removeLabel={s.setup.remove}
            onRemove={() => setDraft((d) => ({ ...d, receiptUri: null }))}
          />
        ) : (
          <PickButtons s={s.setup} onPick={setReceipt} />
        )}
      </View>

      <View style={styles.section}>
        <AppText bold upper size={16}>
          {s.setup.insuranceTitle}
        </AppText>
        <Field
          label={s.setup.insurer}
          hint={s.setup.insurerHint}
          value={draft.insurer}
          onChangeText={set('insurer')}
        />
        <Field
          label={s.setup.policyNumber}
          value={draft.policyNumber}
          onChangeText={set('policyNumber')}
          autoCapitalize="characters"
        />
      </View>

      {cameraDenied ? <AppText color={colors.warning}>{s.setup.cameraDenied}</AppText> : null}

      <BigButton title={s.setup.save} onPress={save} />
      {setupDone ? null : <BigButton title={s.setup.skip} variant="secondary" onPress={skip} />}
    </ScrollView>
  );
}

function Field({
  label,
  hint,
  value,
  onChangeText,
  autoCapitalize = 'words',
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (value: string) => void;
  autoCapitalize?: 'words' | 'characters';
}) {
  return (
    <View style={styles.field}>
      <AppText upper size={13} color={colors.muted}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={styles.input}
      />
      {hint ? (
        <AppText size={12} color={colors.muted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

function PickButtons({
  s,
  onPick,
}: {
  s: { addPhoto: string; takePhoto: string };
  onPick: (fromCamera: boolean) => void;
}) {
  return (
    <View style={styles.pickRow}>
      <BigButton title={s.takePhoto} variant="secondary" onPress={() => onPick(true)} style={styles.flex} />
      <BigButton title={s.addPhoto} variant="secondary" onPress={() => onPick(false)} style={styles.flex} />
    </View>
  );
}

function Thumb({ uri, removeLabel, onRemove }: { uri: string; removeLabel: string; onRemove: () => void }) {
  return (
    <View style={styles.thumb}>
      <Image source={{ uri }} style={styles.thumbImage} />
      <Pressable onPress={onRemove} accessibilityRole="button" style={styles.thumbRemove}>
        <AppText size={12} upper>
          {removeLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  body: { lineHeight: 21 },
  field: { gap: spacing.xs },
  input: {
    borderWidth: 2,
    borderColor: colors.divider,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    padding: spacing.sm,
  },
  section: { gap: spacing.sm },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumb: { width: 96, gap: spacing.xs },
  thumbImage: { width: 96, height: 96, backgroundColor: colors.surface },
  thumbRemove: { borderWidth: 1, borderColor: colors.divider, paddingVertical: 4, alignItems: 'center' },
  pickRow: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
