# Glossaire

Ce glossaire définit les termes techniques et spécifiques utilisés dans Lumina Portfolio et sa documentation.

## A

### AI (Artificial Intelligence)

Ensemble des technologies permettant à l'application d'analyser automatiquement le contenu des images pour générer des tags et descriptions.

### AnimatePresence

Composant Framer Motion qui gère l'animation d'entrée et de sortie des éléments du DOM, permettant des transitions fluides lors de l'ajout ou de la suppression d'éléments.

### API (Application Programming Interface)

Interface permettant à différentes parties du logiciel de communiquer entre elles. Dans Lumina Portfolio, l'API Gemini permet l'analyse d'images.

### App Shell

Architecture d'application où l'interface principale est chargée une seule fois, et le contenu est mis à jour dynamiquement sans recharger toute la page.

### Asset Protocol

Protocole Tauri (`asset://`) permettant un accès optimisé aux fichiers locaux dans une application desktop.

## B

### Batch Processing

Traitement par lots d'opérations, utilisé pour analyser plusieurs images en séquence tout en respectant les limites de débit de l'API.

### Blur Effect

Effet de flou visuel utilisé dans l'interface glass morphism pour créer une sensation de profondeur et de modernité.

### Build Process

Processus de compilation du code source en application exécutable, incluant la transpilation TypeScript, le bundling frontend, et la compilation Rust.

### Bundle

Package d'installation généré par Tauri pour une plateforme spécifique (`.exe` pour Windows, `.dmg` pour macOS, `.deb` pour Linux).

## C

### Cache (Memory/Disk)

Système de stockage temporaire des données fréquemment utilisées pour accélérer les performances. Lumina Portfolio utilise un cache multi-niveaux.

### Carousel

Interface de navigation visuelle permettant de faire défiler les images horizontalement avec des animations fluides.

### Cinematic Mode

Mode d'affichage immersive qui présente les photos dans un carrousel 3D avec des transitions cinématographiques.

### Collection

Ensemble organisé de photos regroupées selon un thème, un projet ou tout autre critère défini par l'utilisateur.

### Context API

Mécanisme React permettant de partager des données entre composants sans passer par les props, utilisé pour le state management global.

### CSP (Content Security Policy)

Politique de sécurité qui définit quelles ressources externes peuvent être chargées par l'application, protégeant contre les attaques XSS.

## D

### Database Schema

Structure organisationnelle de la base de données SQLite définissant les tables, relations et contraintes pour stocker les métadonnées.

### Debounce

Technique qui retarde l'exécution d'une fonction jusqu'à ce qu'un certain temps se soit écoulé depuis le dernier appel, utilisée pour la recherche.

### Dependency Injection

Pattern de conception où les dépendances sont fournies à un composant plutôt que créées en interne, améliorant la testabilité.

### Dispatch

Dans Context API, fonction permettant de mettre à jour l'état global en envoyant des actions au reducer.

### Drag Selection

Sélection multiple d'éléments en cliquant et faisant glisser pour dessiner un rectangle de sélection.

## E

### E2E Testing (End-to-End)

Tests automatisés qui simulent des scénarios utilisateur complets pour vérifier le fonctionnement de l'application de bout en bout.

### Empty State

État affiché lorsqu'il n'y a pas de données à présenter, généralement avec un message et une action suggérée.

### Error Boundary

Composant React qui capture les erreurs dans ses composants enfants et affiche une interface de repli au lieu de crasher l'application.

### Event Handler

Fonction qui répond à des événements utilisateur (clics, clavier, souris) pour déclencher des actions dans l'interface.

### EXIF Data

Métadonnées embarquées dans les fichiers images contenant des informations sur l'appareil photo, les réglages, la date, etc.

## F

### Fade Transition

Animation de transition où un élément apparaît ou disparaît progressivement en modifiant son opacité.

### Feature-Based Architecture

Organisation du code par fonctionnalités (library, tags, collections) plutôt que par type de fichiers (components, services).

### File System Access

Capacité de l'application à lire et écrire des fichiers sur le disque dur de l'utilisateur, gérée par Tauri.

### Framer Motion

Bibliothèque d'animations pour React utilisée dans Lumina Portfolio pour créer des transitions fluides et des interactions.

### Fuse.js

Bibliothèque de recherche floue permettant de trouver des résultats même avec des fautes de frappe ou des termes similaires.

## G

### Gemini API

Service d'IA de Google utilisé pour analyser le contenu des images et générer des tags et descriptions automatiques.

### Glass Morphism

Style de design moderne utilisant des effets de flou, transparence et reflets pour créer une interface élégante et profonde.

### Git Hooks

Scripts automatiques qui s'exécutent à des moments clés du workflow Git (pre-commit, commit-msg) pour assurer la qualité du code.

### GPU Acceleration

Utilisation du processeur graphique pour accélérer les animations et le rendu visuel, réduisant la charge CPU.

## H

### Handler

Fonction qui traite des événements ou des opérations spécifiques, comme `handleDirectoryPicker` ou `handleRunBatchAI`.

### Hash Function

Fonction qui convertit des données en une valeur de taille fixe, utilisée pour générer des IDs uniques et vérifier l'intégrité.

