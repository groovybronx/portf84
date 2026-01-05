Dernière mise à jour : 05/01/2026

# Composants UI & UX

L'interface repose sur une séparation stricte entre les composants de présentation ("Dumb Components") et le conteneur logique (`App.tsx`).

## Architecture Générale

```
src/features/
├── library/...
├── navigation/...
├── collection/...
├── vision/...
├── tags/...

src/shared/
    ├── components/
    │   ├── ContextMenu.tsx
    │   ├── SettingsModal.tsx   # Config (Refactored)
    │   │   ├── LanguageSelector.tsx
    │   │   ├── ShortcutEditor.tsx
    │   │   └── ThemeCustomizer.tsx
    │   ├── ui/                 # UI Kit Design System
    │       ├── Button.tsx
    │       ├── Input.tsx
    │       ├── Modal.tsx
    │       ├── GlassCard.tsx
    │       ├── overlay/        # NOUVEAU (Phase 4)
    │       │   ├── Drawer.tsx
    │       │   ├── Popover.tsx
    │       │   ├── Tooltip.tsx
    │       │   └── Dialog.tsx
    │       ├── layout/
    │       │   ├── Flex.tsx
    │       │   ├── Stack.tsx
    │       │   └── Grid.tsx
    │       └── ...
```

---

## Nouveaux Composants (Phase 4)

### 1. Overlay Components

Standardisation des interactions flottantes.

#### Drawer

Panneau latéral glissant.

- **Props**: `side` (left/right/top/bottom), `size` (sm/md/lg/full).
- **Usage**: Détails d'un dossier, Filtres avancés.

#### Popover

Contenu flottant attaché à un trigger.

- **Usage**: Menus contextuels complexes, Pickers.

#### Tooltip

Indication textuelle au survol.

- **Usage**: Explication des boutons icônes.

#### Dialog

Modal légère pour alertes et confirmations.

- **Différence avec Modal**: Plus petit, centré sur une action binaire (Confirm/Cancel).

---

## Refactoring SettingsModal (Phase 4)

Le `SettingsModal` a été découpé pour maintenance :

1.  **LanguageSelector**: Gestion du changement de langue (i18n).
2.  **ShortcutEditor**: Interface de modification des raccourcis clavier.
3.  **ThemeCustomizer**: Sélecteur de couleurs et opacité glass.

---

_(Reste du document inchangé pour les autres sections)_
