# Deployment Guide

## Overview

Ce guide couvre le déploiement de Lumina Portfolio, une application desktop construite avec Tauri et React. Le processus inclut la configuration de l'environnement, le build pour différentes plateformes, et la distribution.

## Architecture de Déploiement

### Technology Stack

- **Frontend**: React 18.3.1 + TypeScript + Vite
- **Backend**: Tauri v2 (Rust)
- **Database**: SQLite intégrée
- **Build System**: Vite + Tauri CLI
- **Packaging**: Tauri Bundler

### Plateformes Supportées

- **Windows**: Windows 10/11 (x64)
- **macOS**: macOS 10.15+ (Intel & Apple Silicon)
- **Linux**: Ubuntu 18.04+, Debian 10+, Fedora 35+

## Configuration de l'Environnement

### Prérequis Système

#### Développement

```bash
# Node.js 18+ requis
node --version  # v18.0.0+

# Rust requis pour Tauri
rustc --version  # 1.70+

# Package managers
npm --version   # 9.0.0+
```

#### Dépendances Platform-Specific

##### Windows

```powershell
# Visual Studio Build Tools
# Installer via Visual Studio Installer ou:
winget install Microsoft.VisualStudio.2022.BuildTools

# OpenSSL (pour certaines dépendances)
winget install ShiningLight.OpenSSL.Light
```

##### macOS

```bash
# Xcode Command Line Tools
xcode-select --install

# Homebrew (recommandé)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Dépendances macOS
brew install openssl
```

##### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y \
    build-essential \
    curl \
    wget \
    libssl-dev \
    pkg-config \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Fedora
sudo dnf install -y \
    gcc-c++ \
    curl \
    wget \
    openssl-devel \
    pkg-config \
    gtk3-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel
```

### Configuration du Projet

#### Environment Variables

```bash
# .env.local
VITE_GEMINI_API_KEY=your_api_key_here
VITE_APP_VERSION=1.0.0
VITE_BUILD_ENV=production

# Tauri environment
TAURI_BUNDLE_IDENTIFIER=com.lumina.portfolio
TAURI_PRODUCT_NAME=Lumina Portfolio
TAURI_VERSION=1.0.0
```

#### Tauri Configuration

```toml
# src-tauri/tauri.conf.json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Lumina Portfolio",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "createDir": true,
        "removeFile": true,
        "removeDir": true
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "sql": {
        "all": false,
        "execute": true
      }
    },
    "bundle": {
      "active": true,
      "category": "Photography",
      "copyright": "© 2026 Lumina Portfolio",
      "deb": {
        "depends": ["libgtk-3-0", "libnotify4", "libnss3", "libxss1", "libxtst6", "xdg-utils", "libatspi2.0-0", "libdrm2", "libxcomposite1", "libxdamage1", "libxrandr2", "libgbm1", "libxkbcommon0", "libasound2"]
      },
      "externalBin": [],
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.lumina.portfolio",
      "longDescription": "A modern desktop photo gallery application with AI-powered tagging",
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      },
      "resources": [],
      "shortDescription": "AI-powered photo gallery",
      "targets": "all",
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": "default-src 'self'; img-src 'self' asset: https: asset: http: data:; style-src 'self' 'unsafe-inline'"
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 900,
        "resizable": true,
        "title": "Lumina Portfolio",
        "width": 1200,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

## Processus de Build

### Build Frontend

```bash
# Build de production
npm run build

# Vérification du build
ls -la dist/
```

### Build Tauri

```bash
# Build pour la plateforme actuelle
npm run tauri:build

# Build pour toutes les plateformes
npm run tauri:build -- --target universal-apple-darwin # macOS Universal
npm run tauri:build -- --target x86_64-pc-windows-msvc   # Windows 64-bit
npm run tauri:build -- --target x86_64-unknown-linux-gnu # Linux 64-bit
```

### Scripts de Build Automatisés