### Hook (React)

Fonction spéciale qui permet d'utiliser des fonctionnalités React (state, effects, context) dans des composants fonctionnels.

### Hover State

État visuel d'un élément lorsque le curseur de la souris passe dessus, souvent utilisé pour fournir un feedback visuel.

## I

### ID Generation

Processus de création d'identifiants uniques pour les entités (collections, items, tags) utilisant `nanoid` ou des fonctions similaires.

### Image Analysis

Processus d'extraction d'informations sémantiques d'une image via l'IA pour générer des tags et descriptions.

### Image Virtualization

Technique qui ne charge que les images visibles à l'écran pour économiser la mémoire et améliorer les performances.

### Intersection Observer

API web permettant de détecter quand un élément entre ou sort de la vue, utilisée pour le lazy loading.

### Item (Portfolio Item)

Représentation d'une photo dans Lumina Portfolio, contenant les métadonnées, tags et informations associées.

## J

### JSX

Syntaxe extension JavaScript permettant d'écrire du code semblable à HTML dans les composants React.

## K

### Keyboard Navigation

Possibilité de naviguer dans l'interface en utilisant uniquement le clavier, essentielle pour l'accessibilité.

### Key Binding

Association entre une touche ou combinaison de touches et une action spécifique dans l'application.

## L

### Lazy Loading

Technique de chargement différé où les ressources (images, composants) ne sont chargées que lorsqu'elles deviennent visibles.

### Levenshtein Distance

Algorithme de mesure de similarité entre deux chaînes de caractères, utilisé pour détecter des tags similaires.

### Library Context

Contexte React global contenant l'état de la bibliothèque (items, collections, filtres) partagé entre tous les composants.

### Local Storage

Mémoire locale du navigateur utilisée pour stocker des préférences utilisateur et des données temporaires.

### Logging

Système d'enregistrement des événements et erreurs de l'application pour le débogage et la surveillance.

## M

### Memoization

Technique d'optimisation qui met en cache les résultats de fonctions coûteuses pour éviter de les recalculer inutilement.

### Memory Management

Ensemble des techniques pour gérer l'utilisation de la mémoire, incluant le garbage collection et la libération des ressources.

### Metadata

Informations descriptives associées aux images (dimensions, taille, date, tags, descriptions) stockées en base de données.

### Migration (Database)

Processus de mise à jour de la structure de la base de données lors des changements de version, préservant les données existantes.

### Modal

Fenêtre de dialogue superposée qui demande une action ou affiche des informations sans quitter la page actuelle.

## N

### Navigation Pattern

Structure organisationnelle des écrans et interactions permettant aux utilisateurs de se déplacer dans l'application.

### Node.js

Environnement d'exécution JavaScript utilisé pour le développement frontend et les outils de build.

## O

### Observer Pattern

Pattern de conception où des objets (observers) sont notifiés des changements d'état d'un autre objet (subject).

### Offline Mode

Mode de fonctionnement où l'application continue de fonctionner sans connexion internet, avec synchronisation ultérieure.

### Optimistic UI

Technique où l'interface met à jour immédiatement l'affichage en supposant que l'opération va réussir, puis gère les erreurs si nécessaire.

## P

### Package Manager

Outil qui gère les dépendances du projet (npm pour Node.js, Cargo pour Rust).

### Performance Budget

Limites de performance définies pour l'application (temps de chargement, utilisation mémoire, taille du bundle).

### Photo Card

Composant visuel représentant une photo dans la grille, avec vignette, tags et contrôles d'interaction.

### Pin (Sidebar/TopBar)

Action d'épingler une barre latérale ou supérieure pour la garder visible en permanence.

### Placeholder

Élément temporaire affiché pendant le chargement du contenu réel (image, texte, composant).

### Portal

Technique React pour rendre des éléments en dehors de la hiérarchie DOM parente, utilisée pour les modals et tooltips.

### Progressive Enhancement

Approche où l'application fonctionne avec des fonctionnalités de base, puis s'améliore progressivement avec des fonctionnalités avancées.

## Q

### Query Optimization

Ensemble des techniques pour améliorer la performance des requêtes base de données (index, prepared statements, caching).

## R

### Rate Limiting

Limitation du nombre de requêtes par unité de temps pour respecter les contraintes des API externes et éviter la surcharge.

### React.memo

Fonction d'optimisation qui mémorise le rendu d'un composant pour éviter les re-rendres inutiles.

### Reduced Motion

Préférence système qui demande des animations réduites ou désactivées, respectée pour l'accessibilité.

### Refactoring

Processus d'amélioration du code existant sans changer son comportement externe, pour améliorer la maintenabilité et la performance.

### Responsive Design

Approche de conception qui adapte l'interface à différentes tailles d'écran et résolutions.

### Rollback

Action de revenir à une version précédente du logiciel ou de la base de données en cas de problème.

## S

### Sandbox

Environnement d'exécution isolé qui limite les accès système pour des raisons de sécurité.

### Semantic Versioning

Système de numérotation des versions (X.Y.Z) où X=major, Y=minor, Z=patch pour indiquer le type de changements.

