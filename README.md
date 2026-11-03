# Bikeritas

Mobiilisovellus GPS-tägillä varustetun pyörän seurantaan ja varkaustilanteiden hoitamiseen.
Expo (SDK 58) + React Native + TypeScript + Expo Router.

## Käynnistys

```bash
npm install
npm start          # skannaa QR-koodi Expo Go -sovelluksella (Android/iOS)
npm run web        # selainversio (ei karttaa, näyttää koordinaatit)
npm run typecheck
npm run lint
```

## Demo-polku

1. **Pyörä**-välilehti → *Aktivoi valvonta* (pysäköintipaikka tallentuu).
2. *Testaustila* → *Simuloi varkaus*. Kun pyörä on yli 30 m päässä, tulee ilmoitus ja hälytysnäkymä.
3. Hälytysnäkymässä valitaan: *Ilmoita poliisille*, *Seuraa pyörää* tai *Se olin minä*.
4. Poliisi-ilmoitus vaatii **Bikeritas Turva** -tilauksen (Asetukset-välilehden kytkin, simuloitu).
5. Seurantanäkymässä näkyy reitti, tapahtumat (poliisi-, rikos- ja vakuutusilmoitus) ja *Pyörä saatu takaisin*.

## Rakenne

```
src/
  app/                    Näkymät (Expo Router: jokainen tiedosto = näkymä)
    (tabs)/index.tsx      Etusivu: kartta, valvonta päälle/pois, tägin tila
    (tabs)/settings.tsx   Tilaus ja tägin tiedot
    alert.tsx             Hälytys luvattomasta liikkeestä + toimintavaihtoehdot
    incident.tsx          Varkaustapauksen seuranta ja aikajana
  domain/                 Puhdas logiikka ilman UI:ta (tyypit, etäisyydet, liiketunnistus)
  services/
    tag/                  TagService-rajapinta + MockTagService (simuloitu GPS-tägi)
    support/              SupportService-rajapinta + mock (asiakaspalvelu / poliisi / vakuutus)
    notifications.ts      Paikalliset ilmoitukset
    index.ts              Tässä vaihdetaan mockit oikeisiin toteutuksiin
  state/                  Sovelluksen tila (reducer + BikeContext)
  components/             Uudelleenkäytettävät UI-palat (kartta, napit, kortit)
```

UI riippuu vain rajapinnoista `TagService` ja `SupportService`, joten oikean tägin
(BLE / LTE-M / pilvi-API) ja asiakaspalvelun backendin voi kytkeä tiedostossa
`src/services/index.ts` koskematta näkymiin.

## Jatkokehitys

- Oikea tägi-integraatio ja tägin parittaminen sovellukseen
- Etä-push-ilmoitukset (vaatii development buildin: `npx expo run:android` tai EAS)
- Hälytysääni / kaiutin tägissä (huomioi akunkulutus)
- Valvonnan automaattinen ohitus, kun omistajan puhelin on lähellä
- Oikea tilaus- ja maksujärjestelmä
- Karttojen API-avaimet ennen kauppajulkaisua (`react-native-maps` config plugin)
