# Changelog

Toutes les modifications importantes de Lumina Portfolio sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

> **Note**: Ce changelog est généré automatiquement par [Semantic Release](https://semantic-release.gitbook.io/)
> basé sur les [conventional commits](https://www.conventionalcommits.org/).
>
> Pour ajouter une entrée au changelog, faites un commit avec le format approprié :
>
> - `feat:` pour les nouvelles fonctionnalités
> - `fix:` pour les corrections de bugs
> - `docs:` pour les modifications de documentation
> - `perf:` pour les améliorations de performance
> - `refactor:` pour les refactoring

---

## [Unreleased]

### Ajouté

- Documentation complète du système d'animations avec Framer Motion
- Guide de performance avec optimisations avancées
- Documentation du service de stockage unifié
- Guide de déploiement multi-plateformes
- FAQ complète pour utilisateurs et développeurs
- Glossaire des termes techniques

### Changé

- Refactoring complet d'App.tsx (682 → 50 lignes, -92%)
- Migration des composants Button vers les standards UI
- Amélioration du système de logging avec configuration par environnement
- Optimisation de la mémoire dans les carrousels d'images

### Corrigé

- Persistance de la clé API dans le mode développement
- Affichage du TopBar au hover après désépinglage
- Erreurs TypeScript dans les composants ImageViewer

### Sécurité

- Validation des entrées dans les commandes Tauri
- Configuration CSP renforcée
- Prévention des SQL injections

---

## [0.9.0] - 2026-01-08

### Ajouté

- Phase 3 de migration des composants Button
- Système de documentation rebuilt from scratch
- Refactoring App.tsx Phase 1-3 terminé
- Correction des tests React act() warnings

### Changé

- Interface Button standardisée
- Architecture modulaire améliorée
- Performance des animations optimisée

### Corrigé

- GitHub Actions workflow configuration
- Semantic release setup
- TypeScript compilation errors

---

## [0.8.0] - 2026-01-06

### Ajouté

- Système de tags avancé avec fusion
- Interface TagHub complète
- Analyse de similarité des tags
- Batch operations pour les tags

### Changé

- Refactoring majeur de l'architecture des tags
- Amélioration de la performance de recherche

### Corrigé

- Memory leaks dans les composants de tags
- Performance issues avec les grandes collections

---

_Pour les versions antérieures, consultez l'historique des releases sur GitHub._