### Shadow Folder

Dossier virtuel qui reflète la structure d'un dossier système réel, avec synchronisation automatique des changements.

### Shortcut (Keyboard)

Combinaison de touches qui exécute rapidement une action dans l'interface.

### Spring Animation

Type d'animation physique qui simule un ressort pour créer des mouvements naturels et réactifs.

### SQLite

Base de données légère et sans serveur utilisée localement pour stocker les métadonnées de l'application.

### State Management

Ensemble des patterns et outils pour gérer l'état de l'application de manière prévisible et maintenable.

### Storage Service

Couche d'abstraction unifiée qui gère toutes les opérations de stockage (base de données, fichiers, cache).

### Staggered Animation

Animation où plusieurs éléments s'animent avec un léger décalage temporel pour créer un effet plus naturel.

## T

### Tag Hub

Interface centrale de gestion des tags permettant de naviguer, fusionner, analyser et organiser les tags.

### Tag Similarity

Mesure de ressemblance entre deux tags basée sur leur distance de Levenshtein ou d'autres algorithmes.

### Tauri

Framework pour créer des applications desktop légères avec des technologies web, combinant Rust et frontend web.

### Testing Pyramid

Stratégie de tests avec beaucoup de tests unitaires, quelques tests d'intégration et peu de tests E2E.

### Theme

Ensemble cohérent de couleurs, polices et styles définissant l'apparence visuelle de l'application.

### Toast Notification

Message temporaire non intrusif qui apparaît pour informer l'utilisateur d'un événement.

### Transaction (Database)

Ensemble d'opérations base de données exécutées comme une unité atomique (tout ou rien).

### Transition

Changement d'état visuel animé entre deux propriétés CSS ou états de composant.

### TypeScript

Surcouche de JavaScript ajoutant le typage statique pour améliorer la robustesse et la maintenabilité du code.

## U

### UI Component

Composant d'interface réutilisable (Button, Modal, Card) suivant les standards du design system.

### Unit Testing

Tests automatisés qui vérifient le fonctionnement isolé d'une petite partie du code (fonction, composant).

### Update Pattern

Stratégie de mise à jour des données dans l'interface, souvent optimiste ou pessimiste.

### User Experience (UX)

Ensemble des aspects de l'interaction entre l'utilisateur et l'application, visant à rendre l'utilisation agréable et efficace.

### User Interface (UI)

Partie visuelle de l'application avec laquelle l'utilisateur interagit (boutons, menus, champs).

## V

### Validation

Processus de vérification que les données entrées respectent les formats et contraintes attendues.

### Virtual DOM

Représentation abstraite du DOM utilisée par React pour optimiser les mises à jour de l'interface.

### Virtual Scrolling

Technique qui ne rend que les éléments visibles dans une grande liste pour améliorer les performances.

### Vitest

Framework de testing moderne pour JavaScript/TypeScript, compatible avec l'écosystème Jest.

## W

### Web Workers

Scripts JavaScript s'exécutant en arrière-plan pour des tâches intensives sans bloquer l'interface principale.

### Window Management

Gestion des fenêtres de l'application desktop (taille, position, comportement).

## Z

### Z-Index

Propriété CSS qui définit l'ordre d'empilement des éléments sur l'axe Z, important pour les overlays et modals.

---

## Acronymes Courants

| Acronyme | Définition                         | Contexte                       |
| -------- | ---------------------------------- | ------------------------------ |
| API      | Application Programming Interface  | Communication entre composants |
| CLI      | Command Line Interface             | Outils en ligne de commande    |
| CSP      | Content Security Policy            | Sécurité web                   |
| CSS      | Cascading Style Sheets             | Styles visuels                 |
| DOM      | Document Object Model              | Structure HTML                 |
| E2E      | End-to-End                         | Tests complets                 |
| EXIF     | Exchangeable Image File Format     | Métadonnées images             |
| GPU      | Graphics Processing Unit           | Accélération graphique         |
| IDE      | Integrated Development Environment | Environnement de développement |
| JSON     | JavaScript Object Notation         | Format de données              |
| JSX      | JavaScript XML                     | Syntaxe React                  |
| LRU      | Least Recently Used                | Algorithme de cache            |
| OS       | Operating System                   | Système d'exploitation         |
| RAM      | Random Access Memory               | Mémoire vive                   |
| SDK      | Software Development Kit           | Kit de développement           |
| SQL      | Structured Query Language          | Langage base de données        |
| UI       | User Interface                     | Interface utilisateur          |
| UX       | User Experience                    | Expérience utilisateur         |
| XML      | eXtensible Markup Language         | Format de données structurées  |

---

## Notes sur la Terminologie

- **Anglicismes**: Certains termes techniques sont conservés en anglais (API, UI, UX) car ils sont standards dans l'industrie.
- **Contexte**: La signification de certains termes peut varier selon le contexte (ex: "Item" dans Lumina Portfolio vs autres applications).
- **Évolution**: Ce glossaire évolue avec l'application et de nouveaux termes peuvent être ajoutés dans les futures versions.

---

_Pour plus de détails techniques, consultez la [documentation développeur](../developer/)._