```json
{
	"scripts": {
		"build:all": "npm run build && npm run tauri:build -- --target all",
		"build:mac": "npm run build && npm run tauri:build -- --target universal-apple-darwin",
		"build:win": "npm run build && npm run tauri:build -- --target x86_64-pc-windows-msvc",
		"build:linux": "npm run build && npm run tauri:build -- --target x86_64-unknown-linux-gnu",
		"build:dev": "npm run build && npm run tauri:build -- --debug",
		"clean": "rm -rf dist src-tauri/target"
	}
}
```

## Configuration CI/CD

### GitHub Actions Workflow

#### Build Multi-Plateforme

```yaml
# .github/workflows/build.yml
name: Build and Release

on:
  push:
    tags: ["v*"]
  pull_request:
    branches: ["main"]

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]

    runs-on: ${{ matrix.platform }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install dependencies (ubuntu only)
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf

      - name: Rust setup
        uses: dtolnay/rust-toolchain@stable

      - name: Node setup
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install npm dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build

      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: v${{ github.ref_name }}
          releaseName: "Lumina Portfolio ${{ github.ref_name }}"
          releaseBody: "See the assets to download and install this version."
          releaseDraft: true
          prerelease: false
          args: "--target ${{ matrix.platform }}"
```

#### Release Automation

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false

  build-and-upload:
    needs: create-release
    strategy:
      matrix:
        include:
          - platform: "macos-latest"
            args: "--target universal-apple-darwin"
          - platform: "ubuntu-latest"
            args: "--target x86_64-unknown-linux-gnu"
          - platform: "windows-latest"
            args: "--target x86_64-pc-windows-msvc"

    runs-on: ${{ matrix.platform }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        run: |
          rustup target add ${{ matrix.platform }}
          npm ci

      - name: Build
        run: npm run build:all

      - name: Upload
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ needs.create-release.outputs.upload_url }}
          asset_path: src-tauri/target/release/bundle/
          asset_name: lumina-portfolio-${{ matrix.platform }}
          asset_content_type: application/octet-stream
```

## Code Signing

### Windows Code Signing

```powershell
# Configuration du certificat
$certPath = "path/to/certificate.pfx"
$certPassword = "your_password"

# Build avec signature
tauri build -- --target x86_64-pc-windows-msvc --sign $certPath --password $certPassword
```

### macOS Code Signing

```bash
# Configuration du signing identity
export SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"

# Build avec signature
cargo tauri build -- --target universal-apple-darwin --sign $SIGNING_IDENTITY

# Notarization (requis pour la distribution)
xcrun altool --notarize-app \
  --primary-bundle-id "com.lumina.portfolio" \
  --username "your@email.com" \
  --password "@keychain:AC_PASSWORD" \
  --file "Lumina Portfolio.pkg"
```

### Configuration Tauri pour Signing

```toml
# src-tauri/tauri.conf.json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.digicert.com"
      },
      "macOS": {
        "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
        "providerShortName": "YourTeamName",
        "entitlements": "entitlements.plist"
      }
    }
  }
}
```

## Distribution

### Package Managers

#### Microsoft Store (Windows)

```xml
<!-- Package.appxmanifest -->
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10">
  <Identity Name="LuminaPortfolio"
            Publisher="CN=YourCompany"
            Version="1.0.0.0" />
  <Properties>
    <DisplayName>Lumina Portfolio</DisplayName>
    <PublisherDisplayName>Your Company</PublisherDisplayName>
    <Logo>Assets\StoreLogo.png</Logo>
  </Properties>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Universal" MinVersion="10.0.0.0" MaxVersionTested="10.0.0.0" />
  </Dependencies>
  <Applications>
    <Application Id="App" Executable="$targetnametoken$.exe" EntryPoint="$targetentrypoint$">
      <uap:VisualElements DisplayName="Lumina Portfolio"
                          Square150x150Logo="Assets\Square150x150Logo.png"
                          Square44x44Logo="Assets\Square44x44Logo.png"
                          Description="AI-powered photo gallery application" />
    </Application>
  </Applications>
</Package>
```

#### Mac App Store

```xml
<!-- Info.plist -->
<dict>
    <key>CFBundleIdentifier</key>
    <string>com.lumina.portfolio</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSRequiresAquaSystemAppearance</key>
    <false/>
