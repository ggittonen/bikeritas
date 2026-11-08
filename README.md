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

### 1. Install once

- **Node.js** (LTS): https://nodejs.org
- **Git**: https://git-scm.com
- **Expo Go** on your phone (App Store / Google Play)
- A free **Expo account**: https://expo.dev/signup

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

### 4. Open it on your phone

1. Open **Expo Go** and log in with the **same Expo account**.
2. On the home screen, under **Development servers**, tap **Bikeritas**.
3. Allow notifications.

> You can also scan the QR code: on iPhone with the regular Camera app, on Android from inside
> Expo Go. If the code won't scan, use the login method above.

### Or in a browser

```bash
npm run web
```

Opens at http://localhost:8081. Notifications don't work in the browser.

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

**MUUT** (More) → **Sijainnin lähde** (Location source) → **Puhelimen GPS** (Phone GPS), then allow
location access. The phone now acts as the tag. Turn on monitoring and walk more than 30 m outdoors.
The location only updates while the app is open.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Phone can't connect | Start with `npx expo start --tunnel` (school networks block direct connections) |
| "Incompatible with this version of Expo Go" | Update Expo Go from the app store |
| Old or broken screen | `npx expo start --clear` |
| Location doesn't show | Allow location for Expo Go in the phone's settings, and go outdoors |
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
  domain/                 Pure logic with no UI (types, distances, movement detection)
  services/
    tag/                  TagService interface: simulator and phone GPS
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

- Real tag hardware and pairing it with the app
- A backend, so the tag and the owner's phone can be separate devices
- Remote push notifications (needs a development build: `npx expo run:android` or EAS)
- Alarm sound / speaker in the tag (mind the battery use)
- Skip the alarm automatically when the owner's phone is nearby
- Real subscription and payments
- Map API keys before publishing to the app stores
