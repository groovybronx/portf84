# 🎯 First Steps - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026

---

## 📋 Vue d'Ensemble

Ce guide vous accompagne dans vos premières minutes avec Lumina Portfolio. Idéal après l'installation, il vous guidera à travers les actions essentielles pour commencer à organiser vos photos.

---

## 🎯 Objectifs

- ✅ **Importer** vos premières photos
- ✅ **Créer** votre première collection
- ✅ **Explorer** l'interface
- ✅ **Utiliser** l'IA pour taguer
- ✅ **Sauvegarder** votre travail

---

## 🚀 Étape 1 : Lancement et Découverte

### **Démarrer l'Application**

```bash
# Si vous venez de l'installer
npm run tauri:dev

# Ou si déjà installé
npm run tauri:dev
```

### **Première Vue**

L'application s'ouvre avec :

- **TopBar** : Barre supérieure avec recherche et actions
- **Sidebar** : Panneau latéral pour collections et tags
- **Main Content** : Zone principale pour les photos

---

## 📁 Étape 2 : Importer Vos Premières Photos

### **Méthode 1 : Importer un Dossier**

1. **Cliquez sur "Import Folder"** dans la sidebar
2. **Naviguez** vers un dossier de photos sur votre ordinateur
3. **Sélectionnez** le dossier et confirmez
4. **Patientez** pendant l'importation

### **Méthode 2 : Importer des Fichiers**

1. **Cliquez sur l'icône d'import** (si disponible)
2. **Sélectionnez** des fichiers spécifiques
3. **Glissez-déposez** dans la zone d'import

### **Vérification**

```
✅ Photos importées avec succès
📁 Dossier source: /Users/votre-nom/Pictures/Vacances
📸 Nombre de photos: 47
📊 Taille totale: 156.7 MB
```

---

## 🏷️ Étape 3 : Créer Votre Première Collection

### **Création de Collection**

1. **Cliquez sur "New Collection"** dans la sidebar
2. **Remplissez** le formulaire :
   - **Nom** : "Vacances 2024"
   - **Description** : "Photos de mes vacances d'été"
   - **Couleur** : Choisissez une couleur pour l'identifier
3. **Cliquez sur "Create"**

### **Lier un Dossier Source**

1. **Dans la collection**, cliquez sur "Add Source Folder"
2. **Sélectionnez** le dossier que vous venez d'importer
3. **Confirmez** l'ajout

### **Résultat**

```
📁 Vacances 2024 (🟡 Orange)
├── 📂 /Users/votre-nom/Pictures/Vacances-2024
├── 📸 Photos: 47
├── 📊 Taille: 156.7 MB
└── 📅 Dernière mise à jour: Il y a 2 minutes
```

---

## 🤖 Étape 4 : Première Analyse IA

### **Configurer l'IA (Optionnel)**

Si vous avez une clé API Gemini :

1. **Cliquez sur ⚙️ Settings** dans la TopBar
2. **Allez dans l'onglet "AI"**
3. **Entrez votre clé API Gemini**
4. **Sauvegardez** les paramètres

### **Analyser des Photos**

1. **Sélectionnez** 3-5 photos (clic simple)
2. **Cliquez sur "Analyze with AI"** dans la TopBar
3. **Patientez** pour l'analyse

### **Résultats Attendus**

```
🖼️ Photo: beach-sunset.jpg
├── 📝 Description: "Magnifique coucher de soleil sur une plage tropicale avec des vagues douces et un ciel orange vif"
├── 🏷️ Tags IA: ["coucher", "soleil", "plage", "océan", "tropique", "nature"]
├── 📊 Confiance: [95%, 92%, 88%, 78%, 85%, 82%]
└── 🎨 Color Tag: Orange (#f97316)
```

---

## 🎨 Étape 5 : Organiser avec des Tags

### **Ajouter des Tags Manuels**

1. **Sélectionnez** une photo
2. **Cliquez droit** sur la photo
3. **Choisissez "Add Tags"**
4. **Entrez** vos tags : `"vacances", "été", "famille"`
5. **Confirmez**

### **Appliquer une Couleur**

1. **Sélectionnez** plusieurs photos
2. **Cliquez sur "Apply Color Tag"**
3. **Choisissez** une couleur parmi les 6 disponibles
4. **Confirmez**

### **Résultat**

```
🖼️ Photo: family-beach.jpg
├── ✏️ Tags: ["vacances", "été", "famille"]
├── 🎨 Color Tag: Bleu (#3b82f6)
├── 🤖️ Tags IA: ["plage", "personnes", "sourire"]
└── 📊 Date: 2024-07-15
```

---

## 🔍 Étape 6 : Première Recherche

### **Recherche Simple**

1. **Cliquez** dans la barre de recherche (`Ctrl/Cmd + F`)
2. **Tapez** : `"plage"`
3. **Appuyez** sur Entrée

### **Filtrage par Tags**

1. **Cliquez** sur un tag visible sur une photo
2. **Les photos** correspondantes s'affichent
3. **Combinez** plusieurs tags pour filtrer plus précisément

### **Recherche Avancée**

1. **Utilisez** la syntaxe de recherche :
   - `"plage soleil"` : Les deux mots
   - `"plage" - "nuage"` : Contient "plage" mais pas "nuage"
   - `tag:vacances` : Seulement les photos avec ce tag

