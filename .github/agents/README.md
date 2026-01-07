# GitHub Copilot Agents pour Lumina Portfolio

Ce dossier contient des agents GitHub Copilot spécialisés pour le projet Lumina Portfolio. Chaque agent est un expert dans un domaine spécifique du projet.

**Total**: 21 agents spécialisés pour une productivité maximale.

## 📋 Agents Disponibles

## Agents de Domaine (6 agents)

Ces agents fournissent une expertise dans des domaines techniques spécifiques du projet.

### 1. 🏗️ Project Architecture Agent
**Fichier**: `project-architecture.agent.md`

**Expertise**:
- Architecture globale de l'application
- Structure du projet et organisation des fichiers
- Flux de données et patterns architecturaux
- Configuration du build et workflows de développement
- Standards de qualité et meilleures pratiques

**Quand l'utiliser**: Pour des questions sur l'architecture générale, l'organisation du code, ou quand vous travaillez sur des fonctionnalités qui touchent plusieurs parties du système.

---

### 2. ⚛️ React Frontend Agent
**Fichier**: `react-frontend.agent.md`

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
**Fichier**: `tauri-rust-backend.agent.md`

**Expertise**:
- Rust et Tauri v2
- Opérations du système de fichiers
- Intégration SQLite via plugins Tauri
- Permissions et sécurité
- Commands Tauri et communication frontend-backend

**Quand l'utiliser**: Pour travailler sur le backend Rust, les commandes Tauri, les permissions, ou les opérations système.

---

### 4. 🗄️ SQLite Database Agent
**Fichier**: `database-sqlite.agent.md`

**Expertise**:
- Design de schéma SQLite
- Optimisation des requêtes SQL
- Indexation et performances
- Gestion des transactions
- Intégration avec le plugin Tauri SQL

**Quand l'utiliser**: Pour travailler sur le schéma de base de données, les requêtes SQL, les migrations, ou l'optimisation des performances de la base de données.

---

### 5. 🤖 AI/Gemini Integration Agent
**Fichier**: `ai-gemini-integration.agent.md`

**Expertise**:
- Google Gemini AI API
- Vision AI et analyse d'images
- Génération automatique de tags
- Batch processing et rate limiting
- Gestion sécurisée des API keys

**Quand l'utiliser**: Pour travailler sur les fonctionnalités AI, l'analyse d'images, la génération de tags, ou l'intégration avec l'API Gemini.

---

### 6. 🧪 Testing Agent (Vitest)
**Fichier**: `testing-vitest.agent.md`

**Expertise**:
- Framework Vitest
- React Testing Library
- Mocking des APIs Tauri
- Tests unitaires et d'intégration
- Couverture de code

**Quand l'utiliser**: Pour écrire des tests, améliorer la couverture, ou débugger des problèmes de tests.

---

## Agents de Qualité & Nettoyage (4 agents)

Ces agents assurent la qualité du code et automatisent le nettoyage.

### 7. 🔍 Code Quality Auditor Agent
**Fichier**: `code-quality-auditor.agent.md`

**Expertise**:
- Détection de code smells et anti-patterns
- Analyse de complexité cyclomatique
- Détection de code dupliqué
- Validation des conventions de nommage
- Évaluation de la dette technique
- Métriques de maintenabilité du code

**Quand l'utiliser**: Pour auditer la qualité du code, identifier les problèmes de maintenabilité, ou évaluer la dette technique.

---

### 8. 🧹 Code Cleaner Agent
**Fichier**: `code-cleaner.agent.md`

**Expertise**:
- Élimination du code mort
- Optimisation des imports
- Nettoyage des console.log
- Formatage et cohérence du style
- Suppression des variables inutilisées
- Refactoring automatique

**Quand l'utiliser**: Pour nettoyer le code automatiquement, optimiser les imports, ou standardiser le formatage.

---

### 9. 🔒 Security Auditor Agent
**Fichier**: `security-auditor.agent.md`

**Expertise**:
- Détection de vulnérabilités OWASP Top 10
- Gestion des secrets et API keys
- Prévention d'injection SQL et XSS
- Sécurité du système de fichiers Tauri
- Audit des permissions
- Validation des entrées utilisateur

**Quand l'utiliser**: Pour auditer la sécurité, détecter des secrets hardcodés, ou vérifier les vulnérabilités.

---

### 10. ⚡ Performance Optimizer Agent
**Fichier**: `performance-optimizer.agent.md`

**Expertise**:
- Optimisation du rendu React
- Virtual scrolling et windowing
- Optimisation de la taille des bundles
- Lazy loading d'images
- Optimisation des requêtes base de données
- Détection de fuites mémoire

