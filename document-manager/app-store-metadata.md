# DocVault — App Store Submission Metadata
> Version 1.0.0 · Bundle ID: `com.majboormajdoor.document-manager`

---

## 1. App Name
```
DocVault
```
*(30-character limit — 7 characters used)*

---

## 2. Subtitle
```
Scan, Organise & Secure Docs
```
*(30-character limit — 29 characters used)*

---

## 3. Promotional Text
*(170 characters max — shown above the description; can be updated any time without a new build)*

```
Your documents, safe and always at hand. Scan, organise, and share PDFs — all 100 % on-device with Face ID protection.
```
*(119 characters)*

---

## 4. Description
*(4 000 characters max)*

```
DocVault turns your iPhone or iPad into a powerful document scanner and vault.

Capture any paper document with your camera, and DocVault instantly converts it into a clean, high-quality PDF — stored privately on your device, never uploaded to any server.

── SCAN & IMPORT ──
• Multi-page scanning: scan as many pages as you need in a single session.
• Add or remove pages before saving.
• Import existing PDFs directly from your device storage or Files app.
• Import photos from your Photo Library as document pages.

── ORGANISE ──
• Sort documents into 8 built-in categories: Personal, Work, Finance, Medical, Legal, Education, Travel, and Other.
• Rename categories at any time.
• Instant full-text search across all your document names.
• Browse by category with live document counts.

── SECURE ──
• Face ID / Touch ID authentication — your documents are locked behind your biometrics.
• 4-digit passcode fallback for devices without biometric support.
• All data lives exclusively on your device. Nothing is ever sent to the cloud or any third party.

── SHARE & EXPORT ──
• Share any document as a PDF via the native iOS share sheet (AirDrop, Mail, Messages, and more).
• Share an entire category of documents at once.

── DESIGNED FOR iOS ──
• Clean, intuitive interface optimised for one-handed use.
• Full iPad support with a responsive layout.
• Dark-mode ready.

PRIVACY
DocVault is built with privacy as a first principle. All scanned images and PDFs are stored locally on your device. We collect zero analytics, zero crash data, and zero personal information. Your documents are yours alone.

Download DocVault and take control of your paperwork today.
```
*(~1 250 characters — well within the 4 000-character limit, leaving room to expand)*

---

## 5. Keywords
*(100-character limit, comma-separated — no spaces after commas saves characters)*

```
document scanner,PDF,scan,vault,organiser,secure,passcode,Face ID,file manager,paperless
```
*(89 characters)*

---

## 6. Support URL
> You must host a working support page before submission.
```
https://github.com/majboormajdoor/document-manager/issues
```
*(Replace with your actual support URL or a simple landing page)*

---

## 7. Marketing URL *(optional)*
```
https://github.com/majboormajdoor/document-manager
```

---

## 8. Privacy Policy URL
> Required by Apple. Host the `privacy-policy.txt` file publicly and paste the URL here.
```
https://raw.githubusercontent.com/majboormajdoor/document-manager/main/privacy-policy.txt
```
*(Update `APP_CONFIG.privacyPolicyUrl` in `src/constants/config.ts` with the same URL)*

---

## 9. App Store Categories

| Field | Value |
|---|---|
| Primary Category | **Productivity** |
| Secondary Category | **Utilities** |

---

## 10. Age Rating
Run the App Store Connect age-rating questionnaire with the answers below:

| Question | Answer |
|---|---|
| Made for Kids | No |
| Cartoon / Fantasy Violence | None |
| Realistic Violence | None |
| Sexual Content | None |
| Profanity | None |
| Alcohol, Tobacco, Drugs | None |
| Gambling | None |
| Medical / Treatment Info | None |
| User-Generated Content | No |

**Expected rating: 4+**

---

## 11. What's New (Version 1.0.0)
```
Welcome to DocVault!

• Multi-page document scanning with automatic PDF generation.
• 8 document categories with search and filtering.
• Face ID / Touch ID & passcode protection.
• Import PDFs from your Files app or photos from your library.
• Share documents individually or an entire category at once.
• 100 % on-device — your data never leaves your iPhone.
```

---

## 12. App Encryption / Export Compliance
DocVault uses the standard iOS Keychain / Secure Enclave APIs provided by the OS for biometric authentication. It does **not** implement any custom encryption algorithms.

Answer in App Store Connect:
- *Does your app use encryption?* → **No** (uses only standard iOS APIs — exempt from EAR)

---

## 13. Content Rights
- No third-party content, licensed music, or user-generated content.
- All assets are original or from the Expo/React Native open-source ecosystem.

---

## 14. App Review Notes
*(Paste this into the "Notes for App Review" field in App Store Connect)*

```
Test Account: Not required — DocVault has no server-side login.

How to test:
1. Launch the app. You will be prompted to set up Face ID or a 4-digit passcode.
2. Use the Scanner tab to scan a document using the device camera.
3. Save the scan and view it in the Documents tab.
4. Tap a document to open the viewer, then use the share button to export the PDF.

Permissions required:
• Camera — to scan document pages.
• Photo Library — to import images as document pages.
• Face ID — to lock the app. You may choose passcode instead during setup.

All data is stored locally; no network requests are made.
```

---

## 15. Required Assets Checklist

### App Icon (must be PNG, no alpha channel)
| Size | Usage |
|---|---|
| 1024 × 1024 px | App Store listing |

### Screenshots (minimum 1 per device family)
| Device | Canvas Size |
|---|---|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320 × 2868 px |
| iPhone 6.5" (iPhone 14 Plus / 15 Plus) | 1284 × 2778 px |
| iPad Pro 13" (M4) | 2064 × 2752 px |

> **Tip:** Use Expo's simulator builds (`npx expo run:ios --configuration Release`) to take screenshots at the correct resolutions. Tools like [AppLaunchpad](https://theapplaunchpad.com) or [Previewed](https://previewed.app) can add device frames automatically.

### App Preview Video *(optional but recommended)*
- Up to 30 seconds, MP4 or MOV
- Must show actual app UI (no animated mock-ups only)

---

## 16. Pre-Submission Checklist

- [ ] App icon added (`assets/images/icon.png`, 1024 × 1024, no alpha)
- [ ] Splash screen finalised
- [ ] `version` and `buildNumber` set in `app.json`
- [ ] Privacy Policy hosted at a public URL and updated in `config.ts`
- [ ] Support URL is live
- [ ] Production build created: `eas build --platform ios --profile production`
- [ ] Build uploaded to App Store Connect via `eas submit` or Transporter
- [ ] All metadata fields filled in App Store Connect
- [ ] Screenshots uploaded for all required device sizes
- [ ] Age-rating questionnaire completed
- [ ] Export compliance answered
- [ ] App Review Notes filled in
