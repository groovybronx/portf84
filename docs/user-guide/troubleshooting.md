# 🔧 Troubleshooting - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026

---

## 📋 Vue d'Ensemble

Ce guide vous aide à résoudre les problèmes courants que vous pourriez rencontrer avec Lumina Portfolio. Les solutions sont organisées par catégorie pour une résolution rapide.

---

## 🚀 Problèmes d'Installation

### **Application ne démarre pas**

#### **Symptôme**

```bash
npm run tauri:dev
# Erreur : "command not found" ou "permission denied"
```

#### **Solutions**

```bash
# 1. Vérifier Node.js
node --version  # Doit être 18+
npm --version   # Doit être 10+

# 2. Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# 3. Vérifier Tauri
npm run tauri:info

# 4. macOS : Vérifier Xcode
xcode-select --install
```

#### **Si problème persiste**

```bash
# Nettoyer complètement
npm cache clean --force
npm install
npm run tauri:dev
```

### **Erreur de compilation**

#### **Symptôme**

```bash
Error: Cannot find module 'react' or 'react-dom'
```

#### **Solutions**

```bash
# Réinstaller les dépendances
npm install

# Vérifier package.json
cat package.json | grep "react"

# Si manquant, ajouter manuellement
npm install react react-dom
```

---

## 📁 Problèmes d'Importation

### **Photos ne s'importent pas**

#### **Symptôme**

- Aucune photo ne s'affiche après l'import
- Progress bar reste à 0%
- Aucun message d'erreur

#### **Causes Possibles**

1. **Permissions du dossier** insuffisantes
2. **Format de fichier** non supporté
3. **Chemin trop long** ou caractères spéciaux
4. **Dossier vide** ou protégé

#### **Solutions**

```bash
# 1. Vérifier les permissions (macOS/Linux)
ls -la "/path/to/photos"
# Doit montrer des permissions de lecture

# 2. Changer les permissions si nécessaire
chmod -R 755 "/path/to/photos"

# 3. Tester avec un dossier simple
# Créer un dossier test avec quelques images
mkdir ~/lumina-test
cp "/path/to/photo.jpg" ~/lumina-test/
```

#### **Dépannage Avancé**

```bash
# Logs de l'application
npm run tauri:dev -- --log-level debug

# Vérifier le dossier dans l'application
# Les logs montreront le chemin exact utilisé
```

### **Import très lent**

#### **Symptôme**

- L'import prend plusieurs minutes pour quelques photos
- Progress bar avance très lentement
- Application devient non responsive

#### **Solutions**

```bash
# 1. Réduire la taille du lot
# Dans les paramètres IA, réduire le batch size

# 2. Désactiver l'analyse automatique
# Dans Settings > IA, décochez "Auto-analyze on import"

# 3. Importer par étapes
# Importez 50 photos à la fois au lieu de 500+
```

---

## 🤖 Problèmes d'Analyse IA

### **L'analyse IA ne fonctionne pas**

#### **Symptôme**

- Message d'erreur "API key invalid"
- Tags IA ne sont pas générés
- Progress bar reste à 0%

#### **Vérification**

```typescript
// Dans la console du navigateur (F12)
console.log(localStorage.getItem("gemini_api_key"));
// Devrait retourner votre clé API ou null
```

#### **Solutions**

1. **Obtenir une clé API Gemini**

   - Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Créez une nouvelle clé API
   - Copiez la clé

2. **Configurer dans l'application**

   - Cliquez sur ⚙️ Settings
   - Allez dans l'onglet "AI"
   - Entrez votre clé API
   - Sauvegardez

3. **Tester la clé**
   ```bash
   # Test simple avec curl
   curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent" \
     -H "Content-Type: application/json" \
     -H "x-goog-api-key: VOTRE_CLÉ_API" \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}'
   ```

### **Taux d'erreur élevé**

#### **Symptôme**

- Beaucoup de tags ont une faible confiance (< 0.5)
- Tags incohérents ou incorrects
- Analyse échoue pour certaines images

#### **Solutions**

```typescript
// 1. Augmenter le seuil de confiance
// Dans Settings > IA
{
  confidence: 0.7,  // Augmenter de 0.5 à 0.7
  batchSize: 3     // Réduire pour une meilleure qualité
}

// 2. Préparer les images
// - Utilisez des images de bonne qualité
// - Évitez les images très floues ou très sombres
// - Préférez les formats JPEG/PNG de bonne résolution
```

---

## 🏷️ Problèmes de Tags

### **Tags ne s'affichent pas**

#### **Symptôme**

- Tags IA générés mais invisibles
- Tags manuels ne s'appliquent pas
- Color tags ne fonctionnent pas

#### **Solutions**