</dict>
```

#### Snap Store (Linux)

```yaml
# snap/snapcraft.yaml
name: lumina-portfolio
version: "1.0.0"
summary: AI-powered photo gallery
description: |
  A modern desktop photo gallery application with AI-powered tagging and organization.

grade: stable
confinement: strict
base: core20

apps:
  lumina-portfolio:
    command: bin/lumina-portfolio
    plugs:
      - home
      - removable-media
      - network

parts:
  lumina-portfolio:
    plugin: rust
    source: .
    build-packages:
      - libssl-dev
      - pkg-config
      - libgtk-3-dev
```

### Auto-Update Configuration

#### Tauri Updater

```rust
// src-tauri/src/main.rs
#[tauri::command]
async fn check_for_updates() -> Result<bool, String> {
    let updater = tauri::updater::builder().build()?;

    match updater.check().await {
        Ok(update) => {
            if update.is_available() {
                Ok(true)
            } else {
                Ok(false)
            }
        }
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
async fn install_update() -> Result<(), String> {
    let updater = tauri::updater::builder().build()?;

    updater.install().await
        .map_err(|e| e.to_string())
}
```

#### Configuration du Updater

```toml
# src-tauri/tauri.conf.json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": ["https://releases.lumina-portfolio.com/{{target}}/{{version}}"],
      "dialog": true,
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDQxMEI2MTI2RTc5RkU5QzE="
    }
  }
}
```

## Testing et Validation

### Automated Testing Pipeline

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Type checking
        run: npm run type-check

      - name: Build test
        run: npm run build
```

### Performance Testing

```bash
# Scripts de test de performance
#!/bin/bash
# performance-test.sh

echo "Running performance tests..."

# Test de build time
start_time=$(date +%s.%N)
npm run build
end_time=$(date +%s.%N)
build_time=$(echo "$end_time - $start_time" | bc)
echo "Build time: ${build_time}s"

# Test de taille du bundle
bundle_size=$(du -sh dist/ | cut -f1)
echo "Bundle size: $bundle_size"

# Test de l'application
npm run tauri:dev &
APP_PID=$!

# Attendre le démarrage
sleep 10

# Test de performance avec Lighthouse
npm install -g @lhci/cli@0.12.x
lhci autorun
lhci upload --target=temporary-public-storage

# Nettoyage
kill $APP_PID
```

### Validation de Package

```bash
#!/bin/bash
# validate-package.sh

PACKAGE_PATH=$1

if [ -z "$PACKAGE_PATH" ]; then
    echo "Usage: $0 <package-path>"
    exit 1
fi

echo "Validating package: $PACKAGE_PATH"

# Vérifier l'intégrité du package
if command -v codesign &> /dev/null; then
    codesign --verify --verbose "$PACKAGE_PATH"
fi

# Vérifier la taille
size=$(du -sh "$PACKAGE_PATH" | cut -f1)
echo "Package size: $size"

# Vérifier les dépendances
if command -v ldd &> /dev/null; then
    echo "Dependencies:"
    ldd "$PACKAGE_PATH"
fi

# Test d'installation temporaire
TEMP_DIR=$(mktemp -d)
echo "Testing installation..."
cp "$PACKAGE_PATH" "$TEMP_DIR/"
cd "$TEMP_DIR"

# Extraction et test selon le type
case "$PACKAGE_PATH" in
    *.dmg)
        hdiutil attach "$PACKAGE_PATH"
        # Tests...
        hdiutil detach /Volumes/Lumina*
        ;;
    *.exe)
        # Tests Windows...
        ;;
    *.deb)
        dpkg-deb -x "$PACKAGE_PATH" extracted/
        # Tests...
        ;;
esac

echo "Package validation completed"
```

## Monitoring et Analytics

### Error Reporting

```typescript
// src/shared/utils/errorReporting.ts
export class ErrorReporter {
	static report(error: Error, context?: any): void {
		const errorData = {
			message: error.message,
			stack: error.stack,
			context,
			timestamp: new Date().toISOString(),
			version: import.meta.env.VITE_APP_VERSION,
			platform: navigator.platform,
		};

		// Envoyer au service de monitoring
		this.sendToMonitoring(errorData);
	}

	private static async sendToMonitoring(data: any): Promise<void> {
		try {
			await fetch("https://monitoring.lumina-portfolio.com/errors", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
		} catch (e) {
			console.error("Failed to report error:", e);
		}
	}
}
```

