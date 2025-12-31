# Guide i18n - Lumina Portfolio

## Vue d'ensemble

Lumina Portfolio utilise **react-i18next** pour l'internationalisation, permettant de supporter plusieurs langues de manière fluide et performante.

### Langues supportées

- 🇬🇧 **English** (en) - Langue par défaut
- 🇫🇷 **Français** (fr)

---

## Architecture

### Structure des fichiers

```
src/i18n/
├── index.ts                    # Configuration i18next
├── types.ts                    # Types TypeScript
└── locales/
    ├── en/
    │   ├── common.json         # Textes communs (boutons, actions)
    │   ├── tags.json           # Système de tags
    │   ├── settings.json       # Paramètres
    │   ├── library.json        # Bibliothèque
    │   └── errors.json         # Messages d'erreur
    └── fr/
        ├── common.json
        ├── tags.json
        ├── settings.json
        ├── library.json
        └── errors.json
```

### Namespaces

Les traductions sont organisées en **namespaces** thématiques :

| Namespace | Usage | Exemples |
|-----------|-------|----------|
| `common` | Actions génériques | close, save, cancel, delete |
| `tags` | Gestion des tags | merge, smartTagFusion, kept, deleted |
| `settings` | Paramètres | general, appearance, language |
| `library` | Bibliothèque | allPhotos, collections, folders |
| `errors` | Erreurs | apiKeyMissing, databaseError |

---

## Utilisation

### Dans un composant React

```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent: React.FC = () => {
  const { t } = useTranslation(['common', 'namespace']);
  
  return (
    <div>
      <button>{t('common:save')}</button>
      <h1>{t('namespace:title')}</h1>
    </div>
  );
};
```

### Interpolation de variables

```typescript
// En JSON
{
  "welcome": "Welcome, {{name}}!",
  "itemCount": "{{count}} item",
  "itemCount_plural": "{{count}} items"
}

// En code
t('welcome', { name: 'Alice' })
// → "Welcome, Alice!"

t('itemCount', { count: 5 })
// → "5 items"
```

### Pluralization

react-i18next gère automatiquement la pluralisation :

```json
{
  "deleted": "Deleted",
  "deleted_plural": "Deleted"
}
```

```typescript
t('tags:deleted', { count: 1 })  // → "Deleted"
t('tags:deleted', { count: 5 })  // → "Deleted" (en EN, même forme)

// En français
t('tags:deleted', { count: 1 })  // → "Supprimé"
t('tags:deleted_plural', { count: 5 })  // → "Supprimés"
```

### Composant Trans (HTML dans les traductions)

```typescript
import { Trans } from 'react-i18next';

// JSON
{
  "foundGroups": "Found <0>{{count}}</0> tag groups"
}

// React
<Trans 
  i18nKey="tags:foundGroups" 
  values={{ count: groups.length }}
  components={[<span className="font-bold text-white" />]}
/>
```

---

## Changer de langue

### Programmatiquement

```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();

// Changer vers le français
i18n.changeLanguage('fr');

// Langue actuelle
const currentLang = i18n.language; // 'en' ou 'fr'
```

### Via l'interface

1. Ouvrir **Settings** (icône engrenage)
2. Aller dans l'onglet **Language**
3. Cliquer sur la langue souhaitée (🇬🇧 ou 🇫🇷)

La langue est automatiquement sauvegardée dans `localStorage` sous la clé `lumina_language`.

---

## Détection automatique

Au premier lancement, i18next détecte automatiquement la langue :

1. Vérifie `localStorage` (`lumina_language`)
2. Sinon, utilise la langue du navigateur
3. Si non supportée, utilise `en` par défaut

---

## Ajouter une nouvelle langue

### 1. Créer les fichiers de traduction

```bash
mkdir -p src/i18n/locales/de
touch src/i18n/locales/de/common.json
touch src/i18n/locales/de/tags.json
touch src/i18n/locales/de/settings.json
touch src/i18n/locales/de/library.json
touch src/i18n/locales/de/errors.json
```

