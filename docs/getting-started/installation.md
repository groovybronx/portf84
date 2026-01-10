# 🚀 Installation - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026

---

## 📋 Vue d'Ensemble

Ce guide vous accompagne dans l'installation de Lumina Portfolio sur votre machine. L'application est disponible pour macOS, Windows et Linux.

---

## 💻 Prérequis Système

### **Configuration Minimale**

- **Système** : macOS 10.15+, Windows 10+, ou Linux (Ubuntu 18.04+)
- **RAM** : 8GB recommandé (4GB minimum)
- **Stockage** : 500MB d'espace libre
- **Processeur** : 64-bit, multi-core recommandé

### **Logiciels Requis**

- **Node.js** : Version 18.0 ou supérieure
- **Git** : Pour cloner le dépôt

---

## 📦 Étape 1 : Installation Node.js

### **macOS**

```bash
# Via Homebrew (recommandé)
brew install node

# Ou téléchargement direct
# https://nodejs.org/en/download/
```

### **Windows**

```powershell
# Via Chocolatey
choco install nodejs

# Ou téléchargement direct
# https://nodejs.org/en/download/
```

### **Linux**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Ou via gestionnaire de paquets
sudo apt install nodejs npm
```

### **Vérification**

```bash
node --version  # v20.11.0+ recommandé
npm --version   # 10.0.0+
```

---

## 🚀 Étape 2 : Cloner le Projet

### **Méthode 1 : HTTPS (Recommandée)**

```bash
git clone https://github.com/groovybronx/portf84.git
cd portf84
```

### **Méthode 2 : SSH**

```bash
git clone git@github.com:groovybronx/portf84.git
cd portf84
```

### **Vérification**

```bash
ls -la
# Vous devriez voir : package.json, src/, src-tauri/, etc.
```

---

## 📦 Étape 3 : Installation des Dépendances

### **Installation Node.js**

```bash
npm install
```

### **Installation Tauri (Automatique)**

```bash
# Tauri CLI est installé automatiquement avec npm install
# Vérification :
npm run tauri:info
```

### **Dépannage**

```bash
# Si problème de permissions
sudo chown -R $(whoami) node_modules

# Si problème de cache
npm cache clean --force
npm install
```

---

## ⚙️ Étape 4 : Configuration

### **Variables d'Environnement**

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec votre éditeur préféré
nano .env  # ou code .env, vscode .env
```

### **Configuration API Gemini (Optionnel)**

```bash
# Ouvrir .env et ajouter :
VITE_GEMINI_API_KEY=votre_clé_api_ici

# Pour obtenir une clé API :
# 1. Allez sur https://makersuite.google.com/app/apikey
# 2. Créez une nouvelle clé API
# 3. Copiez-la dans votre .env
```

### **Configuration Base de Données (Optionnel)**

```bash
# Chemin personnalisé pour la base de données
VITE_DB_PATH=/chemin/vers/dossier/personnalisé

# Si non spécifié, utilise le chemin par défaut du système
```

---

## 🎯 Étape 5 : Premier Lancement

### **Mode Développement**

```bash
npm run tauri:dev
```

### **Ce qui se passe**

1. **Vite dev server** démarre sur `http://localhost:1420`
2. **Tauri** compile l'application desktop
3. **Fenêtre application** s'ouvre avec l'interface Lumina

### **Vérification**

- ✅ Fenêtre d'application qui s'ouvre
- ✅ Interface Lumina Portfolio visible
- ✅ Console sans erreurs critiques

---

## 🏗️ Étape 6 : Build de Production

### **Build Application**

```bash
# Build frontend
npm run build

# Build application desktop
npm run tauri:build
```

### **Résultats**

```bash
# Build créé dans :
src-tauri/target/release/bundle/

# Fichiers générés :
# macOS : .app, .dmg
# Windows : .exe, .msi
# Linux : .deb, .AppImage
```

---

## 🔧 Dépannage

### **Problèmes Courants**

#### **1. Node.js Version Ancienne**