```typescript
// 1. Vérifier l'affichage des tags
// Dans Settings > UI
{
  showTags: true,      // Activer l'affichage des tags
  showColorTags: true, // Activer les color tags
  tagSize: 'medium'    // Ajuster la taille si nécessaire
}

// 2. Forcer le rafraîchissement
// Dans la console
localStorage.clear();
location.reload();
```

### **Fusion de tags ne fonctionne pas**

#### **Symptôme**

- Tags similaires ne sont pas détectés
- La fusion échoue avec erreur
- Tags dupliqués persistent

#### **Solutions**

```typescript
// 1. Vérifier les paramètres de fusion
// Dans Tag Hub > Settings
{
  similarityThreshold: 0.8,  // Seuil de similarité
  autoMerge: false,        // Activer la fusion automatique
  caseSensitive: false     // Ignorer la casse
}

// 2. Fusion manuelle
// Dans Tag Hub > Fusion
1. Sélectionnez les tags à fusionner
2. Cliquez sur "Fusionner"
3. Confirmez le tag cible
```

---

## 🔍 Problèmes de Recherche

### **Recherche ne trouve rien**

#### **Symptôme**

- La recherche ne retourne aucun résultat
- Les filtres ne fonctionnent pas
- Recherche par tag ne marche pas

#### **Solutions**

```bash
# 1. Vérifier l'indexation
# Les tags doivent être indexés pour la recherche
npm run tauri:dev -- --debug
# Chercher "search index" dans les logs

# 2. Rebuild l'index
# Dans les paramètres avancés
{
  rebuildSearchIndex: true
}

# 3. Vérifier la syntaxe de recherche
# Bon : "plage soleil"
# Mauvais : "plage ET soleil" (utilisez des espaces)
```

### **Recherche très lente**

#### **Symptème**

- La recherche prend plusieurs secondes
- L'interface se fige pendant la recherche
- Trop de résultats ralentissent l'application

#### **Solutions**

```typescript
// 1. Limiter les résultats
// Dans Settings > Performance
{
  maxSearchResults: 100,    // Limiter les résultats
  searchDebounce: 300,   // Délai entre les recherches
  enableVirtualization: true
}

// 2. Optimiser les filtres
// Appliquez les filtres progressivement plutôt que tous en même
```

---

## 🎨 Problèmes d'Interface

### **Interface lente ou figée**

#### **Symptôme**

- L'application ne répond plus aux clics
- Les animations sont lentes ou saccadées
- Le processeur est à 100% d'utilisation

#### **Solutions**

```bash
# 1. Vérifier la taille de la collection
# Les grandes collections (>10k photos) peuvent être lentes
# Créez des sous-collections

# 2. Réduire la qualité des aperçus
# Dans Settings > UI
{
  thumbnailQuality: 'medium', // Réduire de 'high' à 'medium'
  thumbnailSize: 'medium',    // Réduire la taille
}

# 3. Activer la virtualisation
{
  enableVirtualization: true,
  virtualizationThreshold: 100
}
```

### **Éléments d'interface manquants**

#### **Symptôme**

- Certains boutons ou icônes ne s'affichent pas
- Les couleurs ou styles sont incorrects
- L'interface semble cassée

#### **Solutions**

```bash
# 1. Vider le cache du navigateur
# Chrome/Edge: Ctrl+Shift+R
# Firefox: Ctrl+F5
# Safari: Cmd+Option+R

# 2. Redémarrer l'application
npm run tauri:dev

# 3. Vérifier la console pour les erreurs CSS
# F12 > Console
# Cherchez les erreurs CSS ou JavaScript
```

---

## 🗄️ Problèmes de Base de Données

### **Base de données corrompue**

#### **Symptôme**

- Erreur "database is locked"
- Collections ou tags manquants
- L'application ne démarre pas

#### **Solutions**

```bash
# 1. Réinitialiser la base de données
# DANGER : Ceci supprimera toutes vos données !
# Sauvegardez d'abord si nécessaire

# 2. Supprimer la base de données
rm -f ~/.local/share/lumina/lumina.db

# 3. Redémarrer l'application
npm run tauri:dev
# Une nouvelle base de données sera créée
```

### **Performances de la base de données**

#### **Symptôme**

- L'application devient lente avec le temps
- Les requêtes prennent plusieurs secondes
- La base de données grossit (>1GB)

#### **Solutions**

```typescript
// 1. Optimiser les requêtes
// Dans Settings > Database
{
  enableQueryCache: true,
  maxCacheSize: 1000,
  cacheExpiration: 3600000 // 1 heure
}

// 2. Nettoyer régulièrement
// Dans Tag Hub > Settings
{
  autoCleanup: true,
  cleanupInterval: 86400000, // 24 heures
  cleanupThreshold: 100
}
```

