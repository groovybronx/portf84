# GitHub Copilot Agents pour Lumina Portfolio

Ce dossier contient des agents GitHub Copilot spécialisés pour le projet Lumina Portfolio. Chaque agent est un expert dans un domaine spécifique du projet.

## 📋 Agents Disponibles

### 1. 🏗️ Project Architecture Agent
**Fichier**: `project-architecture.md`

**Expertise**:
- Architecture globale de l'application
- Structure du projet et organisation des fichiers
- Flux de données et patterns architecturaux
- Configuration du build et workflows de développement
- Standards de qualité et meilleures pratiques

**Quand l'utiliser**: Pour des questions sur l'architecture générale, l'organisation du code, ou quand vous travaillez sur des fonctionnalités qui touchent plusieurs parties du système.

---

### 2. ⚛️ React Frontend Agent
**Fichier**: `react-frontend.md`

**Expertise**:
- Composants React et hooks
- TypeScript et typage strict
- Tailwind CSS v4 et styling
- Framer Motion et animations
- Optimisation des performances (virtualisation, lazy loading, memoization)
- State management avec Context API

**Quand l'utiliser**: Pour travailler sur l'interface utilisateur, les composants React, le styling, les animations, ou l'optimisation frontend.

---

### 3. 🦀 Tauri Rust Backend Agent
**Fichier**: `tauri-rust-backend.md`

**Expertise**:
- Rust et Tauri v2
- Opérations du système de fichiers
- Intégration SQLite via plugins Tauri
- Permissions et sécurité
- Commands Tauri et communication frontend-backend

**Quand l'utiliser**: Pour travailler sur le backend Rust, les commandes Tauri, les permissions, ou les opérations système.

---

### 4. 🗄️ SQLite Database Agent
**Fichier**: `database-sqlite.md`

**Expertise**:
- Design de schéma SQLite
- Optimisation des requêtes SQL
- Indexation et performances
- Gestion des transactions
- Intégration avec le plugin Tauri SQL

**Quand l'utiliser**: Pour travailler sur le schéma de base de données, les requêtes SQL, les migrations, ou l'optimisation des performances de la base de données.

---

### 5. 🤖 AI/Gemini Integration Agent
**Fichier**: `ai-gemini-integration.md`

**Expertise**:
- Google Gemini AI API
- Vision AI et analyse d'images
- Génération automatique de tags
- Batch processing et rate limiting
- Gestion sécurisée des API keys

**Quand l'utiliser**: Pour travailler sur les fonctionnalités AI, l'analyse d'images, la génération de tags, ou l'intégration avec l'API Gemini.

---

### 6. 🧪 Testing Agent (Vitest)
**Fichier**: `testing-vitest.md`

**Expertise**:
- Framework Vitest
- React Testing Library
- Mocking des APIs Tauri
- Tests unitaires et d'intégration
- Couverture de code

**Quand l'utiliser**: Pour écrire des tests, améliorer la couverture, ou débugger des problèmes de tests.

---

## 🚀 Comment Utiliser les Agents

### Via GitHub Copilot Chat

1. **Mentionner l'agent spécifique** dans vos questions:
   ```
   @workspace En utilisant le React Frontend Agent, comment puis-je optimiser le rendu de PhotoGrid?
   ```

2. **Pour des tâches complexes**, mentionner plusieurs agents:
   ```
   @workspace En utilisant le Database Agent et le React Frontend Agent, implémente une nouvelle fonctionnalité de filtre avancé.
   ```

3. **Référencer directement le fichier**:
   ```
   @workspace Selon .github/agents/ai-gemini-integration.md, comment gérer les rate limits?
   ```

### Conseils d'Utilisation

- **Soyez spécifique**: Plus votre question est précise, meilleure sera la réponse
- **Contexte**: Fournissez le contexte nécessaire (fichiers concernés, erreurs, objectif)
- **Agent approprié**: Choisissez l'agent qui correspond le mieux à votre tâche
- **Multi-domaines**: N'hésitez pas à mentionner plusieurs agents pour des tâches complexes

### Exemples de Questions

**Pour le React Frontend Agent**:
```
Comment implémenter un nouveau composant modal avec Tailwind CSS v4 et Framer Motion?
Quelles sont les meilleures pratiques pour optimiser un composant qui affiche 1000+ items?
```

**Pour le Tauri Rust Backend Agent**:
```
Comment créer une nouvelle commande Tauri pour lire des métadonnées EXIF?
Quelles permissions dois-je ajouter dans capabilities/ pour accéder au dossier Documents?
```

**Pour le Database Agent**:
```
Comment ajouter une nouvelle table pour stocker l'historique des modifications?
Comment optimiser cette requête SQL qui est lente avec 10000+ entrées?
```

**Pour le AI/Gemini Integration Agent**:
```
Comment implémenter un système de retry avec exponential backoff pour l'API Gemini?
Comment structurer le prompt pour obtenir des tags plus précis?
```

**Pour le Testing Agent**:
```
Comment écrire un test pour un hook qui utilise useEffect avec des dépendances async?
Comment mocker le plugin Tauri FS pour tester le chargement de fichiers?
```

**Pour le Project Architecture Agent**:
```
Quelle est la meilleure façon d'ajouter une nouvelle feature qui touche frontend et backend?
Comment organiser le code pour une nouvelle fonctionnalité de collaboration?
```

---

## 🔄 Maintenance des Agents

Les agents doivent être mis à jour quand:
- De nouvelles fonctionnalités majeures sont ajoutées
- L'architecture change significativement
- De nouveaux patterns ou best practices sont adoptés
- Les dépendances majeures sont mises à jour (React, Tauri, etc.)
- De nouvelles conventions de code sont établies

### 🔧 Script de Maintenance

Un script de maintenance automatique est disponible pour valider la configuration:

```bash
# Valider la configuration
./scripts/maintain-github-config.sh

# Mode interactif avec réparations
./scripts/maintain-github-config.sh --fix
```

Le script vérifie:
- ✅ Existence et contenu des fichiers agents
- ✅ Références dans le README
- ✅ Taille et qualité du contenu
- ✅ Cohérence avec les règles Copilot

**Documentation complète**: [`MAINTENANCE_GUIDE.md`](../MAINTENANCE_GUIDE.md)

---

## 📚 Documentation Complémentaire

Pour plus de détails techniques, consultez:
- [`/docs/guides/architecture/ARCHITECTURE.md`](../../docs/guides/architecture/ARCHITECTURE.md) - Architecture système complète
- [`/docs/guides/features/COMPONENTS.md`](../../docs/guides/features/COMPONENTS.md) - Documentation des composants UI
- [`/docs/guides/architecture/AI_SERVICE.md`](../../docs/guides/architecture/AI_SERVICE.md) - Service d'intégration AI
- [`/docs/guides/features/INTERACTIONS.md`](../../docs/guides/features/INTERACTIONS.md) - Raccourcis clavier et interactions
- [`/README.md`](../../README.md) - Vue d'ensemble du projet

---

## 💡 Contribution

Pour améliorer ou ajouter un agent:
1. Suivez le format markdown existant
2. Incluez des exemples concrets
3. Référencez la documentation pertinente
4. Testez l'agent avec des questions réelles
5. Mettez à jour ce README

---

**Créé pour optimiser le développement avec GitHub Copilot** 🚀