---

## 🎛️ Étape 7 : Navigation et Visualisation

### **Modes d'Affichage**

1. **Grid View** : Miniatures en grille (par défaut)
2. **Carousel View** : Navigation photo par photo
3. **List View** : Liste détaillée avec métadonnées

### **Navigation au Clavier**

- **`→`** : Photo suivante
- **`←`** : Photo précédente
- **`Space`** : Plein écran
- **`Esc`** : Fermer la vue plein écran

### **Visualisation en Carousel**

1. **Double-cliquez** sur une photo
2. **Utilisez** les flèches pour naviguer
3. **Appuyez sur Space** pour le mode cinématique

---

## 💾 Étape 8 : Sauvegarder et Exporter

### **Sauvegarde Automatique**

- ✅ **Collections** : Sauvegardées automatiquement
- ✅ **Tags** : Sauvegardés avec les photos
- ✅ **Métadonnées IA** : Conservées dans la base de données

### **Export Manuel (Optionnel)**

1. **Sélectionnez** des photos
2. **Cliquez sur "Share Selected"**
3. **Choisissez** le mode d'export :
   - **System** : Partager via le système d'exploitation
   - **Files** : Copier les fichiers
   - **Link** : Créer un lien de partage

---

## 🎯 Étape 9 : Personnalisation

### **Changer le Thème**

1. **Cliquez** sur ⚙️ Settings
2. **Allez dans l'onglet "General"**
3. **Choisissez** entre Dark/Light theme
4. **L'application** se met à jour immédiatement

### **Ajuster l'Interface**

1. **Taille des miniatures** : Petite, moyenne, grande
2. **Largeur de la sidebar** : Ajustez selon vos préférences
3. **Animations** : Activez/désactivez selon votre performance

---

## 📊 Étape 10 : Vérifier Votre Travail

### **Statistiques de Collection**

```
📁 Vacances 2024
├── 📸 Photos: 47
├── 📊 Taille: 156.7 MB
├── 🏷️ Tags: 23 uniques
├── 🎨 Couleurs: 4 utilisées
├── 🤖️ Analyse IA: 85% complète
└── 📅 Dernière activité: Il y a 5 minutes
```

### **Vérification Rapide**

- [ ] **Photos importées** avec succès
- [ ] **Collection créée** et configurée
- [ ] **Tags IA** générés pour quelques photos
- [ ] **Tags manuels** ajoutés
- [ ] **Recherche** fonctionne
- [ ] **Navigation** fluide entre les modes

---

## 🚀 Prochaines Étapes Recommandées

### **Pour Approfondir**

1. **Explorer** tous les modes d'affichage
2. **Utiliser** le Tag Hub pour gérer les tags
3. **Créer** plusieurs collections thématiques
4. **Expérimenter** avec les filtres avancés

### **Pour Maîtriser**

1. **Personnaliser** l'interface selon vos besoins
2. **Optimiser** l'analyse IA pour vos types de photos
3. **Créer** des workflows d'organisation efficaces
4. **Utiliser** les raccourcis clavier pour la productivité

---

## 🆘 Dépannage Commun

### **Photos n'apparaissent pas**

- **Vérifiez** que le dossier source est bien lié
- **Rafraîchissez** la vue avec F5
- **Vérifiez** les permissions du dossier

### **L'analyse IA ne fonctionne pas**

- **Configurez** votre clé API Gemini
- **Vérifiez** votre connexion internet
- **Consultez** les logs d'erreur

### **L'application est lente**

- **Réduisez** la taille des miniatures
- **Limitez** le nombre de photos par collection
- **Vérifiez** l'espace disque disponible

---

## 📚 Ressources Additionnelles

### **Guides Complémentaires**

- **[Guide Interface Complet](../user-guide/interface.md)** : Découvrir toutes les fonctionnalités
- **[Toutes les Fonctionnalités](../user-guide/features.md)** : Explorer les capacités avancées
- **[Raccourcis Clavier](../user-guide/keyboard-shortcuts.md)** : Maîtriser la navigation

### **Aide et Support**

- **📖 Documentation complète** : [docs/](../)
- **🐛 Signaler un problème** : [GitHub Issues](https://github.com/groovybronx/portf84/issues)
- **💬 Poser une question** : [GitHub Discussions](https://github.com/groovybronx/portf84/discussions)

---

## 🎉 Félicitations !

### **Ce que vous avez accompli**

- ✅ **Installation** réussie de Lumina Portfolio
- ✅ **Import** de vos premières photos
- ✅ **Création** de votre première collection
- ✅ **Découverte** de l'IA et des tags
- ✅ **Organisation** de vos photos avec des tags
- ✅ **Maîtrise** de l'interface de base

### **Vous êtes prêt pour**

- 🎨 **Organiser** efficacement vos photos
- 🤖 **Utiliser** l'intelligence artificielle
- 🔍 **Trouver** rapidement vos photos
- 📤 **Partager** vos collections

---

**Bienvenue dans le monde de Lumina Portfolio ! 🎉**

_Votre organisation de photos ne sera plus jamais la même !_

---

_Pour continuer : [Guide Interface](../user-guide/interface.md) → [Fonctionnalités](../user-guide/features.md)_
