# Guide de Contribution UI

Ce guide explique comment utiliser et étendre le Design System de Lumina Portfolio.

## Philosophie

1.  **Composition plutôt qu'Héritage** : Utilisez `Stack`, `Flex`, `Grid` pour composer vos layouts.
2.  **Glassmorphism Standardisé** : Utilisez toujours `GlassCard` au lieu de réécrire les classes CSS backdrop/bg.
3.  **Accessibilité par Défaut** : Tous les composants interactifs doivent être navigables au clavier et avoir des labels ARIA.

## Créer un Nouveau Composant

### 1. Structure

Placer le composant dans `src/shared/components/ui/[category]/`.

```tsx
import React from 'react';
import { GlassCard } from '../GlassCard';

interface MyComponentProps {
  children: React.ReactNode;
}

export const MyComponent: React.FC<MyComponentProps> = ({ children }) => {
  return <GlassCard variant="card">{children}</GlassCard>;
};
```

### 2. Styles

Utilisez les classes utilitaires Tailwind définies dans `index.css` via les composants primitifs.
Evitez les styles inline arbitraires (`w-[123px]`).

### 3. Export

Ajouter l'export dans `src/shared/components/ui/index.ts`.

## Checklist de validation UI

Avant de soumettre une PR UI :

- [ ] Le composant utilise-t-il `GlassCard` pour les surfaces transparentes ?
- [ ] Le composant est-il responsive ?
- [ ] Les textes sont-ils traduisibles (i18next) ?
- [ ] Le composant a-t-il des `aria-label` si nécessaire ?
- [ ] Avez-vous utilisé les icônes du registre `Icon` ?

## Règles spécifiques

### Boutons

N'utilisez JAMAIS `<button>` HTML natif. Utilisez `<Button>`.

### Icônes

N'importez JAMAIS `lucide-react` directement dans les features. Utilisez `<Icon action="..." />`.

### Couleurs

Utilisez les variables CSS `--color-primary`, `--color-secondary`, etc. via les classes Tailwind correspondantes (`text-primary`, `bg-secondary`).