**Quand l'utiliser**: Pour optimiser les performances, réduire la taille des bundles, ou résoudre des problèmes de performance.

---

## Agents de Tests & Bugs (2 agents)

Ces agents améliorent la couverture de tests et détectent les bugs.

### 11. 📊 Test Coverage Improver Agent
**Fichier**: `test-coverage-improver.agent.md`

**Expertise**:
- Analyse de couverture de code
- Génération automatique de tests
- Tests unitaires et d'intégration
- Stratégies de mocking
- Test-Driven Development (TDD)
- Identification de code non testé

**Quand l'utiliser**: Pour améliorer la couverture de tests, générer des tests manquants, ou analyser les zones non testées.

---

### 12. 🐛 Bug Hunter Agent
**Fichier**: `bug-hunter.agent.md`

**Expertise**:
- Analyse statique de code
- Détection de patterns de bugs
- Détection de race conditions
- Identification de fuites mémoire
- Analyse de cas limites
- Détection d'erreurs logiques

**Quand l'utiliser**: Pour trouver des bugs potentiels, analyser les erreurs, ou détecter les problèmes avant qu'ils n'atteignent la production.

---

## Agents de Documentation & Migration (3 agents)

Ces agents gèrent la documentation et les migrations de versions.

### 13. 📚 Documentation Generator Agent
**Fichier**: `documentation-generator.agent.md`

**Expertise**:
- Génération de JSDoc/TSDoc
- Documentation des composants React
- Documentation d'API et services
- Génération de guides utilisateur
- Mise à jour de README et CHANGELOG
- Documentation d'architecture

**Quand l'utiliser**: Pour générer de la documentation, documenter de nouvelles fonctionnalités, ou mettre à jour la documentation existante.

---

### 14. 🤖 Documentation RAG Agent
**Fichier**: `documentation-rag-agent.agent.md`

**Expertise**:
- Recherche intelligente dans la documentation via RAG
- Synthèse contextuelle multi-documents
- Citations précises avec chemins de fichiers
- Suggestions proactives de documentation liée
- Détection de lacunes documentaires
- Recherche hybride lexicale et sémantique

**Quand l'utiliser**: Pour rechercher dans la documentation du projet, trouver des informations architecturales, consulter des décisions passées, ou identifier des conventions établies.

**Commandes spéciales**:
```bash
@documentation-rag-agent Comment fonctionne X ?
@documentation-rag-agent search:"terme" in:guides/features
@documentation-rag-agent related:"docs/path/file.md"
@documentation-rag-agent stats
```

---

### 15. 🔄 Migration Assistant Agent
**Fichier**: `migration-assistant.agent.md`

**Expertise**:
- Migrations de versions de dépendances
- Gestion des breaking changes
- Gestion des dépréciations
- Migrations de schéma de base de données
- Création de codemods
- Maintien de la rétrocompatibilité

**Quand l'utiliser**: Pour migrer vers de nouvelles versions de React, Tauri, ou autres dépendances majeures.

---

## Agents d'Analyse & Gestion (3 agents)

Ces agents fournissent des insights et gèrent des aspects spécifiques du projet.

### 16. 📈 Metrics Analyzer Agent
**Fichier**: `metrics-analyzer.agent.md`

**Expertise**:
- Analyse de métriques de code
- Indicateurs de santé du projet
- Tracking de performances
- Analyse de vélocité de développement
- Mesure de la dette technique
- Analyse de tendances qualité

**Quand l'utiliser**: Pour générer des rapports de santé du projet, analyser les métriques, ou suivre les tendances.

---

### 17. 🌐 i18n Manager Agent
**Fichier**: `i18n-manager.agent.md`

**Expertise**:
- Gestion de i18next et react-i18next
- Gestion des clés de traduction
- Synchronisation des fichiers de langue
- Détection de traductions manquantes
- Pluralisation et formatage
- Support RTL (Right-to-Left)

**Quand l'utiliser**: Pour gérer les traductions, synchroniser les langues, ou ajouter de nouvelles clés de traduction.

---

### 18. 📦 Dependency Manager Agent
**Fichier**: `dependency-manager.agent.md`

**Expertise**:
- Gestion des packages npm et Cargo
- Versioning sémantique (semver)
- Analyse de vulnérabilités
- Stratégie de mise à jour
- Conformité des licences
- Optimisation de l'arbre de dépendances

**Quand l'utiliser**: Pour gérer les dépendances, mettre à jour les packages, ou vérifier les vulnérabilités.

---

## Agents de Coordination & Résolution (3 agents)

