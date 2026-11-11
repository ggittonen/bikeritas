import type { IncidentEvent, IncidentStatus, TagProblem } from '@/domain/types';
import type { TagSourceId } from '@/services';

export type Language = 'fi' | 'en';

export const fi = {
  locale: 'fi-FI',
  languageName: 'Suomi',

  tabs: { location: 'SIJAINTI', bikes: 'PYÖRÄT', more: 'MUUT' },

  common: {
    back: 'Takaisin',
    home: 'Etusivulle',
    waitingForLocation: 'Odotetaan sijaintia…',
    bikeLocation: 'Pyörän sijainti',
    parked: 'Pysäköity',
    bike: 'Pyörä',
    myBike: 'Oma pyörä',
  },

  monitoring: {
    on: 'Valvonta päällä',
    off: 'Valvonta pois',
    turnOn: 'Aktivoi valvonta',
    turnOff: 'Poista valvonta',
    hint: (meters: number) => `Saat hälytyksen, jos pyörä liikkuu yli ${meters} m pysäköintipaikasta.`,
  },

  location: {
    alertTitle: 'Huomio!',
    alertBody: 'Pyöräsi liikkuu ilman sinua',
  },

  bikes: {
    tag: 'Tägi',
    connection: 'Yhteys',
    connected: 'Yhdistetty',
    disconnected: 'Ei yhteyttä',
    battery: 'Akku',
    updated: 'Päivitetty',
    distance: 'Etäisyys pysäköinnistä',
    lowBattery: 'Akku vähissä – lataa tägi johdolla.',
    testMode: 'Testaustila',
    simulateTheft: 'Simuloi varkaus',
    stopBike: 'Pysäytä pyörä',
    moving: 'Pyörä liikkuu…',
    willAlert: 'Hälytys tulee, kun pyörä on yli rajan päässä (noin 10 s).',
    armFirst: 'Aktivoi valvonta ensin, muuten varkaus ei hälytä.',
  },

  more: {
    subscriptionTitle: 'Bikeritas Turva',
    subscriptionBody:
      'Kuukausitilaus aktivoi asiakaspalvelun: varkaustilanteessa se ilmoittaa poliisille, tekee rikos- ja vakuutusilmoituksen puolestasi ja välittää pyörän reaaliaikaisen sijainnin viranomaisille.',
    subscriptionActive: 'Tilaus aktiivinen',
    noSubscription: 'Ei tilausta',
    subscriptionNote: 'Prototyyppi: maksua ei veloiteta, kytkin vain simuloi tilausta.',
    sourceTitle: 'Sijainnin lähde',
    sources: {
      simulator: 'Simulaatio',
      phone: 'Tämän puhelimen GPS',
      remote: 'Pyörän tägi (toinen puhelin)',
    } satisfies Record<TagSourceId, string>,
    code: (code: string) => `Koodi ${code}`,
    sourceChangeNote: 'Lähteen vaihto poistaa valvonnan.',
    tagModeTitle: 'Käytä tätä puhelinta tägina',
    tagModeBody:
      'Laita tämä puhelin pyörän laukkuun. Se lähettää sijaintinsa, ja omistajan puhelin saa hälytyksen, jos pyörä liikkuu.',
    startTagMode: 'Käynnistä tägitila',
    pairHint: 'Syötä koodi, joka näkyy tägipuhelimen näytöllä.',
    pairInvalid: 'Koodissa on 8 merkkiä, esim. AB3K-9XQ2.',
    connect: 'Yhdistä',
    backendMissing: 'Backend puuttuu. Lisää Firebase-asetukset tiedostoon .env.local (ohje README:ssä).',
    languageTitle: 'Kieli / Language',
  },

  alert: {
    none: 'Ei aktiivisia hälytyksiä.',
    title: 'Huomio!',
    body: 'Pyöräsi liikkuu\nilman sinua.',
    openMap: 'Avaa kartta',
    noWorries: 'Ei huolta',
    suspectTheft: 'Epäilen varkautta',
    reported: 'Ilmoitettu',
    needSubscription:
      'Poliisi-ilmoitus asiakaspalvelun kautta vaatii Bikeritas Turva -tilauksen (Muut-välilehti).',
    failed: 'Ilmoitus epäonnistui. Tarkista verkkoyhteys ja yritä uudelleen.',
  },

  incident: {
    none: 'Ei aktiivista tapausta.',
    situation: 'Tilanne',
    state: 'Tila',
    statuses: {
      detected: 'Ei vielä ilmoitettu',
      reporting: 'Ilmoitetaan…',
      police_notified: 'Poliisi tietää',
    } satisfies Record<IncidentStatus, string>,
    speed: 'Nopeus',
    lastLocation: 'Viimeisin sijainti',
    caseNumber: 'Tapausnumero',
    events: 'Tapahtumat',
    recovered: 'Pyörä saatu takaisin',
    event: (e: IncidentEvent): string => {
      switch (e.kind) {
        case 'detected':
          return 'Luvaton liike havaittu';
        case 'sent_to_support':
          return 'Ilmoitus lähetetty asiakaspalveluun';
        case 'police_notified':
          return `Poliisille ilmoitettu (tapaus ${e.caseId ?? '–'})`;
        case 'crime_report':
          return 'Rikosilmoitus tehty puolestasi';
        case 'insurance_claim':
          return 'Vakuutusilmoitus tehty puolestasi';
        case 'sharing_location':
          return 'Reaaliaikainen sijainti jaetaan viranomaisille';
        case 'report_failed':
          return 'Ilmoitus epäonnistui – yritä uudelleen';
      }
    },
  },

  tagMode: {
    backendMissingTitle: 'Backend puuttuu',
    backendMissingBody:
      'Tägitila tarvitsee Firebasen. Lisää asetukset tiedostoon .env.local (ohje README:ssä) ja käynnistä palvelin uudelleen.',
    thisPhoneIsTag: 'Tämä puhelin on pyörän tägi',
    enterCode: 'Syötä koodi omistajan puhelimeen',
    status: 'Tila',
    gps: 'GPS',
    waiting: 'Odotetaan…',
    sent: 'Lähetetty',
    sendFailed: 'Lähetys epäonnistui – tarkista verkkoyhteys.',
    keepOpen: 'Pidä sovellus auki tässä näkymässä. Näyttö pysyy päällä automaattisesti. Laita puhelin pyörän laukkuun.',
    stop: 'Lopeta tägitila',
  },

  tagProblem: (p: TagProblem): string => {
    switch (p.code) {
      case 'permission':
        return 'Sijaintilupa puuttuu – salli sijainti asetuksista.';
      case 'no_location':
        return 'Sijaintia ei saatu.';
      case 'inaccurate':
        return `Odotetaan tarkkaa sijaintia (nyt ±${p.accuracyM ?? '?'} m).`;
      case 'backend_missing':
        return 'Backend puuttuu – katso README (Firebase).';
      case 'no_code':
        return 'Syötä tägin koodi MUUT-välilehdellä.';
      case 'not_found':
        return 'Tägiä ei löydy tällä koodilla. Onko tägitila päällä?';
      case 'backend_lost':
        return 'Yhteys backendiin katkesi.';
      case 'stale':
        return 'Tägi ei ole lähettänyt sijaintia hetkeen.';
    }
  },

  notification: {
    title: 'Pyöräsi liikkuu!',
    body: 'Havaitsimme luvattoman liikkeen. Avaa sovellus ja valitse mitä tehdään.',
  },
};

