# 🤖 Android Build Setup Guide

This file contains everything you need to set up automatic Android builds via GitHub Actions.
Android 10 (API 29) → Android 15 (API 35) | Java 17 | No iOS.

---

## 📁 Step 1 — Create GitHub Actions Workflow

In your **GitHub repo root**, create this folder and file:
```
.github/workflows/android-build.yml
```

Paste this content:

```yaml
name: 🤖 Android Build

on:
  push:
    branches:
      - main
      - master
  pull_request:
    branches:
      - main
      - master
  workflow_dispatch:
    inputs:
      build_type:
        description: 'Build type (apk or aab)'
        required: true
        default: 'apk'
        type: choice
        options:
          - apk
          - aab

jobs:
  build-android:
    name: Build Android APK / AAB
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: ☕ Setup Java 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: 🟢 Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/mobile/package-lock.json

      - name: 📦 Install mobile dependencies
        working-directory: apps/mobile
        run: npm ci

      - name: 🤖 Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: 📱 Install SDK platforms API 29-35 (Android 10-15)
        run: |
          sdkmanager \
            "platforms;android-35" \
            "platforms;android-34" \
            "platforms;android-33" \
            "platforms;android-32" \
            "platforms;android-31" \
            "platforms;android-30" \
            "platforms;android-29" \
            "build-tools;35.0.0" \
            "ndk;26.1.10909125" \
            --sdk_root=$ANDROID_SDK_ROOT

      - name: 🔑 Decode Keystore
        if: ${{ secrets.KEYSTORE_BASE64 != '' }}
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > ${{ github.workspace }}/keystore.jks

      - name: 🏗️ Expo Prebuild — Android only
        working-directory: apps/mobile
        run: npx expo prebuild --platform android --clean --no-install
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: 🔧 Make gradlew executable
        working-directory: apps/mobile/android
        run: chmod +x gradlew

      - name: 🔨 Build Release APK (signed)
        if: ${{ github.event.inputs.build_type != 'aab' && secrets.KEYSTORE_BASE64 != '' }}
        working-directory: apps/mobile/android
        run: |
          ./gradlew assembleRelease \
            -Pandroid.injected.signing.store.file=${{ github.workspace }}/keystore.jks \
            -Pandroid.injected.signing.store.password=${{ secrets.KEYSTORE_PASSWORD }} \
            -Pandroid.injected.signing.key.alias=${{ secrets.KEY_ALIAS }} \
            -Pandroid.injected.signing.key.password=${{ secrets.KEY_PASSWORD }} \
            --no-daemon
        env:
          JAVA_HOME: ${{ env.JAVA_HOME }}

      - name: 🔨 Build Debug APK (no signing keys set)
        if: ${{ github.event.inputs.build_type != 'aab' && secrets.KEYSTORE_BASE64 == '' }}
        working-directory: apps/mobile/android
        run: ./gradlew assembleDebug --no-daemon
        env:
          JAVA_HOME: ${{ env.JAVA_HOME }}

      - name: 🔨 Build Release AAB (Play Store)
        if: ${{ github.event.inputs.build_type == 'aab' }}
        working-directory: apps/mobile/android
        run: |
          ./gradlew bundleRelease \
            -Pandroid.injected.signing.store.file=${{ github.workspace }}/keystore.jks \
            -Pandroid.injected.signing.store.password=${{ secrets.KEYSTORE_PASSWORD }} \
            -Pandroid.injected.signing.key.alias=${{ secrets.KEY_ALIAS }} \
            -Pandroid.injected.signing.key.password=${{ secrets.KEY_PASSWORD }} \
            --no-daemon
        env:
          JAVA_HOME: ${{ env.JAVA_HOME }}

      - name: 📤 Upload APK
        if: ${{ github.event.inputs.build_type != 'aab' }}
        uses: actions/upload-artifact@v4
        with:
          name: CreatorHub-${{ github.run_number }}.apk
          path: |
            apps/mobile/android/app/build/outputs/apk/release/*.apk
            apps/mobile/android/app/build/outputs/apk/debug/*.apk
          if-no-files-found: warn
          retention-days: 30

      - name: 📤 Upload AAB
        if: ${{ github.event.inputs.build_type == 'aab' }}
        uses: actions/upload-artifact@v4
        with:
          name: CreatorHub-${{ github.run_number }}.aab
          path: apps/mobile/android/app/build/outputs/bundle/release/*.aab
          if-no-files-found: warn
          retention-days: 30

      - name: 📋 Build Summary
        run: |
          echo "## ✅ Android Build Complete" >> $GITHUB_STEP_SUMMARY
          echo "| Property | Value |" >> $GITHUB_STEP_SUMMARY
          echo "|---|---|" >> $GITHUB_STEP_SUMMARY
          echo "| **Java** | 17 (Temurin) |" >> $GITHUB_STEP_SUMMARY
          echo "| **Min SDK** | Android 10 (API 29) |" >> $GITHUB_STEP_SUMMARY
          echo "| **Target SDK** | Android 15 (API 35) |" >> $GITHUB_STEP_SUMMARY
          echo "| **Build #** | ${{ github.run_number }} |" >> $GITHUB_STEP_SUMMARY
```

---

## 📋 Step 2 — Configure app.json (Android only)

Your `apps/mobile/app.json` should have this Android config
(the platform manages this file — ask support to update it, or edit directly if you have access):

```json
{
  "expo": {
    "name": "CreatorHub",
    "slug": "creatorhub",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "android": {
      "package": "com.creatorhub.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0a0a0a"
      },
      "compileSdkVersion": 35,
      "targetSdkVersion": 35,
      "minSdkVersion": 29,
      "buildToolsVersion": "35.0.0",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "VIBRATE"
      ]
    },
    "plugins": [
      "expo-router",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "minSdkVersion": 29,
            "buildToolsVersion": "35.0.0",
            "kotlinVersion": "1.9.0"
          }
        }
      ]
    ]
  }
}
```

---

## 📋 Step 3 — Create eas.json (Android only)

Create `apps/mobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services-key.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 🔐 Step 4 — Add GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value |
|---|---|
| `EXPO_TOKEN` | Your Expo token (from expo.dev → Account → Access Tokens) |
| `KEYSTORE_BASE64` | Base64-encoded keystore: `base64 -w 0 mykeystore.jks` |
| `KEYSTORE_PASSWORD` | Your keystore password |
| `KEY_ALIAS` | Your key alias |
| `KEY_PASSWORD` | Your key password |

> **Note:** If you don't add signing secrets, the workflow will auto-build a **debug APK** instead.

---

## 🏃 Step 5 — Generate a Keystore (if you don't have one)

Run this on your local machine:

```bash
keytool -genkey -v \
  -keystore creatorhub.jks \
  -alias creatorhub \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Then encode it for GitHub:
```bash
base64 -w 0 creatorhub.jks
```

Copy the output and paste it as the `KEYSTORE_BASE64` secret.

---

## ✅ Android Version Support

| Android Version | API Level | Supported |
|---|---|---|
| Android 10 | API 29 | ✅ Min SDK |
| Android 11 | API 30 | ✅ |
| Android 12 | API 31/32 | ✅ |
| Android 13 | API 33 | ✅ |
| Android 14 | API 34 | ✅ |
| Android 15 | API 35 | ✅ Target SDK |

---

## 🚀 How to Trigger a Build

1. **Automatic**: Push to `main` or `master` branch
2. **Manual**: Go to GitHub → **Actions** → **Android Build** → **Run workflow** → Choose APK or AAB
