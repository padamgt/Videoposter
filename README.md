# ReelKatha — Expo app (iOS + Android)

One codebase, both platforms. Runs on iPhone and Android from the same `App.js`.

## 1. Create the project
```bash
npx create-expo-app reelkatha --template blank
cd reelkatha
```
Then replace the generated `App.js` with the one in this folder.

## 2. Install dependencies
Use `expo install` for the native modules so versions match your SDK:
```bash
npx expo install react-native-safe-area-context expo-linear-gradient react-native-svg expo-status-bar expo-font
npm install lucide-react-native @expo-google-fonts/bricolage-grotesque @expo-google-fonts/inter
```

## 3. Run it
```bash
npx expo start
```
- **iPhone:** open the Camera app, scan the QR code → opens in Expo Go.
- **Android:** open the Expo Go app → scan the QR code.
- Simulators: press `i` (iOS) or `a` (Android) in the terminal.

## 4. What's simulated vs. real
Everything renders and navigates for real. Two things are stand-ins for your backend:
- **Generation** (`Root` → the `stages` effect) — fakes the pipeline with timers. Replace with a call to your `.NET`/HotChocolate `generateReel` mutation, then poll job status.
- **Caption/hashtags** (`buildCaption`, `buildTags`) — placeholder text. Replace with your LLM/SEO endpoint response.
- **Send to TikTok** (`onSend`) — just flips status locally. Wire to your `video.upload` (draft) flow.

## Notes
- Safe areas (notch / home indicator) are handled via `react-native-safe-area-context` — correct on both platforms.
- Shadows use iOS `shadow*` + Android `elevation`.
- No browser storage; state is in-memory. Add persistence (SQLite / AsyncStorage) when you connect the backend.
- To ship to the App Store / Play Store later, use EAS Build: `npx eas build`.
