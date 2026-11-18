import type { IncidentEvent, IncidentStatus, ReportStage, TagProblem } from '@/domain/types';
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
    lastKnown: (time: string) => `Viimeisin tunnettu sijainti ${time}`,
    yes: 'Kyllä',
    no: 'Ei',
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
    recoveredTitle: 'Pyörä löytyi',
    recoveredBody: 'Poliisi löysi pyöräsi – avaa tapaus',
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
    willAlert: 'Hälytys tulee, kun pyörä on yli rajan päässä (noin 15 s).',
    armFirst: 'Aktivoi valvonta ensin, muuten varkaus ei hälytä.',
    ownerDistance: (meters: number) => `Olet ${meters} m päässä pyörästä`,
  },

  setup: {
    title: 'Pyörän tiedot',
    intro:
      'Tallenna pyörän tiedot nyt. Varkauden sattuessa ne liitetään ilmoitukseen automaattisesti, eikä niitä tarvitse muistaa stressaavassa tilanteessa.',
    make: 'Merkki',
    model: 'Malli',
    color: 'Väri',
    frameNumber: 'Runkonumero',
    frameHint: 'Löytyy yleensä polkimien välistä rungon alta.',
    photos: 'Kuvat pyörästä',
    receipt: 'Ostokuitti',
    insuranceTitle: 'Vakuutus',
    insurer: 'Vakuutusyhtiö',
    insurerHint: 'Esim. If, LähiTapiola, OP, Fennia, Pohjantähti. Jätä tyhjäksi, jos pyörää ei ole vakuutettu.',
    policyNumber: 'Vakuutusnumero',
    addPhoto: 'Valitse kuva',
    takePhoto: 'Ota kuva',
    remove: 'Poista',
    save: 'Tallenna',
    skip: 'Ohita nyt',
    cameraDenied: 'Kameralupa puuttuu. Salli kamera puhelimen asetuksista.',
  },

  confirm: {
    title: 'Vahvista varkaus',
    intro: 'Kun vahvistat, seuraavat tiedot luovutetaan eteenpäin. Mitään ei lähetetä ennen vahvistusta.',
    sharedTitle: 'Luovutettavat tiedot',
    location: 'Pyörän sijainti ja reitti, reaaliajassa kunnes pyörä löytyy',
    bikeDetails: 'Pyörän tiedot',
    photos: (n: number) => `Kuvat pyörästä: ${n} kpl`,
    receipt: 'Ostokuitti',
    recipientsTitle: 'Vastaanottajat',
    recipientSupport: 'Bikeritas-asiakaspalvelu',
    recipientPolice: 'Poliisi (rikosilmoitus)',
    recipientInsurer: (insurer: string, policy: string) =>
      `${insurer} (vakuutusilmoitus${policy ? `, vakuutus ${policy}` : ''})`,
    noInsurer: 'Vakuutusyhtiötä ei ole tallennettu, joten vakuutusilmoitusta ei tehdä.',
    insurer: 'Vakuutusyhtiö',
    policyNumber: 'Vakuutusnumero',
    missingDetails: 'Pyörän tietoja ei ole tallennettu. Ilmoitus onnistuu, mutta tiedot nopeuttavat käsittelyä.',
    addDetails: 'Lisää tiedot',
    confirm: 'Vahvista ja ilmoita',
    cancel: 'Peruuta',
    selfTitle: 'Tee rikosilmoitus itse',
    selfBody:
      'Ilman Bikeritas Turvaa voit seurata pyörää, mutta rikosilmoitus tehdään itse. Avaa poliisin sähköinen asiointi ja käytä alla olevia tietoja.',
    openPoliceForm: 'Avaa poliisin rikosilmoitus',
    policeUrl: 'https://poliisi.fi/tee-rikosilmoitus',
    upsell: 'Bikeritas Turva -tilauksella asiakaspalvelu hoitaa ilmoitukset puolestasi.',
    getSubscription: 'Katso Bikeritas Turva',
  },

  more: {
    subscriptionTitle: 'Bikeritas Turva',
    subscriptionBody:
      'Kuukausitilaus aktivoi asiakaspalvelun: varkaustilanteessa se ilmoittaa poliisille, tekee rikos- ja vakuutusilmoituksen puolestasi ja välittää pyörän reaaliaikaisen sijainnin viranomaisille.',
    tierFree: 'Tägi + sovellus (kertamaksu): seuranta ja hälytykset. Rikosilmoitus tehdään itse.',
    tierPaid: 'Bikeritas Turva (kuukausimaksu): asiakaspalvelu hoitaa ilmoitukset ja auttaa pyörän takaisinsaannissa.',
    bikeDetailsTitle: 'Pyörän tiedot',
    bikeDetailsEmpty: 'Ei tallennettu',
    editDetails: 'Muokkaa tietoja',
    autoArmTitle: 'Automaattinen valvonta',
    autoArmBody: (meters: number) => `Valvonta menee päälle, kun olet yli ${meters} m päässä pyörästä.`,
    autoArmUnavailable: 'Toimii, kun tägi on toisessa laitteessa (Pyörän tägi -lähde).',
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
      recovered_by_police: 'Poliisi löysi pyörän',
    } satisfies Record<IncidentStatus, string>,
    speed: 'Nopeus',
    lastLocation: 'Viimeisin sijainti',
    caseNumber: 'Tapausnumero',
    events: 'Tapahtumat',
    recovered: 'Pyörä saatu takaisin',
    recoveredTitle: 'Pyörä löytyi!',
    recoveredBody: 'Poliisi on löytänyt pyöräsi. Asiakaspalvelu ottaa sinuun yhteyttä ja sopii pyörän palautuksesta.',
    closeCase: 'Kuittaa ja päätä tapaus',
    progressTitle: 'Ilmoitusten käsittely',
    crimeReport: 'Rikosilmoitus',
    insuranceClaim: 'Vakuutusilmoitus',
    stages: {
      sent: 'Lähetetty',
      received: 'Vastaanotettu',
      processing: 'Käsittelyssä',
      done: 'Käsitelty',
    } satisfies Record<ReportStage, string>,
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
        case 'self_report_opened':
          return 'Poliisin rikosilmoitussivu avattu';
        case 'police_recovered':
          return 'Poliisi löysi pyörän – tapaus päättyy';
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

  lowBatteryNotification: {
    title: 'Tägin akku vähissä',
    body: (percent: number) => `Akkua jäljellä ${percent} %. Lataa tägi, jotta pyörä pysyy valvottuna.`,
  },

  policeRecoveredNotification: {
    title: 'Pyöräsi löytyi!',
    body: 'Poliisi on löytänyt pyöräsi. Avaa sovellus nähdäksesi lisätiedot.',
  },

  support: {
    call: 'Soita asiakaspalveluun',
    caseRef: (caseId: string) => `tapausnumero ${caseId}`,
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
    lastKnown: (time: string) => `Last known location ${time}`,
    yes: 'Yes',
    no: 'No',
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
    recoveredTitle: 'Bike found',
    recoveredBody: 'The police found your bike – open the case',
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
    willAlert: 'The alert comes when the bike is past the limit (about 15 s).',
    armFirst: 'Turn on monitoring first, otherwise the theft won’t trigger an alert.',
    ownerDistance: (meters: number) => `You are ${meters} m from the bike`,
  },

  setup: {
    title: 'Bike details',
    intro:
      'Save your bike’s details now. If it’s stolen, they’re attached to the report automatically, so you don’t have to remember them in a stressful moment.',
    make: 'Make',
    model: 'Model',
    color: 'Colour',
    frameNumber: 'Frame number',
    frameHint: 'Usually under the frame between the pedals.',
    photos: 'Photos of the bike',
    receipt: 'Purchase receipt',
    insuranceTitle: 'Insurance',
    insurer: 'Insurer',
    insurerHint: 'E.g. If, LähiTapiola, OP, Fennia, Pohjantähti. Leave empty if the bike isn’t insured.',
    policyNumber: 'Policy number',
    addPhoto: 'Choose photo',
    takePhoto: 'Take photo',
    remove: 'Remove',
    save: 'Save',
    skip: 'Skip for now',
    cameraDenied: 'Camera permission missing. Allow the camera in your phone’s settings.',
  },

  confirm: {
    title: 'Confirm theft',
    intro: 'When you confirm, the following information is passed on. Nothing is sent before you confirm.',
    sharedTitle: 'Information shared',
    location: 'The bike’s location and route, live until the bike is found',
    bikeDetails: 'Bike details',
    photos: (n: number) => `Photos of the bike: ${n}`,
    receipt: 'Purchase receipt',
    recipientsTitle: 'Recipients',
    recipientSupport: 'Bikeritas customer service',
    recipientPolice: 'Police (crime report)',
    recipientInsurer: (insurer: string, policy: string) =>
      `${insurer} (insurance claim${policy ? `, policy ${policy}` : ''})`,
    noInsurer: 'No insurer saved, so no insurance claim will be filed.',
    insurer: 'Insurer',
    policyNumber: 'Policy number',
    missingDetails: 'No bike details saved. Reporting still works, but details speed up the process.',
    addDetails: 'Add details',
    confirm: 'Confirm and report',
    cancel: 'Cancel',
    selfTitle: 'File a police report yourself',
    selfBody:
      'Without Bikeritas Turva you can track the bike, but you file the crime report yourself. Open the police online service and use the details below.',
    openPoliceForm: 'Open police report form',
    policeUrl: 'https://poliisi.fi/en/report-a-crime',
    upsell: 'With the Bikeritas Turva subscription, customer service files the reports for you.',
    getSubscription: 'See Bikeritas Turva',
  },

  more: {
    subscriptionTitle: 'Bikeritas Turva',
    subscriptionBody:
      'The monthly subscription activates customer service: in a theft it notifies the police, files the crime report and insurance claim for you, and shares the bike’s live location with the authorities.',
    tierFree: 'Tag + app (one-time payment): tracking and alerts. You file the crime report yourself.',
    tierPaid: 'Bikeritas Turva (monthly): customer service files the reports and helps get the bike back.',
    bikeDetailsTitle: 'Bike details',
    bikeDetailsEmpty: 'Not saved',
    editDetails: 'Edit details',
    autoArmTitle: 'Automatic monitoring',
    autoArmBody: (meters: number) => `Monitoring turns on when you are more than ${meters} m from the bike.`,
    autoArmUnavailable: 'Works when the tag is another device (Bike’s tag source).',
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
      recovered_by_police: 'Police found the bike',
    },
    speed: 'Speed',
    lastLocation: 'Last location',
    caseNumber: 'Case number',
    events: 'Events',
    recovered: 'Bike recovered',
    recoveredTitle: 'Bike found!',
    recoveredBody: 'The police have found your bike. Customer service will contact you to arrange its return.',
    closeCase: 'Acknowledge and close case',
    progressTitle: 'Report progress',
    crimeReport: 'Crime report',
    insuranceClaim: 'Insurance claim',
    stages: {
      sent: 'Sent',
      received: 'Received',
      processing: 'In progress',
      done: 'Handled',
    },
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
        case 'self_report_opened':
          return 'Police report page opened';
        case 'police_recovered':
          return 'Police found the bike – the case ends';
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

  lowBatteryNotification: {
    title: 'Tag battery low',
    body: (percent: number) => `${percent} % left. Charge the tag to keep your bike monitored.`,
  },

  policeRecoveredNotification: {
    title: 'Your bike was found!',
    body: 'The police have found your bike. Open the app for details.',
  },

  support: {
    call: 'Call customer service',
    caseRef: (caseId: string) => `case number ${caseId}`,
  },
};

export const strings: Record<Language, Strings> = { fi, en };
