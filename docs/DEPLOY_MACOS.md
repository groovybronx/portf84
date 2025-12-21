# Déploiement Native macOS - Lumina Portfolio

Ce guide explique comment transformer ce projet web en une application macOS native (.app et .dmg) en utilisant **Tauri**.

## 1. Installation des pré-requis

Sur votre Mac, ouvrez un terminal et installez Rust si vous ne l'avez pas :

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Ensuite, installez les outils de build macOS (Xcode Command Line Tools) :

```bash
xcode-select --install
```

## 2. Configurer Tauri dans le projet

1. **Installer le CLI Tauri** :

   ```bash
   npm install -D @tauri-apps/cli
   ```

2. **Initialiser la structure** :
   ```bash
   npx tauri init
   ```
   Répondez aux questions comme suit :
   - `What is your app name?` → `Lumina Portfolio`
   - `What should the window title be?` → `Lumina Portfolio`
   - `Where are your web assets (HTML/CSS/JS) located...` → `../dist`
   - `What is the url of your dev server?` → `http://localhost:5173` (ou 3000)
   - `What is your frontend dev command?` → `npm run dev`
   - `What is your frontend build command?` → `npm run build`

## 3. Optimisation pour macOS

### Icônes

Placez une image `app-icon.png` (min 512x512) dans `src-tauri` et lancez :

```bash
npx tauri icon src-tauri/app-icon.png
```

### Permissions (FileSystem)

Dans Tauri v2, les permissions sont gérées via des **capabilities**. Voir `src-tauri/capabilities/default.json`.
Pour autoriser l'accès au système de fichiers, vous devez configurer les permissions appropriées dans ce fichier.

Exemple de permission dans `src-tauri/capabilities/default.json` :

```json
{
  "permissions": [
    "core:default",
    "fs:default",
    {
      "identifier": "fs:allow-home-read-recursive",
      "preference": "home"
    }
  ]
}
```

## 4. Générer l'application

Pour générer le fichier `.dmg` final :

```bash
npm run build
npx tauri build
```

Le résultat se trouvera dans `src-tauri/target/release/bundle/dmg/`.

## 5. (Avancé) GitHub Actions pour le build automatique

Vous pouvez utiliser le fichier `.github/workflows/release-macos.yml` que j'ai créé. Il utilise `tauri-apps/tauri-action` pour compiler et créer une release GitHub automatiquement.

Pour déclencher le build :

1. Poussez vos changements sur la branche `main`.
2. Ou déclenchez manuellement via l'onglet **Actions** sur GitHub (**workflow_dispatch**).

---

_Note : Si votre app utilise massivement `FileSystemDirectoryHandle`, testez bien la version buildée car les permissions Webkit peuvent être plus restrictives qu'en mode dev._
