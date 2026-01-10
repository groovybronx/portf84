# FAQ (Foire Aux Questions)

## Questions Générales

### Qu'est-ce que Lumina Portfolio ?

Lumina Portfolio est une application desktop de galerie photo moderne avec des fonctionnalités d'IA pour l'organisation automatique des images. Elle combine une interface élégante avec des outils puissants de gestion de tags, de collections et d'analyse d'images.

### Quelles sont les plateformes supportées ?

- **Windows**: Windows 10/11 (64-bit)
- **macOS**: macOS 10.15+ (Intel et Apple Silicon)
- **Linux**: Ubuntu 18.04+, Debian 10+, Fedora 35+

### L'application est-elle gratuite ?

Oui, Lumina Portfolio est open source et gratuit. Cependant, certaines fonctionnalités d'IA nécessitent une clé API Google Gemini (payante selon l'utilisation).

### Puis-je utiliser mes photos existantes ?

Oui, Lumina Portfolio peut importer des photos depuis n'importe quel dossier de votre système. L'application ne déplace pas vos fichiers, elle crée simplement une base de données de références.

## Installation et Configuration

### Comment installer Lumina Portfolio ?

1. Téléchargez la version correspondant à votre plateforme depuis [GitHub Releases](https://github.com/your-repo/lumina-portfolio/releases)
2. Lancez l'installeur et suivez les instructions
3. Au premier lancement, configurez votre clé API Gemini si vous voulez utiliser les fonctionnalités d'IA

### Qu'est-ce qu'une clé API Gemini ?

C'est une clé personnelle fournie par Google pour accéder aux services d'IA Gemini. Elle est nécessaire pour l'analyse automatique des images et la génération de tags.

### Comment obtenir une clé API Gemini ?

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Create API Key"
4. Copiez la clé et collez-la dans les paramètres de Lumina Portfolio

### L'application fonctionne-t-elle sans clé API ?

Oui, toutes les fonctionnalités de base (visualisation, organisation manuelle, collections) fonctionnent sans clé API. Seules les fonctionnalités d'IA sont désactivées.

## Utilisation

### Comment importer mes photos ?

1. Cliquez sur "Importer" dans la barre latérale
2. Sélectionnez un dossier contenant des images
3. Choisissez entre "Importer les images" ou "Créer un dossier virtuel"
4. L'application analysera le dossier et ajoutera les images à votre bibliothèque

### Quelle est la différence entre Importer et Dossier Virtuel ?

- **Importer**: Copie les métadonnées en base de données, les images restent dans leur emplacement d'origine
- **Dossier Virtuel**: Crée une référence dynamique au dossier qui se synchronise automatiquement

### Comment fonctionnent les tags automatiques ?

L'IA analyse chaque image et génère des tags descriptifs basés sur le contenu. Vous pouvez ensuite modifier, fusionner ou supprimer ces tags selon vos besoins.

### Puis-je organiser mes photos en collections ?

Oui, vous pouvez créer des collections pour regrouper des photos par thème, projet ou tout autre critère. Les collections peuvent contenir des photos de différents dossiers.

### Comment fonctionne la recherche ?

Lumina Portfolio utilise une recherche floue qui trouve des résultats même avec des fautes de frappe. Vous pouvez rechercher par nom de fichier, tags, descriptions ou métadonnées.

## Performance

### Mon application est lente avec beaucoup de photos ?

Lumina Portfolio est optimisé pour gérer des milliers d'images grâce à:

- La virtualisation (seules les images visibles sont chargées)
- Le lazy loading (chargement progressif)
- Le cache intelligent
- La gestion mémoire avancée

### Combien de photos puis-je gérer ?

L'application peut théoriquement gérer des dizaines de milliers de photos. La limite pratique dépend de:

- La puissance de votre ordinateur
- L'espace disque disponible
- La quantité de mémoire RAM

### Pourquoi l'analyse IA prend-elle du temps ?

L'analyse d'images par IA nécessite du temps de traitement et des ressources réseau. De plus, Google Gemini a des limites de débit (rate limits) pour éviter la surcharge.

### Comment optimiser les performances ?

- Utilisez des dossiers virtuels pour les grandes collections
- Activez le cache dans les paramètres
- Évitez d'analyser plus de 100 images d'un coup
- Utilisez un SSD pour le stockage

## Stockage et Sauvegarde

### Où sont stockées mes données ?

Les données sont stockées localement dans une base de données SQLite:

- **Windows**: `%APPDATA%/Lumina Portfolio/`
- **macOS**: `~/Library/Application Support/Lumina Portfolio/`
- **Linux**: `~/.local/share/Lumina Portfolio/`

### Mes photos sont-elles copiées ?

Non, Lumina Portfolio ne copie pas vos fichiers images. Il stocke uniquement les métadonnées (chemins, tags, descriptions) dans sa base de données.

### Comment sauvegarder mes données ?

1. Exportez vos collections depuis les paramètres
2. Sauvegardez le dossier de données de l'application
3. Conservez vos photos dans leur emplacement d'origine

### Puis-je déplacer mes photos après les avoir importées ?

Oui, mais vous devrez réimporter les photos depuis leur nouvel emplacement ou utiliser la fonction "Mettre à jour les chemins".

## Problèmes Courants

### L'application ne démarre pas

- Vérifiez que votre système est compatible
- Réinstallez l'application
- Consultez les logs d'erreur

### Mes photos ne s'affichent pas

- Vérifiez que les fichiers existent toujours
- Actualisez la bibliothèque
- Vérifiez les permissions des dossiers

### L'analyse IA ne fonctionne pas

- Vérifiez votre clé API Gemini
- Vérifiez votre connexion internet
- Attendez quelques minutes (rate limits)

### L'application utilise trop de mémoire

- Redémarrez l'application
- Videz le cache dans les paramètres
- Utilisez la virtualisation pour les grandes collections

### Je ne peux pas supprimer une collection

Assurez-vous que la collection ne contient aucune photo. Videz d'abord la collection ou déplacez les photos vers une autre collection.

## Fonctionnalités Avancées

### Qu'est-ce que le mode cinématique ?

C'est une vue immersive qui affiche vos photos dans un carrousel 3D avec des animations fluides et des transitions cinématographiques.

### Comment fonctionnent les raccourcis clavier ?

Vous pouvez personnaliser les raccourcis dans les paramètres. Les raccourcis par défaut incluent:

- `Ctrl+O`: Ouvrir un dossier
- `Ctrl+F`: Rechercher
- `Ctrl+T`: Ajouter des tags
- `Espace`: Mode cinématique

### Qu'est-ce que la fusion de tags ?

C'est une fonction qui combine des tags similaires (ex: "chat" et "chaton") en un seul tag unifié, avec conservation des associations.

### Comment utiliser les thèmes personnalisés ?

Dans les paramètres, vous pouvez:

- Choisir entre les thèmes prédéfinis
- Personnaliser les couleurs
- Ajuster les animations
- Configurer le mode sombre/clair

## Sécurité et Confidentialité

### Mes données sont-elles envoyées sur Internet ?

Seules les images que vous choisissez d'analyser avec l'IA sont envoyées temporairement aux serveurs Google. Toutes vos autres données restent locales.

### Ma clé API est-elle sécurisée ?

Oui, la clé est stockée de manière sécurisée avec le système de stockage sécurisé de Tauri. Elle n'est jamais partagée.

### Puis-je utiliser l'application hors ligne ?

Oui, toutes les fonctionnalités de base fonctionnent hors ligne. Seule l'analyse IA nécessite une connexion internet.

### Comment supprimer toutes mes données ?

1. Exportez vos collections si nécessaire
2. Supprimez le dossier de données de l'application
3. Désinstallez l'application

## Développement et Contribution

### Puis-je contribuer au projet ?

Oui ! Le projet est open source. Vous pouvez:

- Reporter des bugs sur GitHub
- Proposer des fonctionnalités
- Contribuer au code
- Améliorer la documentation

### Comment compiler l'application depuis les sources ?

1. Clonez le dépôt GitHub
2. Installez Node.js 18+ et Rust
3. Lancez `npm install`
4. Lancez `npm run tauri:dev` pour le développement

### Quelles sont les technologies utilisées ?

- **Frontend**: React 18.3.1, TypeScript, Tailwind CSS
- **Backend**: Tauri v2 (Rust)
- **Base de données**: SQLite
- **Animations**: Framer Motion
- **Tests**: Vitest, Playwright

## Support Technique

### Comment obtenir de l'aide ?

- Consultez la [documentation complète](../README.md)
- Recherchez dans les [issues GitHub](https://github.com/your-repo/lumina-portfolio/issues)
- Créez une nouvelle issue pour les bugs
- Contactez l'équipe de développement

### Comment reporter un bug ?

1. Allez sur [GitHub Issues](https://github.com/your-repo/lumina-portfolio/issues)
2. Cliquez sur "New issue"
3. Remplissez le template avec:
   - Description du problème
   - Étapes pour reproduire
   - Configuration système
   - Logs d'erreur

### Quelles informations inclure dans un rapport de bug ?

- Version de Lumina Portfolio
- Système d'exploitation
- Quantité de RAM et espace disque
- Description détaillée du problème
- Screenshots si pertinent
- Logs de l'application

## Mises à Jour

### Comment mettre à jour l'application ?

L'application vérifie automatiquement les mises à jour au démarrage. Vous pouvez aussi vérifier manuellement dans les paramètres.

### Les mises à jour sont-elles automatiques ?

Oui, les mises à jour mineures sont téléchargées et installées automatiquement. Les mises à jour majeures nécessitent une confirmation.

### Mes données seront-elles perdues lors d'une mise à jour ?

Non, toutes vos données (collections, tags, préférences) sont préservées lors des mises à jour.

### Comment revenir à une version précédente ?

1. Sauvegardez vos données
2. Téléchargez l'ancienne version depuis GitHub Releases
3. Désinstallez la version actuelle
4. Installez l'ancienne version
5. Restaurez vos données

---

## Questions Fréquemment Posées par les Développeurs

### Comment ajouter une nouvelle source d'IA ?

Consultez la documentation [developer/ai-integration](../developer/ai-integration/gemini-service.md) pour comprendre l'architecture et ajouter un nouveau provider.

### Comment étendre le système de tags ?

Le système de tags est modulaire. Vous pouvez ajouter de nouveaux types de tags ou des plugins d'analyse en suivant les patterns dans `src/services/tags/`.

### Comment optimiser pour des millions d'images ?

Pour les très grandes collections, considérez:

- Utiliser une base de données externe (PostgreSQL)
- Implémenter le sharding horizontal
- Ajouter un CDN pour les images
- Utiliser du traitement distribué

### Comment ajouter un nouveau thème ?

Les thèmes sont définis dans `src/shared/themes/`. Vous pouvez créer un nouveau thème en suivant les patterns existants et en l'ajoutant au thème provider.

---

## Ressources Additionnelles

- [Documentation complète](../README.md)
- [Guide de démarrage rapide](../getting-started/quick-tour.md)
- [Guide développeur](../developer/setup.md)
- [API Reference](../developer/api.md)
- [GitHub Repository](https://github.com/your-repo/lumina-portfolio)
- [Issues et Discussions](https://github.com/your-repo/lumina-portfolio/issues)

---

_Cette FAQ est mise à jour régulièrement. Si vous ne trouvez pas réponse à votre question, n'hésitez pas à contacter l'équipe de développement._