### 2. Remplir les traductions

Copier les fichiers `en/` et traduire les valeurs :

```json
{
  "close": "Schließen",
  "save": "Speichern",
  "cancel": "Abbrechen"
}
```

### 3. Mettre à jour la configuration

**`src/i18n/index.ts`** :

```typescript
import commonDE from './locales/de/common.json';
import tagsDE from './locales/de/tags.json';
// ... autres imports

i18n.init({
  resources: {
    en: { /* ... */ },
    fr: { /* ... */ },
    de: {
      common: commonDE,
      tags: tagsDE,
      settings: settingsDE,
      library: libraryDE,
      errors: errorsDE,
    },
  },
  // ...
});
```

### 4. Ajouter au sélecteur de langue

**`src/shared/components/SettingsModal.tsx`** :

```typescript
{[
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' }, // ✨
].map((lang) => (
  // ...
))}
```

---

## Bonnes pratiques

### ✅ À faire

- **Utiliser des namespaces** pour organiser les traductions
- **Nommer les clés de manière descriptive** : `smartTagFusion` plutôt que `stf`
- **Grouper les clés liées** : `tag.add`, `tag.remove`, `tag.edit`
- **Tester avec plusieurs langues** pour vérifier les débordements UI
- **Utiliser la pluralization** pour les compteurs
- **Interpoler les variables** au lieu de concaténer

### ❌ À éviter

- **Hardcoder du texte** dans les composants
- **Mélanger langues et logique** : garder les traductions séparées
- **Oublier les pluriels** dans les langues qui en ont besoin
- **Laisser des clés non traduites** (affiche la clé brute)
- **Créer trop de namespaces** (complexité inutile)

---

## Composants traduits

### ✅ Complètement traduits

| Composant | Namespace(s) | Statut |
|-----------|-------------|--------|
| `TagManagerModal` | tags, common | ✅ 100% |
| `SettingsModal` (nav) | settings, common | ✅ 100% |
| Language Selector | settings | ✅ 100% |

### 🔄 Partiellement traduits

| Composant | Namespace(s) | Statut |
|-----------|-------------|--------|
| `SettingsModal` (content) | settings, common | 🔄 20% |

### ⏳ À traduire

- `TopBar`
- `FolderDrawer`
- `PhotoCard`
- `ContextMenu`
- Messages d'erreur globaux

---

## Dépannage

### La langue ne change pas

**Vérifier** :
1. La langue est bien configurée dans `i18n/index.ts`
2. Le composant utilise `useTranslation` correctement
3. La clé de traduction existe dans le namespace
4. Le build a été relancé après modification des JSON

### Les clés s'affichent au lieu des traductions

**Cause** : Clé inexistante ou namespace non chargé

**Solution** :
```typescript
// ❌ Mauvais
const { t } = useTranslation();
t('tags:merge'); // Namespace 'tags' non chargé

// ✅ Bon
const { t } = useTranslation(['tags', 'common']);
t('tags:merge');
```

### Erreur TypeScript sur les clés

**Cause** : Types non à jour après ajout de traductions

**Solution** :
```bash
# Relancer le serveur de dev
npm run tauri:dev
```

Les types sont auto-générés depuis les fichiers JSON.

---

## Ressources

- [Documentation react-i18next](https://react.i18next.com/)
- [Guide i18next](https://www.i18next.com/)
- [Pluralization rules](https://www.i18next.com/translation-function/plurals)

---

## Roadmap

### Court terme
- [ ] Migrer tous les composants UI
- [ ] Traduire les messages d'erreur
- [ ] Tests de changement de langue

### Moyen terme
- [ ] Ajouter l'espagnol (es)
- [ ] Ajouter l'allemand (de)
- [ ] Lazy loading des namespaces

### Long terme
- [ ] Support RTL (arabe, hébreu)
- [ ] Extraction automatique des clés
- [ ] Plateforme de traduction collaborative