export type Strings = typeof fi;

export const en: Strings = {
  locale: 'en-GB',
  languageName: 'English',

  tabs: { location: 'LOCATION', bikes: 'BIKES', more: 'MORE' },

  common: {
    back: 'Back',
    home: 'Home',
    waitingForLocation: 'Waiting for location…',
    bikeLocation: 'Bike location',
    parked: 'Parked',
    bike: 'Bike',
    myBike: 'My bike',
  },

  monitoring: {
    on: 'Monitoring on',
    off: 'Monitoring off',
    turnOn: 'Turn on monitoring',
    turnOff: 'Turn off monitoring',
    hint: (meters: number) => `You get an alert if the bike moves more than ${meters} m from where it was parked.`,
  },

  location: {
    alertTitle: 'Alert!',
    alertBody: 'Your bike is moving without you',
  },

  bikes: {
    tag: 'Tag',
    connection: 'Connection',
    connected: 'Connected',
    disconnected: 'No connection',
    battery: 'Battery',
    updated: 'Updated',
    distance: 'Distance from parking',
    lowBattery: 'Battery low – charge the tag with the cable.',
    testMode: 'Test mode',
    simulateTheft: 'Simulate theft',
    stopBike: 'Stop the bike',
    moving: 'Bike is moving…',
    willAlert: 'The alert comes when the bike is past the limit (about 10 s).',
    armFirst: 'Turn on monitoring first, otherwise the theft won’t trigger an alert.',
  },

  more: {
    subscriptionTitle: 'Bikeritas Turva',
    subscriptionBody:
      'The monthly subscription activates customer service: in a theft it notifies the police, files the crime report and insurance claim for you, and shares the bike’s live location with the authorities.',
    subscriptionActive: 'Subscription active',
    noSubscription: 'No subscription',
    subscriptionNote: 'Prototype: nothing is charged, the switch only simulates the subscription.',
    sourceTitle: 'Location source',
    sources: {
      simulator: 'Simulation',
      phone: 'This phone’s GPS',
      remote: 'Bike’s tag (other phone)',
    },
    code: (code: string) => `Code ${code}`,
    sourceChangeNote: 'Changing the source turns monitoring off.',
    tagModeTitle: 'Use this phone as the tag',
    tagModeBody:
      'Put this phone in the bike bag. It sends its location, and the owner’s phone gets an alert if the bike moves.',
    startTagMode: 'Start tag mode',
    pairHint: 'Enter the code shown on the tag phone’s screen.',
    pairInvalid: 'The code has 8 characters, e.g. AB3K-9XQ2.',
    connect: 'Connect',
    backendMissing: 'Backend missing. Add the Firebase settings to .env.local (see README).',
    languageTitle: 'Kieli / Language',
  },

  alert: {
    none: 'No active alerts.',
    title: 'Alert!',
    body: 'Your bike is moving\nwithout you.',
    openMap: 'Open map',
    noWorries: 'No worries',
    suspectTheft: 'I suspect theft',
    reported: 'Reported',
    needSubscription:
      'Reporting to the police through customer service requires the Bikeritas Turva subscription (More tab).',
    failed: 'Reporting failed. Check your connection and try again.',
  },

  incident: {
    none: 'No active incident.',
    situation: 'Situation',
    state: 'Status',
    statuses: {
      detected: 'Not reported yet',
      reporting: 'Reporting…',
      police_notified: 'Police informed',
    },
    speed: 'Speed',
    lastLocation: 'Last location',
    caseNumber: 'Case number',
    events: 'Events',
    recovered: 'Bike recovered',
    event: (e: IncidentEvent): string => {
      switch (e.kind) {
        case 'detected':
          return 'Unauthorized movement detected';
        case 'sent_to_support':
          return 'Report sent to customer service';
        case 'police_notified':
          return `Police notified (case ${e.caseId ?? '–'})`;
        case 'crime_report':
          return 'Crime report filed for you';
        case 'insurance_claim':
          return 'Insurance claim filed for you';
        case 'sharing_location':
          return 'Live location shared with the authorities';
        case 'report_failed':
          return 'Reporting failed – try again';
      }
    },
  },

  tagMode: {
    backendMissingTitle: 'Backend missing',
    backendMissingBody:
      'Tag mode needs Firebase. Add the settings to .env.local (see README) and restart the server.',
    thisPhoneIsTag: 'This phone is the bike’s tag',
    enterCode: 'Enter the code on the owner’s phone',
    status: 'Status',
    gps: 'GPS',
    waiting: 'Waiting…',
    sent: 'Sent',
    sendFailed: 'Sending failed – check your connection.',
    keepOpen: 'Keep the app open on this screen. The screen stays on automatically. Put the phone in the bike bag.',
    stop: 'Stop tag mode',
  },

  tagProblem: (p: TagProblem): string => {
    switch (p.code) {
      case 'permission':
        return 'Location permission missing – allow location in settings.';
      case 'no_location':
        return 'Could not get location.';
      case 'inaccurate':
        return `Waiting for an accurate location (now ±${p.accuracyM ?? '?'} m).`;
      case 'backend_missing':
        return 'Backend missing – see README (Firebase).';
      case 'no_code':
        return 'Enter the tag’s code in the More tab.';
      case 'not_found':
        return 'No tag found with this code. Is tag mode on?';
      case 'backend_lost':
        return 'Lost connection to the backend.';
      case 'stale':
        return 'The tag hasn’t sent its location for a while.';
    }
  },

  notification: {
    title: 'Your bike is moving!',
    body: 'We detected unauthorized movement. Open the app and choose what to do.',
  },
};

export const strings: Record<Language, Strings> = { fi, en };
