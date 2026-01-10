# 🚀 Deployment - Lumina Portfolio

**Build, deploy, and production configuration guide**

**Last Update**: January 8, 2026

---

## 📋 Overview

This guide covers the complete deployment process for Lumina Portfolio, including development builds, production builds, and distribution across different platforms.

### Supported Platforms

- **macOS** - .dmg installer
- **Windows** - .exe installer with NSIS
- **Linux** - .AppImage and .deb packages

---

## 🔧 Build Configuration

### Prerequisites

#### Development Environment
- **Node.js** 18+ LTS
- **Rust** stable toolchain
- **Platform-specific build tools**

#### Platform Dependencies
```bash
# macOS
xcode-select --install

# Windows
# Install Visual Studio Build Tools

# Linux (Ubuntu/Debian)
sudo apt-get install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### Build Scripts

#### package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:build:debug": "tauri build --debug",
    "build:all": "tauri build --target all",
    "build:macos": "tauri build --target macos",
    "build:windows": "tauri build --target windows",
    "build:linux": "tauri build --target linux",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "preview": "vite preview"
  }
}
```

---

## 🏗️ Development Builds

### Local Development

#### Frontend Only
```bash
# Start development server (web only)
npm run dev

# Access at http://localhost:1420
```

#### Full Application
```bash
# Start Tauri development (native app)
npm run tauri:dev

# Opens native window with hot reload
```

### Development Configuration

#### Tauri Config (Development)
```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Lumina Portfolio",
    "version": "0.3.0-beta.1"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "exists": true
      },
      "sql": {
        "all": true
      },
      "dialog": {
        "all": true
      },
      "notification": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.lumina.portfolio",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'https://generativelanguage.googleapis.com'"
    },
    "updater": {
      "active": false,
      "dialog": true,
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDBEQzE5QjZENjA0QjM5OQ"
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "Lumina Portfolio",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

---

## 📦 Production Builds

### Build Commands

#### All Platforms
```bash
# Build for all supported platforms
npm run build:all

# Output: src-tauri/target/release/bundle/
```

#### Platform-Specific
```bash
# macOS
npm run build:macos

# Windows
npm run build:windows

# Linux
npm run build:linux
```

#### Debug Builds
```bash
# Build with debug symbols
npm run tauri:build:debug
```

### Production Configuration

#### Environment Variables
```bash
# .env.production
VITE_GEMINI_API_KEY=your_production_api_key
VITE_SENTRY_DSN=your_sentry_dsn
VITE_LOG_LEVEL=error
VITE_ENABLE_DEV_TOOLS=false
```

#### Tauri Config (Production)
```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Lumina Portfolio",
    "version": "0.3.0-beta.1"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "category": "Photography",
      "copyright": "Copyright © 2026 Lumina Portfolio",
      "deb": {
        "depends": ["libwebkit2gtk-4.0-37", "libayatana-appindicator3-1"],
        "useBootstrapper": true
      },
      "appimage": {
        "bundleMediaFramework": true
      },
      "nsis": {
        "displayLanguageSelector": true,
        "allowDowngrades": false
      },
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      }
    },
    "updater": {
      "active": true,
      "dialog": true,
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDBEQzE5QjZENjA0QjM5OQ",
      "endpoints": ["https://releases.lumina.app/{{target}}/{{arch}}/{{current_version}}"]
    }
  }
}
```

---

## 🍎 macOS Deployment

### Build Configuration

#### macOS-Specific Settings
```json
{
  "bundle": {
    "macOS": {
      "entitlements": "entitlements.plist",
      "providerShortName": "Lumina",
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
      "hardenedRuntime": true,
      "shortDescription": "AI-powered photo gallery application"
    }
  }
}
```

#### Entitlements (entitlements.plist)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.cs.disable-executable-stack-protection</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

### Code Signing

#### Development Build
```bash
# Build without signing (for development)
npm run tauri:build
```

#### Production Build
```bash
# Build with code signing
# Requires Apple Developer account and certificates
npm run tauri:build

# Notarize (required for distribution)
xcrun altool --notarize-app \
  --primary-bundle-id "com.lumina.portfolio" \
  --username "your-email@example.com" \
  --password "@keychain:AC_PASSWORD" \
  --file "Lumina Portfolio.dmg"