---

## 🔧 Problèmes Techniques

### **Mémoire insuffisante**

#### **Symptème**

- L'application se ferme brutalement
- Message d'erreur "out of memory"
- Le système devient lent

#### **Solutions**

```bash
# 1. Vérifier l'utilisation mémoire
# Activity Monitor (macOS) ou Task Manager (Windows)
# Chercher "tauri" ou "node"

# 2. Réduire la taille des collections
# Créez des collections plus petites et spécialisées

# 3. Optimiser les paramètres
{
  maxConcurrentAnalysis: 3,  // Réduire l'analyse IA
  thumbnailCacheSize: 500,    // Limiter le cache
  enableLazyLoading: true
}
```

### **Conflits de dépendances**

#### **Symptôme**

```bash
npm install
# Erreur : "peer dependency conflicts"
# ou "version mismatch"
```

#### **Solutions**

```bash
# 1. Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# 2. Forcer les versions si nécessaire
npm install --force

# 3. Utiliser npm ci si disponible
npm ci
```

---

## 📱 Problèmes Spécifiques par Plateforme

### **macOS**

#### **Permissions refusées**

```bash
# Donner les permissions nécessaires
sudo xcode-select --install

# Pour les accès aux fichiers
# L'application demandera les permissions au besoin
```

#### **Notarisation Gatekeeper**

```bash
# Si l'application est bloquée par macOS
# 1. Allez dans Préférences Système > Sécurité et confidentialité
# 2. Autoriser l'application Lumina Portfolio
# 3. Redémarrez l'application
```

### **Windows**

#### **Antivirus bloquant**

```bash
# Ajouter l'application aux exceptions
# Dans votre antivirus :
# 1. Allez dans Paramètres > Protection contre les virus et menaces
# 2. Ajoutez le dossier d'installation aux exclusions
# 3. Redémarrez l'application
```

### **Linux**

#### **Dépendances manquantes**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm libsqlite3-dev

# Fedora/CentOS
sudo dnf install nodejs npm sqlite-devel

# Arch Linux
sudo pacman -S nodejs npm sqlite
```

---

## 🆘 Obtenir de l'Aide

### **Logs de l'Application**

```bash
# Activer les logs détaillés
npm run tauri:dev -- --log-level debug

# Logs de l'application
# Dans la console du navigateur (F12)
# Les logs apparaissent dans la console
```

### **Logs du Système**

```bash
# macOS
console
# Cherchez "tauri" ou "lumina"

# Windows
Get-EventLog -LogName Application | Where-Object {$_.Message -match "*lumina*"}

# Linux
journalctl -u | grep lumina
```

### **Rapport de Bug**

#### **Information à inclure**

```markdown
## Description

Description claire du problème

## Steps to Reproduce

1. Aller à...
2. Cliquer sur...
3. Observer...

## Expected Behavior

Ce qui devrait se passer

## Actual Behavior

Ce qui se passe réellement

## Environment

- OS: [macOS 13.0 / Windows 11 / Ubuntu 22.04]
- Version: [0.1.0]
- Browser: [Chrome 108 / Firefox 107 / Safari 16]
- Memory: [8GB / 16GB / 32GB]

## Additional Context

- Screenshots si applicable
- Console errors
- Logs système
```

---

## 📚 Ressources Additionnelles

### **Documentation**

- **[Guide Installation](../getting-started/installation.md)** : Installation complète
- **[Guide Interface](../user-guide/interface.md)** : Utilisation complète
- **[Developer Setup](../developer/setup.md)** : Configuration avancée

### **Support Communautaire**

- **GitHub Issues** : [Signaler un problème](https://github.com/groovybronx/portf84/issues)
- **GitHub Discussions** : [Poser une question](https://github.com/groovybronx/portf84/discussions)
- **Discord** : (si disponible) Serveur communautaire

### **Outils de Diagnostic**

```bash
# Vérifier l'environnement
npm run tauri:info

# Tester la base de données
sqlite3 ~/.local/share/lumina/lumina.db ".tables"

# Vérifier les dépendances
npm list --depth=0
```

---

## 🎯 Prévention

### **Bonnes Pratiques**

1. **Sauvegardez régulièrement** vos collections
2. **Maintenez** une taille raisonnable par collection
3. **Sauvegardez** votre configuration
4. **Mettez à jour** régulièrement l'application

### **Maintenance**

- **Nettoyez** les tags inutilisés mensuellement
- **Optimisez** la base de données trimestriellement
- **Sauvegardez** avant les mises à jour majeures

---

**Un problème résolu est une leçon apprise ! 🎓**

_N'hésitez pas à demander de l'aide si vous êtes bloqué._
