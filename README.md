# Bikeritas

Mobiilisovellus GPS-tägillä varustetun pyörän seurantaan. Kun pyörä liikkuu ilman lupaa, sovellus
hälyttää ja antaa yksinkertaiset vaihtoehdot: *Ei huolta* tai *Epäilen varkautta*, jolloin
asiakaspalvelu ilmoittaa poliisille ja hoitaa rikos- ja vakuutusilmoitukset.

Tehty: Expo (SDK 58), React Native, TypeScript ja Expo Router.

---

## Pikaopas: sovellus käyntiin

### 1. Asenna kerran

- **Node.js** (LTS): https://nodejs.org
- **Git**: https://git-scm.com
- Puhelimeen **Expo Go** (App Store / Google Play)
- Ilmainen **Expo-tili**: https://expo.dev/signup

### 2. Lataa projekti

```bash
git clone https://github.com/ggittonen/bikeritas.git
cd bikeritas
npm install
```

### 3. Käynnistä tietokoneella

```bash
npx expo login           # vain ensimmäisellä kerralla
npx expo start --tunnel
```

Jätä tämä ikkuna auki niin kauan kuin käytät sovellusta. Pysäytys: **Ctrl+C**.

### 4. Avaa puhelimella

1. Avaa **Expo Go** ja kirjaudu **samalla Expo-tilillä**.
2. Napauta etusivulla kohdassa **Development servers** → **Bikeritas**.
3. Salli ilmoitukset.

> QR-koodinkin voi skannata: iPhonella tavallisella kameralla, Androidilla Expo Go -sovelluksen
> sisältä. Jos koodi ei skannaudu, käytä yllä olevaa kirjautumistapaa.

### Tai selaimessa

```bash
npm run web
```

Avautuu osoitteeseen http://localhost:8081. Ilmoitukset eivät toimi selaimessa.

---

## Kokeile varkaustilannetta

1. **PYÖRÄT** → *Aktivoi valvonta*. Nykyinen sijainti tallentuu pysäköintipaikaksi.
2. **Testaustila** → *Simuloi varkaus*. Noin 10 sekunnissa pyörä on yli 30 m päässä ja
   **HUOMIO!**-näkymä aukeaa.
3. Valitse *Ei huolta*, *Epäilen varkautta* tai *Avaa kartta*.
4. *Epäilen varkautta* vaatii **Bikeritas Turva** -tilauksen. Kytke se päälle **MUUT**-välilehdeltä
   (simuloitu, ei maksua).
5. Seurantanäkymässä näkyvät reitti ja tapahtumat. Lopuksi *Pyörä saatu takaisin*.

### Oikealla puhelimen sijainnilla

**MUUT** → **Sijainnin lähde** → **Puhelimen GPS**, ja salli sijainti. Puhelin toimii nyt tägin
tilalla. Aktivoi valvonta ja kävele ulkona yli 30 m. Sijainti päivittyy vain, kun sovellus on auki.

---

## Ongelmatilanteita

| Ongelma | Ratkaisu |
| --- | --- |
| Puhelin ei saa yhteyttä | Käynnistä `npx expo start --tunnel` (koulun verkot estävät suoran yhteyden) |
| "Incompatible with this version of Expo Go" | Päivitä Expo Go sovelluskaupasta |
| Vanha tai rikkinäinen näkymä | `npx expo start --clear` |
| Sijaintia ei näy | Salli sijainti Expo Golle puhelimen asetuksista ja mene ulos |
| `npx expo login` kaatuu ("exited with non-zero code") | Käytä `npx expo login --no-browser` tai access tokenia (alla) |
| Expo-tili on tehty Googlella, eikä salasanaa ole | Käytä access tokenia (alla) |
| Bikeritas ei näy Expo Gossa | Tietokone ja puhelin pitää olla kirjautuneena **samalle** tilille. Älä käytä robot-tokenia |

### Kirjautuminen access tokenilla

1. Avaa https://expo.dev/settings/access-tokens → **Personal access tokens** → **Create token** ja kopioi token.
2. Aja terminaalissa (lainausmerkit mukaan):
   ```powershell
   $env:EXPO_TOKEN="token-tähän"
   npx expo start --tunnel
   ```
   Asetus on voimassa vain avoimessa terminaali-ikkunassa.
3. Puhelimessa: Expo Go → **Log in** → **Continue with Google** samalla tilillä.

Älä laita tokenia koodiin, GitHubiin tai chattiin.

---

## Kehittäjille

```bash
npm run typecheck   # TypeScript-tarkistus
npm run lint        # ESLint
```

### Rakenne

```
src/
  app/                    Näkymät (Expo Router: jokainen tiedosto = näkymä)
    (tabs)/index.tsx      SIJAINTI: koko näytön kartta
    (tabs)/bikes.tsx      PYÖRÄT: valvonta päälle/pois, tägin tila, testaustila
    (tabs)/more.tsx       MUUT: tilaus ja sijainnin lähde
    alert.tsx             HUOMIO!-hälytys ja toimintavaihtoehdot
    incident.tsx          Varkaustapauksen seuranta ja aikajana
  domain/                 Puhdas logiikka ilman UI:ta (tyypit, etäisyydet, liiketunnistus)
  services/
    tag/                  TagService-rajapinta: simulaattori ja puhelimen GPS
    support/              SupportService-rajapinta + mock (asiakaspalvelu / poliisi / vakuutus)
    notifications.ts      Paikalliset ilmoitukset
    index.ts              Tässä vaihdetaan mockit oikeisiin toteutuksiin
  state/                  Sovelluksen tila (reducer + BikeContext)
  components/             UI-palat (kartta, napit, kortit, ikonit)
  theme.ts                Värit ja fontit
```

Näkymät käyttävät vain rajapintoja `TagService` ja `SupportService`. Oikean tägin
(BLE / LTE-M / pilvi-API) ja asiakaspalvelun backendin voi siis kytkeä tiedostossa
`src/services/index.ts` muuttamatta näkymiä.

### Jatkokehitys

- Oikea tägi ja sen parittaminen sovellukseen
- Backend, jotta tägi ja omistajan puhelin voivat olla eri laitteita
- Etä-push-ilmoitukset (vaatii development buildin: `npx expo run:android` tai EAS)
- Hälytysääni / kaiutin tägissä (huomioi akunkulutus)
- Valvonnan automaattinen ohitus, kun omistajan puhelin on lähellä
- Oikea tilaus- ja maksujärjestelmä
- Karttojen API-avaimet ennen sovelluskauppajulkaisua