```

### Distribution

#### DMG Creation
```bash
# Create custom DMG
create-dmg \
  --volname "Lumina Portfolio" \
  --volicon "src-tauri/icons/icon.icns" \
  --window-pos 200 120 \
  --window-size 600 300 \
  --icon-size 100 \
  --icon "Lumina Portfolio.app" 175 120 \
  --hide-extension "Lumina Portfolio.app" \
  --app-drop-link 425 120 \
  "Lumina Portfolio.dmg" \
  "src-tauri/target/release/bundle/macos/"
```

---

## 🪟 Windows Deployment

### Build Configuration

#### Windows-Specific Settings
```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "CERTIFICATE_THUMBPRINT",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com",
      "tsp": false,
      "wix": {
        "language": ["en-US", "fr-FR"],
        "template": "main.wxs",
        "fragmentPaths": []
      },
      "nsis": {
        "displayLanguageSelector": true,
        "installerIcon": "icons/icon.ico",
        "installMode": "perMachine",
        "languages": ["English", "French"],
        "template": "installer.nsh",
        "customLanguageFiles": {}
      }
    }
  }
}
```

### Code Signing

#### Certificate Configuration
```bash
# Install certificate to Windows Certificate Store
certutil -import -p -s MY certificate.pfx

# Build with signing
npm run tauri:build
```

#### Installer Customization

#### NSIS Script (installer.nsh)
```nsis
; Custom installer script
!macro customInstall
  ; Create desktop shortcut
  CreateShortCut "$DESKTOP\Lumina Portfolio.lnk" "$INSTDIR\Lumina Portfolio.exe"

  ; Add to PATH
  ${EnvVarUpdate} $0 "PATH" "A" "HKLM" "$INSTDIR"
!macroend

!macro customUnInstall
  ; Remove desktop shortcut
  Delete "$DESKTOP\Lumina Portfolio.lnk"

  ; Remove from PATH
  ${un.EnvVarUpdate} $0 "PATH" "R" "HKLM" "$INSTDIR"
!macroend
```

---

## 🐧 Linux Deployment

### Build Configuration

#### Linux-Specific Settings
```json
{
  "bundle": {
    "appimage": {
      "bundleMediaFramework": true,
      "files": {
        "usr/share/icons/hicolor/256x256/apps/lumina-portfolio.png": "icons/icon.png"
      }
    },
    "deb": {
      "depends": [
        "libwebkit2gtk-4.0-37",
        "libayatana-appindicator3-1",
        "libnotify4",
        "libxtst6",
        "libnss3",
        "libatk-bridge2.0-0",
        "libdrm2",
        "libxcomposite1",
        "libxdamage1",
        "libxrandr2",
        "libgbm1",
        "libxss1",
        "libasound2"
      ],
      "useBootstrapper": true
    }
  }
}
```

### Package Creation

#### AppImage
```bash
# Build AppImage
npm run tauri:build --target appimage

# Output: src-tauri/target/release/bundle/appimage/
```

#### Debian Package
```bash
# Build .deb package
npm run tauri:build --target deb

# Output: src-tauri/target/release/bundle/deb/
```

#### Repository Setup
```bash
# Create APT repository
mkdir -p apt-repo/conf
cd apt-repo

# Generate package metadata
apt-ftparchive release . > Release
apt-ftparchive release . -c apt-ftparchive.conf > Release

# Sign repository
gpg --clear-sign -o InRelease Release
gpg -abs -o Release.gpg Release
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

#### Workflow Configuration
```yaml
name: Build and Release

on:
  push:
    tags: ['v*']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Type check
        run: npm run type-check

  build:
    needs: test
    strategy:
      matrix:
        platform: [macos-latest, windows-latest, ubuntu-latest]

    runs-on: ${{ matrix.platform }}

    steps:
      - uses: actions/checkout@v3

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      - name: Install dependencies (Ubuntu)
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.0-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run tauri:build
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.platform }}-build
          path: src-tauri/target/release/bundle/

  release:
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')

    steps:
      - uses: actions/checkout@v3

      - name: Download artifacts
        uses: actions/download-artifact@v3

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: '**/*.dmg,**/*.exe,**/*.AppImage,**/*.deb'
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Environment Variables

#### GitHub Secrets
```yaml
# Required secrets
GITHUB_TOKEN: # Automatic
TAURI_SIGNING_PRIVATE_KEY: # For code signing
TAURI_SIGNING_PRIVATE_KEY_PASSWORD: # For code signing
APPLE_CERTIFICATE: # For macOS signing
APPLE_CERTIFICATE_PASSWORD: # For macOS signing
WINDOWS_CERTIFICATE: # For Windows signing
```

---

## 📊 Distribution Strategy

### Release Channels

#### Stable Channel
```json
{
  "updater": {
    "active": true,
    "endpoints": ["https://releases.lumina.app/stable/{{target}}/{{arch}}/{{current_version}}"],
    "dialog": true
  }
}
```

#### Beta Channel
```json
{
  "updater": {
    "active": true,
    "endpoints": ["https://releases.lumina.app/beta/{{target}}/{{arch}}/{{current_version}}"],
    "dialog": true
  }
}
```

### Version Management

#### Semantic Versioning
```bash
# Major version (breaking changes)
npm version major