### Usage Analytics

```typescript
// src/shared/utils/analytics.ts
export class Analytics {
	static track(event: string, properties?: any): void {
		const eventData = {
			event,
			properties,
			timestamp: Date.now(),
			version: import.meta.env.VITE_APP_VERSION,
			sessionId: this.getSessionId(),
		};

		this.sendEvent(eventData);
	}

	private static getSessionId(): string {
		let sessionId = sessionStorage.getItem("analytics_session_id");
		if (!sessionId) {
			sessionId = generateId();
			sessionStorage.setItem("analytics_session_id", sessionId);
		}
		return sessionId;
	}

	private static async sendEvent(data: any): Promise<void> {
		try {
			await fetch("https://analytics.lumina-portfolio.com/track", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
		} catch (e) {
			console.error("Failed to send analytics:", e);
		}
	}
}
```

## Sécurité

### Security Hardening

```toml
# src-tauri/tauri.conf.json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; img-src 'self' asset: https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval';"
    },
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "createDir": true,
        "removeFile": true,
        "removeDir": true,
        "scope": ["$APPDATA/*", "$DOCUMENT/*", "$DOWNLOAD/*"]
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "sql": {
        "all": false,
        "execute": true
      }
    }
  }
}
```

### Validation des Inputs

```rust
// src-tauri/src/validation.rs
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct SafePath {
    path: String,
}

impl SafePath {
    pub fn validate(&self) -> Result<(), String> {
        // Vérifier les path traversal attacks
        if self.path.contains("..") {
            return Err("Path traversal detected".to_string());
        }

        // Vérifier les caractères dangereux
        if self.path.contains(|c| matches!(c, '\0' | '/' | '\\')) {
            return Err("Invalid characters in path".to_string());
        }

        Ok(())
    }
}
```

## Troubleshooting

### Problèmes Communs

#### Build Failures

```bash
# Problème: Rust toolchain outdated
rustup update stable

# Problème: Dependencies manquantes
# macOS
xcode-select --install

# Linux
sudo apt-get install build-essential libssl-dev pkg-config

# Windows
# Installer Visual Studio Build Tools
```

#### Runtime Errors

```bash
# Problème: Database locked
# Solution: Fermer toutes les instances de l'application

# Problème: Permissions denied
# Solution: Vérifier les permissions dans tauri.conf.json

# Problème: Memory leaks
# Solution: Monitorer avec les devtools et profiler
```

#### Platform-Specific Issues

```bash
# macOS: Code signing failed
# Solution: Vérifier le certificat et l'identity
security find-identity -v -p codesigning

# Windows: Certificate not found
# Solution: Importer le certificat dans le magasin
certutil -importpfx certificate.pfx

# Linux: Dependencies missing
# Solution: Installer les dépendances système
sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils
```

### Debug Tools

```bash
# Tauri dev mode avec logs détaillés
RUST_LOG=debug npm run tauri:dev

# Build avec debug symbols
npm run tauri:build -- --debug

# Analyse des dépendances
npm audit
cargo audit

# Performance profiling
npm run build
npm run tauri:dev -- --profiling
```

## Future Enhancements

### Roadmap de Déploiement

1. **Q1 2026**: Auto-update amélioré
2. **Q2 2026**: Distribution via stores officiels
3. **Q3 2026**: CI/CD pipeline complet
4. **Q4 2026**: Monitoring avancé et analytics

### Améliorations Prévues

- **Portable Builds**: Versions sans installation
- **Docker Support**: Conteneurisation pour testing
- **Cloud Deployment**: Version web progressive
- **A/B Testing**: Déploiement progressif des features
- **Rollback System**: Retour automatique en cas d'erreur

### Monitoring Avancé

- **Real-time Metrics**: Monitoring en temps réel
- **Error Tracking**: Suivi détaillé des erreurs
- **Performance Analytics**: Analytics de performance
- **User Behavior Tracking**: Analyse du comportement utilisateur
- **Automated Alerts**: Alertes automatiques sur les seuils critiques
