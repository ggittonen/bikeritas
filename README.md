# Bikeritas

A mobile app for tracking a bike fitted with a GPS tag. When the bike moves without permission, the
app raises an alarm and offers two simple choices: *Ei huolta* ("No worries") or *Epäilen varkautta*
("I suspect theft"). In the second case, customer service notifies the police and files the crime
report and insurance claim for you.

Built with Expo (SDK 58), React Native, TypeScript and Expo Router.

> The app's interface is in Finnish. Button and tab names below are given as they appear in the app,
> with English translations where helpful.

---

## Quick start

> **No Expo account? No problem.** The account is only needed for tunnel mode. Do steps **1** and
> **2** below as usual, then instead of step 3 run `npx expo start` (home Wi‑Fi or a phone hotspot)
> or `npm run web` (browser). See [Without an Expo account](#without-an-expo-account).

### 1. Install once

- **Node.js** (LTS): https://nodejs.org
- **Git**: https://git-scm.com
- **Expo Go** on your phone (App Store / Google Play)
- *Optional:* a free **Expo account**: https://expo.dev/signup (only for tunnel mode)

### 2. Get the project

```bash
git clone https://github.com/ggittonen/bikeritas.git
cd bikeritas
npm install
```

### 3. Start it on your computer

```bash
npx expo login           # first time only
npx expo start --tunnel
```

Keep this terminal window open while you use the app. Stop it with **Ctrl+C**.

No account? Use `npx expo start` instead, with the phone on the same Wi‑Fi or hotspot
([details](#without-an-expo-account)).

### 4. Open it on your phone

1. Open **Expo Go** and log in with the **same Expo account**.
2. On the home screen, under **Development servers**, tap **Bikeritas**.
3. Allow notifications.

> You can also scan the QR code: on iPhone with the regular Camera app, on Android from inside
> Expo Go. If the code won't scan, use the login method above.

### Who needs which account?

- **Only the person running `npx expo start --tunnel` must be logged in to Expo.** Any free account
  works. Nobody needs to create a "Bikeritas" project on expo.dev.
- **Phones logged in to the same Expo account** see the server under *Development servers*.
- **Any other phone** (e.g. a teammate's) can open the same running server **without logging in**.
  Send them the `exp://….exp.direct` link shown in the terminal and they tap it, or they scan the
  QR code.
- Teammates can also run their own server from their own clone, logged in to their own Expo
  account.
- **For the two-phone test, what must match is the Firebase backend** (the same `.env.local`), not
  the Expo account.

### Without an Expo account

The Expo account is only needed for `--tunnel`. You still need steps **1** (install Node.js, Git
and Expo Go) and **2** (`git clone` + `npm install`) first. Then, instead of step 3, use one of
these:

**A. Same Wi‑Fi (phone and computer on the same network)**

```bash
npx expo start
```

No login needed. Scan the QR code (iPhone: Camera app, Android: inside Expo Go), or type the
`exp://192.168.…:8081` address shown in the terminal into Expo Go.

This only works on networks that let devices talk to each other: home Wi‑Fi or a **phone hotspot**
works. Eduroam and most school or office networks don't; use the tunnel there.

**B. In a browser (no phone, no Expo Go)**

```bash
npm run web
```

Opens at http://localhost:8081, with a real map. Notifications don't work in the browser, and
location comes from the computer, which is much less accurate than a phone's GPS.

The browser works well as the **owner's side** in the two-phone test: pair it with a tag phone's
code and the HUOMIO! screen appears in the browser when the bike moves.

---

## Try a theft scenario

1. **PYÖRÄT** (Bikes) → *Aktivoi valvonta* (Turn on monitoring). Your current location is saved as
   the parking spot.
2. **Testaustila** (Test mode) → *Simuloi varkaus* (Simulate theft). In about 10 seconds the bike is
   more than 30 m away and the **HUOMIO!** (Alert!) screen opens.
3. Choose *Ei huolta* (No worries), *Epäilen varkautta* (I suspect theft) or *Avaa kartta* (Open map).
4. *Epäilen varkautta* requires the **Bikeritas Turva** subscription. Turn it on in the **MUUT**
   (More) tab. It's simulated, so nothing is charged.
5. The tracking screen shows the route and a timeline of events. Finish with *Pyörä saatu takaisin*
   (Bike recovered).

### Using your phone's real location

**MUUT** (More) → **Sijainnin lähde** (Location source) → **Tämän puhelimen GPS** (This phone's
GPS), then allow location access. The phone now acts as the tag. Turn on monitoring and walk more
than 30 m outdoors. The location only updates while the app is open.

---

## Two phones: tag on the bike, alerts on the owner's phone

One phone plays the GPS tag and rides with the bike. The owner's phone gets the alert.

### How it works

```
 Tag phone (on the bike)            Firebase Firestore             Owner's phone
 ───────────────────────            ──────────────────             ─────────────
 reads GPS every ~3 s   ──writes──▶  bikes/{code}       ──live──▶  follows the bike on the map,
 sends position+battery             (one document               runs the 30 m theft check,
                                     per bike)                   shows HUOMIO! + notification
```

- **The tag phone** (*tägitila*, tag mode) only sends: position, battery and a timestamp, into one
  document named after its 8-character pairing code, e.g. `AB3K-9XQ2`.
- **Firestore** is the backend. It keeps the latest state of each bike and pushes every change
  straight to anyone listening. No server code to host.
- **The owner's phone** listens to that document. It treats it like any other location source, so
  the theft check, alert screen, route and reporting all work the same as on one phone. If no
  update arrives for 30 s, it shows the tag as disconnected.
- **The real GPS tag** can later write to the same document, and the owner's app won't need to
  change.

### Limits of this prototype

- **The owner's app must be open** to get the alert. Alerts while the app is closed need real push
  notifications, which need a development build (Expo Go on Android doesn't support them). The next
  step is a Cloud Function that runs the theft check on the server and sends a push.
- **The tag phone must stay in tag mode with the screen on.** The screen stays awake automatically.
- **Pairing is by code only.** Anyone who knows a code can read that bike's location. Add Firebase
  Auth before real users.
- Firestore's free tier allows 20,000 writes a day. The tag writes about 1,200 an hour, which is
  plenty for testing.

### One-time setup: create the Firebase backend (about 10 min)

1. Go to https://console.firebase.google.com → **Create a project** (e.g. `bikeritas`). Google
   Analytics can be turned off.
2. **Build → Firestore Database → Create database.** Pick a location in Europe (e.g.
   `europe-north1`) and start in **production mode**.
3. In Firestore, open the **Rules** tab, replace everything with the contents of
   [`firestore.rules`](firestore.rules), and click **Publish**.
4. **Project settings** (gear icon) → **Your apps** → the **Web** icon `</>` → register an app
   (e.g. `bikeritas`). Don't enable Hosting. Firebase shows a `firebaseConfig` with values.
5. In the project folder, copy `.env.example` to a new file **`.env.local`** and paste the values:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=bikeritas-xxxx.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=bikeritas-xxxx
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=bikeritas-xxxx.firebasestorage.app
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
   EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc123
   ```
   `.env.local` is not uploaded to GitHub. Send it to teammates privately so everyone uses the
   same backend.
6. Restart the server: `npx expo start --tunnel --clear`.

### Try it

1. Open the app on **both** phones (both in Expo Go, from the same running server).
2. **Tag phone:** **MUUT** → *Käynnistä tägitila* (Start tag mode). Allow location. A code like
   `AB3K-9XQ2` appears.
3. **Owner's phone:** **MUUT** → **Sijainnin lähde** → *Pyörän tägi (toinen puhelin)* (Bike's tag,
   other phone) → type the code → *Yhdistä* (Connect). The **SIJAINTI** map now shows the tag
   phone's position.
4. **Owner's phone:** **PYÖRÄT** → *Aktivoi valvonta*.
5. Walk more than 30 m outdoors with the tag phone. The owner's phone shows **HUOMIO!** and a
   notification.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Phone can't connect | Start with `npx expo start --tunnel` (school networks block direct connections) |
| "Incompatible with this version of Expo Go" | Update Expo Go from the app store |
| Old or broken screen | `npx expo start --clear` |
| Location doesn't show | Allow location for Expo Go in the phone's settings, and go outdoors |
| "Backend puuttuu" (Backend missing) | Create `.env.local` (see *Two phones* above) and restart with `--clear` |
| "Tägiä ei löydy tällä koodilla" (No tag with this code) | Start tag mode on the other phone first, and check the code |
| Owner sees "Tägi ei ole lähettänyt sijaintia hetkeen" | The tag phone left tag mode, locked its screen or lost its network |
| `npx expo login` crashes ("exited with non-zero code") | Use `npx expo login --no-browser` or an access token (below) |
| Expo account was created with Google, so there's no password | Use an access token (below) |
| Bikeritas doesn't appear in Expo Go | The computer and phone must be logged in to the **same** account. Don't use a robot token |

### Logging in with an access token

1. Go to https://expo.dev/settings/access-tokens → **Personal access tokens** → **Create token**,
   and copy the token.
2. Run in the terminal (keep the quotes):
   ```powershell
   $env:EXPO_TOKEN="your-token-here"
   npx expo start --tunnel
   ```
   This setting only lasts while that terminal window is open.
3. On the phone: Expo Go → **Log in** → **Continue with Google**, using the same account.

Never put the token in the code, on GitHub or in a chat.

---

## For developers

```bash
npm run typecheck   # TypeScript check
npm run lint        # ESLint
```

### Project structure

```
src/
  app/                    Screens (Expo Router: every file is a screen)
    (tabs)/index.tsx      SIJAINTI (Location): full-screen map
    (tabs)/bikes.tsx      PYÖRÄT (Bikes): monitoring on/off, tag status, test mode
    (tabs)/more.tsx       MUUT (More): subscription and location source
    alert.tsx             HUOMIO! alert and the choices
    incident.tsx          Theft tracking and timeline
    tag-mode.tsx          Tag mode: this phone sends its location to the backend
  domain/                 Pure logic with no UI (types, distances, movement detection)
  services/
    backend/              Firebase setup and the bikes/{code} document (publish / watch)
    tag/                  TagService interface: simulator, this phone's GPS, remote tag
    support/              SupportService interface + mock (customer service / police / insurance)
    notifications.ts      Local notifications
    index.ts              Swap the mocks for real implementations here
  state/                  App state (reducer + BikeContext)
  components/             UI pieces (map, buttons, cards, icons)
  theme.ts                Colors and fonts
```

Screens only use the `TagService` and `SupportService` interfaces. So the real tag
(BLE / LTE-M / cloud API) and the customer service backend can be plugged in at
`src/services/index.ts` without changing any screens.

### Next steps

- Real tag hardware writing to the same `bikes/{code}` document
- Theft check in a Cloud Function + push notifications, so the owner is alerted with the app closed
  (needs a development build: `npx expo run:android` or EAS)
- Firebase Auth, so only the owner can see their bike
- Alarm sound / speaker in the tag (mind the battery use)
- Skip the alarm automatically when the owner's phone is nearby
- Real subscription and payments
- Map API keys before publishing to the app stores