```bash
# Erreur : "Node.js version too old"
# Solution :
brew upgrade node  # macOS
# Ou télécharger dernière version sur nodejs.org
```

#### **2. Permissions macOS**

```bash
# Erreur : "Permission denied"
# Solution :
sudo xcode-select --install
# Ou autoriser l'application dans Préférences Système
```

#### **3. Dépendances Manquantes**

```bash
# Erreur : "Module not found"
# Solution :
rm -rf node_modules package-lock.json
npm install
```

#### **4. Build Tauri Échoue**

```bash
# Erreur : "Tauri build failed"
# Solution :
npm run tauri:info
# Vérifier les dépendances système manquantes
```

#### **5. Port Déjà Utilisé**

```bash
# Erreur : "Port 1420 already in use"
# Solution :
lsof -ti:1420 | xargs kill -9
# Puis relancer npm run tauri:dev
```

### **Logs Utiles**

```bash
# Logs de développement
npm run tauri:dev -- --log-level debug

# Logs de build
npm run tauri:build -- --verbose

# Informations système
npm run tauri:info
```

---

## 🎉 Premiers Pas

### **1. Créer Votre Première Collection**

1. Cliquez sur "New Collection" dans la sidebar
2. Donnez un nom (ex: "Vacances 2024")
3. Choisissez une couleur pour l'identifier

### **2. Ajouter des Photos**

1. Cliquez sur "Import Folder"
2. Sélectionnez un dossier de photos sur votre ordinateur
3. Attendez l'importation (progress bar visible)

### **3. Explorer l'IA**

1. Sélectionnez quelques photos
2. Cliquez sur "Analyze with AI"
3. Patientez pour les descriptions et tags automatiques

### **4. Organiser**

1. Utilisez les tags pour filtrer
2. Créez des dossiers virtuels
3. Expérimentez avec les color tags

---

## 📱 Installation par Plateforme

### **macOS**

```bash
# Installation complète
brew install node git
git clone https://github.com/groovybronx/portf84.git
cd portf84
npm install
npm run tauri:dev
```

### **Windows**

```powershell
# Avec Chocolatey
choco install nodejs git
git clone https://github.com/groovybronx/portf84.git
cd portf84
npm install
npm run tauri:dev
```

### **Linux (Ubuntu/Debian)**

```bash
# Installation dépendances
sudo apt update
sudo apt install -y nodejs npm git

# Clone et installation
git clone https://github.com/groovybronx/portf84.git
cd portf84
npm install
npm run tauri:dev
```

---

## 🔍 Vérification d'Installation

### **Script de Vérification**

```bash
# Créer un script de test
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Git version: $(git --version)"
echo "Project structure:"
ls -la | grep -E "(package|src|tauri)"

# Test des commandes
npm run type-check  # Vérification TypeScript
npm run tauri:info   # Info Tauri
```

### **Checklist de Validation**

- [ ] Node.js 18+ installé
- [ ] Git disponible
- [ ] Projet cloné avec succès
- [ ] Dépendances installées sans erreur
- [ ] `npm run tauri:dev` démarre correctement
- [ ] Interface visible dans la fenêtre d'application
- [ ] Console sans erreurs critiques

---

## 📚 Ressources Additionnelles

### **Documentation**

- [**Developer Setup**](../developer/setup.md) - Configuration avancée
- [**Architecture**](../developer/architecture.md) - Comprendre la structure
- [**Interface Guide**](../user-guide/interface.md) - Utilisation de l'interface

### **Support**

- **GitHub Issues** : [Signaler un problème](https://github.com/groovybronx/portf84/issues)
- **GitHub Discussions** : [Poser une question](https://github.com/groovybronx/portf84/discussions)

---

## 🎯 Prochaines Étapes

Une fois l'installation réussie :

1. **Explorez l'interface** avec le [guide utilisateur](../user-guide/interface.md)
2. **Configurez l'IA** avec votre clé API Gemini
3. **Importez vos photos** et organisez-les
4. **Découvrez les fonctionnalités** avancées

---

**Bienvenue dans Lumina Portfolio ! 🎉**

_Pour la documentation complète : [README](../README.md)_