# Minor version (new features)
npm version minor

# Patch version (bug fixes)
npm version patch

# Pre-release
npm version prerelease --preid=beta
```

#### Release Automation
```bash
#!/bin/bash
# release.sh

set -e

# Get current version
VERSION=$(node -p "require('./package.json').version")

# Build for all platforms
npm run build:all

# Create GitHub release
gh release create "v$VERSION" \
  --title "Lumina Portfolio v$VERSION" \
  --generate-notes \
  src-tauri/target/release/bundle/**/*

echo "Release v$VERSION created successfully!"
```

---

## 🔍 Quality Assurance

### Automated Testing

#### Build Testing
```bash
# Test build process
npm run build:test

# Test installation
npm run test:install

# Test update process
npm run test:update
```

#### Smoke Testing
```bash
#!/bin/bash
# smoke-test.sh

# Test basic functionality
echo "Testing basic functionality..."

# Test application launch
./Lumina\ Portfolio --help

# Test database creation
./Lumina\ Portfolio --test-db

# Test API connectivity
./Lumina\ Portfolio --test-api

echo "Smoke tests passed!"
```

### Performance Monitoring

#### Build Metrics
```typescript
// build-monitor.js
const { performance } = require('perf_hooks');

function measureBuildTime() {
  const start = performance.now();

  // Run build command
  const { execSync } = require('child_process');
  execSync('npm run tauri:build', { stdio: 'inherit' });

  const end = performance.now();
  const duration = end - start;

  console.log(`Build completed in ${duration.toFixed(2)}ms`);

  // Send to monitoring service
  sendMetrics('build_duration', duration);
}
```

---

## 🔧 Troubleshooting

### Common Build Issues

#### Rust Compilation Errors
```bash
# Clear Rust cache
cargo clean

# Update Rust toolchain
rustup update

# Rebuild
npm run tauri:build
```

#### Node.js Module Issues
```bash
# Clear node modules
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

#### Platform-Specific Issues

##### macOS
```bash
# Clear Xcode cache
sudo xcode-select --install

# Reset signing identity
security unlock-keychain
```

##### Windows
```bash
# Clear Visual Studio cache
del /s /f "%LOCALAPPDATA%\Microsoft\VisualStudio"

# Rebuild with clean environment
npm run tauri:build -- --target x64
```

##### Linux
```bash
# Install missing dependencies
sudo apt-get install -f

# Rebuild
npm run tauri:build
```

### Debug Builds

#### Enable Debug Logging
```typescript
// src-tauri/src/main.rs
#[cfg(debug_assertions)]
tauri::Builder::default()
    .plugin(tauri_plugin_devtools::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

#### Console Output
```bash
# Run with verbose output
RUST_LOG=debug npm run tauri:dev

# Check build logs
npm run tauri:build -- --verbose
```

---

## 📚 Related Documentation

- **[Architecture](../../ARCHITECTURE.md)** - System architecture overview
- **[Developer Guide](../../DEVELOPER_GUIDE.md)** - Development workflow
- **[API Reference](../../API_REFERENCE.md)** - Complete API documentation
- **[User Guide](../../USER_GUIDE.md)** - End-user documentation

---

## 🆘 Support

### Build Issues
- **GitHub Issues**: [Report build problems](https://github.com/groovybronx/portf84/issues)
- **Discussions**: [Build questions](https://github.com/groovybronx/portf84/discussions)

### Platform-Specific Support
- **macOS**: Check Apple Developer documentation
- **Windows**: Review Microsoft signing requirements
- **Linux**: Consult distribution-specific packaging guidelines

---

<div align="center">

**Deployment Documentation** - Build and distribute Lumina Portfolio 🚀✨

[🏠 Back to Documentation](../../README.md) | [💻 Developer Guide](../../DEVELOPER_GUIDE.md) | [🏗️ Architecture](../../ARCHITECTURE.md)

</div>
