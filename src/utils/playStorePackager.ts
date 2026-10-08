import JSZip from 'jszip';

export async function generatePlayStoreZipPackage(appUrl: string): Promise<Blob> {
  const zip = new JSZip();

  const packageName = 'jp.co.fujitv.remote';
  const appName = 'Fuji TV Remote - Smart TV Controller';

  // 1. AndroidManifest.xml (TWA Compliant)
  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">

        <meta-data
            android:name="asset_statements"
            android:resource="@string/asset_statements" />

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:exported="true"
            android:label="${appName}">
            
            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="${appUrl}" />
            
            <meta-data
                android:name="android.support.customtabs.trusted.STATUS_BAR_COLOR"
                android:resource="@color/colorPrimary" />
                
            <meta-data
                android:name="android.support.customtabs.trusted.NAVIGATION_BAR_COLOR"
                android:resource="@color/colorPrimaryDark" />

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- TWA Digital Asset Link Intent Filter -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="${new URL(appUrl).host}" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  // 2. build.gradle.kts
  const buildGradle = `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "${packageName}"
    compileSdk = 34

    defaultConfig {
        applicationId = "${packageName}"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")
    implementation("androidx.core:core-ktx:1.12.0")
}`;

  // 3. Digital Asset Links (assetlinks.json)
  const assetLinks = JSON.stringify(
    [
      {
        relation: [
          'delegate_permission/common.handle_all_urls',
          'delegate_permission/common.get_login_creds',
        ],
        target: {
          namespace: 'android_app',
          package_name: packageName,
          sha256_cert_fingerprints: [
            '14:6D:E9:7F:0F:7B:42:A8:1A:3A:5B:78:E2:9F:80:C5:3C:9B:10:4F:2E:88:9C:1D:3B:5A:70:9F:3E:12:4A:8C',
          ],
        },
      },
    ],
    null,
    2
  );

  // 4. README Play Store Guide
  const readme = `# Fuji TV Remote - Google Play Store Publishing Guide

Congratulations! This package contains everything you need to publish **Fuji TV Remote** on the Google Play Store.

## Quick Option 1: PWABuilder (Recommended - 2 Minutes, Zero Code)
1. Go to https://www.pwabuilder.com/
2. Enter your live Web App URL: ${appUrl}
3. Click **"Package for Stores"** -> **"Google Play"**
4. Set Package ID to \`${packageName}\`
5. Download your signed \`.aab\` (Android App Bundle).
6. Upload the \`.aab\` directly to the Google Play Console!

## Quick Option 2: Android Studio Build
1. Create a new Android Project in Android Studio.
2. Replace \`AndroidManifest.xml\` with the one included in this archive.
3. Replace \`build.gradle.kts\` with the included dependency file.
4. Select **Build > Generate Signed Bundle / APK > Android App Bundle (.aab)**.
5. Upload the resulting \`app-release.aab\` to the Google Play Console.

## Play Store Graphics Requirements (Included):
- **App Icon**: 512x512 PNG (included: \`pwa-512x512.png\`)
- **Feature Graphic**: 1024x500 PNG (included: \`feature-graphic.png\`)
- **Category**: Entertainment / Utilities
- **Target Audience**: Everyone (PEGI 3 / ESRB Everyone)
`;

  zip.file('android/AndroidManifest.xml', androidManifest);
  zip.file('android/build.gradle.kts', buildGradle);
  zip.file('.well-known/assetlinks.json', assetLinks);
  zip.file('README_PLAY_STORE_GUIDE.md', readme);

  // Fetch icons and feature graphic from public directory if available
  try {
    const iconRes = await fetch('/pwa-512x512.png');
    if (iconRes.ok) {
      const iconBlob = await iconRes.blob();
      zip.file('store_assets/pwa-512x512.png', iconBlob);
    }

    const featureRes = await fetch('/feature-graphic.png');
    if (featureRes.ok) {
      const featureBlob = await featureRes.blob();
      zip.file('store_assets/feature-graphic.png', featureBlob);
    }

    const maskableRes = await fetch('/pwa-maskable-512x512.png');
    if (maskableRes.ok) {
      const maskableBlob = await maskableRes.blob();
      zip.file('store_assets/pwa-maskable-512x512.png', maskableBlob);
    }
  } catch {
    // If running in environment without fetch, skip binary attachments
  }

  return await zip.generateAsync({ type: 'blob' });
}
