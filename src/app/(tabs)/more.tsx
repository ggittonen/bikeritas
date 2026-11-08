import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { Card } from '@/components/Card';
import { tagSourceLabels, type TagSourceId } from '@/services';
import { formatBikeId, normalizeBikeId } from '@/services/backend/bikeChannel';
import { backendConfigured } from '@/services/backend/firebase';
import { useBike } from '@/state/BikeContext';
import { colors, fonts, spacing } from '@/theme';

const sourceIds = Object.keys(tagSourceLabels) as TagSourceId[];

/** "Muut" tab: subscription, where the location comes from, and tag mode. */
export default function MoreScreen() {
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
      <Card title="Bikeritas Turva">
        <AppText size={14} style={styles.body}>
          Kuukausitilaus aktivoi asiakaspalvelun: varkaustilanteessa se ilmoittaa poliisille, tekee
          rikos- ja vakuutusilmoituksen puolestasi ja välittää pyörän reaaliaikaisen sijainnin
          viranomaisille.
        </AppText>
        <View style={styles.switchRow}>
          <AppText upper bold color={subscriptionActive ? colors.success : colors.muted}>
            {subscriptionActive ? 'Tilaus aktiivinen' : 'Ei tilausta'}
          </AppText>
          <Switch
            value={subscriptionActive}
            onValueChange={setSubscription}
            trackColor={{ true: colors.success, false: colors.divider }}
          />
        </View>
        <AppText size={12} color={colors.muted}>
          Prototyyppi: maksua ei veloiteta, kytkin vain simuloi tilausta.
        </AppText>
      </Card>

      <Card title="Sijainnin lähde">
        {sourceIds.map((id) => {
          const selected = id === tagSource;
          return (
            <Pressable
              key={id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onSelectSource(id)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <AppText upper color={selected ? colors.text : colors.muted}>
                {selected ? '● ' : '○ '}
                {tagSourceLabels[id]}
              </AppText>
              {id === 'remote' && selected && remoteBikeId ? (
                <AppText size={13} color={colors.muted}>
                  Koodi {formatBikeId(remoteBikeId)}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
        {showCodeInput || (tagSource === 'remote' && !remoteBikeId) ? (
          <PairWithTag
            onPair={(id) => {
              setTagSource('remote', id);
              setShowCodeInput(false);
            }}
          />
        ) : null}
        <AppText size={12} color={colors.muted}>
          Lähteen vaihto poistaa valvonnan.
        </AppText>
      </Card>

      <Card title="Käytä tätä puhelinta tägina">
        <AppText size={14} style={styles.body}>
          Laita tämä puhelin pyörän laukkuun. Se lähettää sijaintinsa, ja omistajan puhelin saa
          hälytyksen, jos pyörä liikkuu.
        </AppText>
        <BigButton title="Käynnistä tägitila" onPress={() => router.push('/tag-mode')} />
      </Card>
    </ScrollView>
  );
}

function PairWithTag({ onPair }: { onPair: (bikeId: string) => void }) {
  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState(false);

  if (!backendConfigured) {
    return (
      <AppText size={13} color={colors.warning}>
        Backend puuttuu. Lisää Firebase-asetukset tiedostoon .env.local (ohje README:ssä).
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
        Syötä koodi, joka näkyy tägipuhelimen näytöllä.
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
          Koodissa on 8 merkkiä, esim. AB3K-9XQ2.
        </AppText>
      ) : null}
      <BigButton title="Yhdistä" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  body: { lineHeight: 21 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  option: { padding: spacing.md, borderWidth: 2, borderColor: colors.divider, gap: spacing.xs },
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