Ces agents coordonnent le workflow et résolvent les problèmes complexes.

### 19. 🔀 PR Resolver Agent
**Fichier**: `pr-resolver.agent.md`

**Expertise**:
- Analyse automatique de PR
- Code review automatisé
- Résolution de conflits de merge
- Gestion de workflow Git
- Validation pré-merge
- Gestion de branches

**Quand l'utiliser**: Pour analyser des PRs, résoudre des conflits de merge, ou effectuer des code reviews automatisées.

---

### 20. 📋 Refactoring Tracker Agent
**Fichier**: `refactoring-tracker.agent.md`

**Expertise**:
- Suivi de plans de refactoring multi-phases
- Gestion de l'implémentation par phases
- Monitoring de progrès
- Gestion des dépendances de tâches
- Évaluation des risques
- Planification de rollback

**Quand l'utiliser**: Pour planifier et suivre des refactorings importants, gérer des implémentations multi-phases.

---

### 21. 🎭 Meta Orchestrator Agent
**Fichier**: `meta-orchestrator.agent.md`

**Expertise**:
- Coordination de tous les agents
- Décomposition de tâches complexes
- Gestion de workflow multi-agents
- Prise de décision et priorisation
- Validation de qualité
- Optimisation de ressources

**Quand l'utiliser**: Pour coordonner des tâches complexes nécessitant plusieurs agents, ou pour orchestrer des workflows complets.

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
   @workspace Selon .github/agents/ai-gemini-integration.agent.md, comment gérer les rate limits?
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

**Pour le Documentation RAG Agent**:
```
Comment fonctionne le système de tags dans l'application?
Quelle est l'architecture complète de l'intégration Gemini AI?
Recherche toutes les décisions architecturales concernant SQLite
Y a-t-il de la documentation sur le système de collections?
```

**Pour le Project Architecture Agent**:
```
Quelle est la meilleure façon d'ajouter une nouvelle feature qui touche frontend et backend?
Comment organiser le code pour une nouvelle fonctionnalité de collaboration?
```

**Pour le Code Quality Auditor Agent**:
```
Effectue un audit de qualité complet du code
Trouve les fonctions avec une complexité cyclomatique élevée
```

**Pour le Security Auditor Agent**:
```
Scanne pour des secrets hardcodés dans le code
Vérifie les vulnérabilités dans les requêtes SQL
```

**Pour le Performance Optimizer Agent**:
```
Optimise le rendu du PhotoGrid
Analyse la taille des bundles et suggère des optimisations
```

**Pour le Meta Orchestrator Agent**:
```
Améliore la qualité globale du code (coordonne audit, nettoyage, tests)
Prépare le code pour la release (audit complet, tests, documentation)
```

---

## 🔗 Intégrations Entre Agents

Les agents sont conçus pour travailler ensemble de manière coordonnée:

### Workflow Qualité Complète
```
Meta Orchestrator
  ├─> Code Quality Auditor (audit)
  ├─> Security Auditor (sécurité)
  ├─> Bug Hunter (détection bugs)
  ├─> Code Cleaner (nettoyage)
  └─> Test Coverage Improver (tests)
```

### Workflow Développement de Feature
```
Meta Orchestrator
  ├─> Documentation RAG Agent (recherche similaires)
  ├─> Project Architecture (design)
  ├─> React Frontend / Tauri Backend (implémentation)
  ├─> Testing Agent (tests)
  ├─> Documentation Generator (docs)
  └─> PR Resolver (review)
```

### Workflow Refactoring
```
Refactoring Tracker (plan)
  ├─> Documentation RAG Agent (contexte historique)
  ├─> Test Coverage Improver (tests de sécurité)
  ├─> React/Tauri Agents (refactoring)
  ├─> Performance Optimizer (validation)
  └─> Documentation Generator (mise à jour docs)
```

### Workflow Recherche Documentation
```
Meta Orchestrator
  ├─> Documentation RAG Agent (recherche et synthèse)
  ├─> Documentation Generator (mise à jour si lacunes)
  └─> Code Quality Auditor (vérification conformité)
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

---

## Changelog

### 2026-01-07 - Ajout de l'Agent RAG de Documentation
- **Ajouté**: Documentation RAG Agent dans la section Documentation & Migration
- **Mis à jour**: Total d'agents de 20 à 21
- **Ajouté**: Exemples d'usage pour le RAG Agent
- **Ajouté**: Commandes spéciales du RAG Agent
- **Mis à jour**: Workflows pour inclure l'agent RAG
- **Ajouté**: Workflow de recherche documentation
- **Renumerotation**: Tous les agents suivants (16-21) pour cohérence
