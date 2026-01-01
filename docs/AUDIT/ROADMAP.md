# 🗺️ Roadmap UI/UX - Lumina Portfolio

**Date de Création**: 1er janvier 2026  
**Statut Actuel**: Phase 3 (70% complète)  
**Version**: 1.0

---

## 📊 Vue d'Ensemble

```
╔═══════════════════════════════════════════════════════════╗
║  PROGRESSION GLOBALE: 85% COMPLET                        ║
║  ─────────────────────────────────────────────────────   ║
║                                                           ║
║  Phase 1: Fondations           ████████████ 100%  ✅    ║
║  Phase 2: Layout & Primitives  ████████████ 100%  ✅    ║
║  Phase 3: Migration            ████████▓▓▓▓  70%  🔄    ║
║  Phase 4: Optimisation         ▓▓▓▓▓▓▓▓▓▓▓▓   0%  📋    ║
║                                                           ║
║  Temps Estimé Restant: 2 semaines                        ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🎯 Objectifs Principaux

### Court Terme (Semaine 1)
✅ Compléter Phase 3 - Migration Progressive

### Moyen Terme (Semaine 2)  
📋 Phase 4 - Optimisation et Polish

### Long Terme (Mois 2-3)
💡 Améliorations Continues et Évolution

---

## 📅 Phase 3: Complétion de la Migration (EN COURS)

**Durée**: 2-3 jours  
**Priorité**: 🔥 HAUTE  
**Statut**: 70% complète

### Objectif
Terminer la migration des composants existants vers les nouveaux standards du design system.

### Tâches Restantes

#### 3.1 Migration Buttons Restants (4-6h)

**Fichiers à Migrer** (14 fichiers):

1. **SettingsModal.tsx** (2-3h)
   - 12 buttons à migrer
   - Variantes: `ghost`, `close`, `primary`
   - Focus: Accessibilité (ARIA labels)

2. **Shared Components** (1-2h)
   - [ ] ErrorFallback.tsx (1 button)
   - [ ] UnifiedProgress.tsx (1 button)
   - [ ] ContextMenu.tsx (1-2 buttons)

3. **UI Components** (1h)
   - [ ] Modal.tsx (boutons de fermeture)
   - [ ] ColorPicker.tsx (form)
   - [ ] IconPicker.tsx (form)
   - [ ] Tabs.tsx (navigation)

4. **Features** (1h)
   - [ ] TagStudioOverlay.tsx
   - [ ] TagMergeHistory.tsx
   - [ ] FolderDrawer/index.tsx
   - [ ] ColorPicker.tsx (topbar)

**Pattern de Migration**:
```tsx
// ❌ AVANT
<button className="p-2 hover:bg-white/5 rounded-full">
  <Icon action="close" />
</button>

// ✅ APRÈS
<Button variant="close" size="icon" aria-label="Close">
  <Icon action="close" />
</Button>
```

**Validation**:
- ✅ Tests visuels (chaque composant)
- ✅ Accessibilité (screen readers)
- ✅ Navigation clavier
- ✅ Responsive design

---

#### 3.2 Migration Glass Styles (2-3h)

**Fichiers Prioritaires** (5 fichiers pour atteindre objectif):

1. **TopBar.tsx** (1h)
   - Remplacer background glass par GlassCard
   - Maintenir z-index et positioning

2. **Carousels** (1h)
   - [ ] CinematicCarousel.tsx (45min)
   - [ ] PhotoCarousel.tsx (45min)
   - Contrôles de navigation en GlassCard

3. **Library Components** (30-45min)
   - [ ] PhotoList.tsx
   - [ ] BatchActions.tsx

**Pattern de Migration**:
```tsx
// ❌ AVANT
<div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-xl p-4">
  {content}
</div>

// ✅ APRÈS
<GlassCard variant="card" padding="md">
  {content}
</GlassCard>
```

---

#### 3.3 Migration Layouts (2-3 jours)

**Objectif**: Commencer l'adoption des composants layout (Stack, Flex, Grid, Container)

**Approche Progressive**:

**Jour 1**: Identification et Documentation (4h)
- [ ] Analyser top 10 fichiers avec patterns répétitifs
- [ ] Documenter patterns Avant/Après
- [ ] Créer guide de migration layouts

**Jour 2-3**: Migration Pilote (1-2 jours)
- [ ] Migrer 3 composants navigation (TopBar, SearchField, ViewToggle)
- [ ] Migrer 2 composants collections (FolderDrawer, CollectionManager)
- [ ] Valider visuellement (aucune régression)
- [ ] Documenter patterns réutilisables

**Patterns Identifiés**:
```tsx
// Pattern 1: Flex Center
// ❌ AVANT: <div className="flex items-center gap-2">
// ✅ APRÈS: <Flex align="center" gap="sm">

// Pattern 2: Vertical Stack
// ❌ AVANT: <div className="flex flex-col gap-4">
// ✅ APRÈS: <Stack spacing="md">

// Pattern 3: Responsive Grid
// ❌ AVANT: <div className="grid grid-cols-3 gap-4">
// ✅ APRÈS: <Grid cols={3} gap="md">
```

**Fichiers Prioritaires** (10 premiers):
1. SearchField.tsx
2. TopBar.tsx
3. ViewToggle.tsx
4. FolderDrawerHeader.tsx
5. CollectionManager.tsx
6. SmartCollectionBuilder.tsx
7. TagManager.tsx
8. PhotoCard/PhotoCardInfo.tsx
9. BatchActions.tsx
10. SortControls.tsx

**Validation Phase 3**:
- ✅ 30 buttons migrés (objectif <30 ✅)
- ✅ 15 fichiers glass migrés (objectif <15 ✅)
- ✅ 10 fichiers layouts migrés (nouveaux composants adoptés)
- ✅ Build sans erreurs
- ✅ Tests passants (111/111)
- ✅ Aucune régression visuelle

---

## 📋 Phase 4: Optimisation et Polish (2 semaines)

**Durée**: 1-2 semaines  
**Priorité**: 🔶 MOYENNE  
**Statut**: Non démarrée (0%)

### Objectif
Finaliser la consolidation UI avec optimisations avancées et composants overlay.

### Semaine 1: Optimisations Core (5 jours)

#### 4.1 Optimisation SettingsModal (2 jours)

**Objectif**: Réduire de 629 → ~400 lignes (-200 lignes)

**Jour 1**: Extraction Composants (4-6h)
- [ ] Extraire `LanguageSelector` (30 lignes)
- [ ] Extraire `ShortcutEditor` (80 lignes)
- [ ] Extraire `ThemeCustomizer` (60 lignes)
- [ ] Créer `src/features/settings/components/`

**Jour 2**: Refactoring et Tests (4-6h)
- [ ] Simplifier state management (useReducer?)
- [ ] Diviser en sous-sections (tabs séparés)
- [ ] Tests unitaires pour nouveaux composants
- [ ] Validation visuelle complète

**Impact Attendu**:
```
SettingsModal: 629 → ~400 lignes (-36%)
+ 3 nouveaux composants réutilisables
+ Tests coverage améliorée
```

---

#### 4.2 Composants Overlay Manquants (2 jours)

**Composants à Créer**:

**Jour 1**: Drawer & Popover (6-8h)

1. **Drawer Component** (3-4h)
   ```tsx
   // src/shared/components/ui/overlays/Drawer.tsx
   <Drawer 
     isOpen={isOpen} 
     onClose={onClose}
     side="left" | "right" | "top" | "bottom"
     size="sm" | "md" | "lg" | "full"
   >
     {content}
   </Drawer>
   ```
   - Animations slide-in/out
   - Overlay backdrop
   - Mobile responsive
   - Accessibilité (focus trap)

2. **Popover Component** (3-4h)
   ```tsx
   // src/shared/components/ui/overlays/Popover.tsx
   <Popover 
     trigger={<Button>Open</Button>}
     placement="top" | "bottom" | "left" | "right"
     offset={8}
   >
     {content}
   </Popover>
   ```
   - Positioning auto (Popper.js?)
   - Click outside to close
   - Arrow pointer optionnel

**Jour 2**: Tooltip & Dialog (6-8h)

3. **Tooltip Component** (2-3h)
   ```tsx
   // src/shared/components/ui/overlays/Tooltip.tsx
   <Tooltip content="Helper text" placement="top">
     <Button>Hover me</Button>
   </Tooltip>
   ```
   - Delay configurable
   - Keyboard accessible
   - Touch device support

4. **Dialog Component** (4-5h)
   ```tsx
   // src/shared/components/ui/overlays/Dialog.tsx
   <Dialog 
     isOpen={isOpen}
     onClose={onClose}
     variant="alert" | "confirm" | "custom"
     actions={[{label, onClick, variant}]}
   >
     {content}
   </Dialog>
   ```
   - Alert/Confirm patterns
   - Focus management
   - Escape to close

**Tests & Documentation**:
- [ ] Tests unitaires (interactions)
- [ ] Tests accessibilité
- [ ] Exemples dans DESIGN_SYSTEM.md
- [ ] Storybook stories (optionnel)

---

#### 4.3 Audit Final et Documentation (1 jour)

**Matin (4h)**: Audit Code
- [ ] Review complet codebase UI
- [ ] Vérifier cohérence design system
- [ ] Identifier opportunités d'amélioration
- [ ] Mesurer métriques finales

**Après-midi (4h)**: Documentation
- [ ] Mettre à jour DESIGN_SYSTEM.md
- [ ] Compléter COMPONENTS.md
- [ ] Créer guide de contribution UI
- [ ] Screenshots et exemples visuels

**Livrables**:
- ✅ Audit report final
- ✅ Documentation à jour
- ✅ Guide de contribution
- ✅ Métriques de succès validées

---

### Semaine 2: Polish et Extras (Optionnel)

#### 4.4 Setup Storybook (Optionnel - 3-5 jours)

**Bénéfices**:
- ✅ Catalogue visuel interactif
- ✅ Documentation vivante
- ✅ Tests visuels automatisés
- ✅ Design tokens preview
- ✅ Onboarding facilité

**Planning**:

**Jour 1**: Setup Initial (6-8h)
- [ ] Installation Storybook 8
- [ ] Configuration Vite
- [ ] Setup design tokens
- [ ] Thème Storybook (dark mode)

**Jour 2-3**: Stories Primitives (2 jours)
- [ ] Button stories (toutes variantes)
- [ ] Input stories
- [ ] Badge, Avatar, Divider
- [ ] GlassCard stories

**Jour 4**: Stories Layout & Surfaces (1 jour)
- [ ] Stack, Flex, Grid, Container
- [ ] Panel, Card
- [ ] Modal, Drawer

**Jour 5**: Polish & Deploy (1 jour)
- [ ] Addon a11y (accessibilité)
- [ ] Addon viewport (responsive)
- [ ] Deploy Storybook (GitHub Pages?)
- [ ] Documentation usage

---

## 💡 Améliorations Futures (Mois 2-3)

### Priorité BASSE - Optimisations Continues

#### Console Statements Cleanup (2-4h)
**Référence**: COMPREHENSIVE_AUDIT_REPORT.md

- [ ] Créer utility logger
  ```typescript
  // src/shared/utils/logger.ts
  export const logger = {
    info: (msg: string, ...args: any[]) => {
      if (import.meta.env.DEV) {
        console.log(`[Lumina] ${msg}`, ...args);
      }
    },
    error: (msg: string, ...args: any[]) => {
      console.error(`[Lumina] ${msg}`, ...args);
    },
  };
  ```
- [ ] Migrer 139 console.log progressivement
- [ ] Configuration niveaux de log (dev/prod)

---

#### Animation System (1 semaine)

**Objectif**: Centraliser et harmoniser les animations

- [ ] Créer `animation.ts` avec presets
  ```typescript
  export const animations = {
    fadeIn: { opacity: [0, 1] },
    slideUp: { y: [20, 0], opacity: [0, 1] },
    scaleIn: { scale: [0.95, 1], opacity: [0, 1] },
  };
  ```
- [ ] Standardiser durées et easings
- [ ] Documenter dans DESIGN_SYSTEM.md
- [ ] Appliquer aux nouveaux composants

---

#### Responsive Optimization (3-5 jours)

**Objectif**: Améliorer l'expérience mobile/tablet

- [ ] Audit responsive sur tous les écrans
- [ ] Créer composants mobile-first
- [ ] Touch gestures (swipe, pinch)
- [ ] Responsive typography scale
- [ ] Tests sur devices réels

---

#### Accessibilité Audit (1 semaine)

**Référence**: COMPREHENSIVE_AUDIT_REPORT.md (Score: 5/10)

**Jour 1-2**: ARIA et Labels
- [ ] Ajouter ARIA labels manquants
- [ ] Ajouter alt text images
- [ ] Roles ARIA appropriés

**Jour 3-4**: Navigation Clavier
- [ ] Vérifier tab order
- [ ] Focus visible sur tous éléments
- [ ] Escape to close modals

**Jour 5**: Tests et Validation
- [ ] Tests avec screen readers
- [ ] Lighthouse accessibility score
- [ ] WCAG AA compliance
- [ ] Documentation accessibilité

---

#### Performance Monitoring (2-3 jours)

- [ ] Setup Web Vitals tracking
- [ ] Monitor bundle size
- [ ] Component render performance
- [ ] Memory leak detection
- [ ] Optimisation images lazy load

---

## 📊 Métriques de Succès

### Objectifs Phase 3 (Complète)
| Métrique | État Initial | Cible | Actuel | Final (Estimé) |
|----------|--------------|-------|--------|----------------|
| Buttons HTML | 93 | <30 | 45 | **<30** ✅ |
| Fichiers glass | 51 | <15 | ~20 | **<15** ✅ |
| Layouts migrated | 0 | 10+ | 0 | **10+** ✅ |

### Objectifs Phase 4 (À Faire)
| Métrique | Cible Phase 4 |
|----------|---------------|
| SettingsModal lignes | ~400 (-36%) |
| Composants overlay | 4 nouveaux |
| Documentation complète | 100% |
| Storybook stories | 20+ (optionnel) |

### Objectifs Globaux (Final)
| Métrique | Initial | Final Estimé | Amélioration |
|----------|---------|--------------|--------------|
| Composants UI | 9 | **22** | +144% 🎉 |
| Design tokens | 11 | **63** | +473% 🎉 |
| Code duplication | - | **-40%** | 📉 |
| Dev velocity | - | **+30%** | 📈 |

---

## 🗓️ Timeline Détaillée

### Semaine 1 (1-7 janvier 2026)
```
Lundi 1:    [✅ Audit Complet] [✅ Cleanup Code]
Mardi 2:    [🔄 Phase 3.1: Buttons (4h)] [🔄 Phase 3.2: Glass (2h)]
Mercredi 3: [🔄 Phase 3.3: Layouts Jour 1 (4h)]
Jeudi 4:    [🔄 Phase 3.3: Layouts Jour 2 (8h)]
Vendredi 5: [🔄 Phase 3.3: Layouts Jour 3 (8h)] [✅ Phase 3 Complète]
```

### Semaine 2 (8-14 janvier 2026)
```
Lundi 8:    [📋 Phase 4.1: SettingsModal Jour 1 (6h)]
Mardi 9:    [📋 Phase 4.1: SettingsModal Jour 2 (6h)]
Mercredi 10: [📋 Phase 4.2: Drawer & Popover (8h)]
Jeudi 11:   [📋 Phase 4.2: Tooltip & Dialog (8h)]
Vendredi 12: [📋 Phase 4.3: Audit Final (8h)] [🎉 Phase 4 Complète]
```

### Semaine 3-4 (Optionnel - Storybook)
```
15-19 janvier: Setup Storybook + Stories Core
22-26 janvier: Stories restants + Deploy
```

---

## ✅ Checklist de Validation

### Phase 3 Complète
- [ ] 30 buttons total migrés (objectif atteint)
- [ ] 15 fichiers glass total migrés (objectif atteint)
- [ ] 10 fichiers layouts migrés (adoption démarrée)
- [ ] Build: ✅ Success
- [ ] Tests: ✅ 111/111 pass
- [ ] Régression visuelle: ✅ Aucune
- [ ] Documentation: ✅ À jour

### Phase 4 Complète
- [ ] SettingsModal < 400 lignes
- [ ] 4 composants overlay créés
- [ ] Documentation complète 100%
- [ ] Audit final passé
- [ ] Métriques validées

### Livraison Finale
- [ ] Codebase 100% conforme design system
- [ ] Tous composants documentés
- [ ] Tests coverage > 80%
- [ ] Accessibilité WCAG AA
- [ ] Performance optimale
- [ ] Équipe formée

---

## 🎯 Prochaines Actions Immédiates

### Cette Semaine (Priorité HAUTE)

#### 🔥 Action 1: Compléter Migration Buttons (Mardi)
```bash
# Fichiers à traiter
- SettingsModal.tsx (12 buttons)
- ErrorFallback.tsx (1 button)
- UnifiedProgress.tsx (1 button)
- ContextMenu.tsx (1-2 buttons)
```

#### 🔥 Action 2: Compléter Migration Glass (Mardi PM)
```bash
# Fichiers prioritaires
- TopBar.tsx
- CinematicCarousel.tsx
- PhotoCarousel.tsx
```

#### 🔥 Action 3: Démarrer Migration Layouts (Mercredi-Vendredi)
```bash
# Approche progressive
Jour 1: Analyse et documentation
Jour 2-3: Migration 5 composants pilotes
```

---

## 📞 Support et Questions

### Pour Questions Techniques
- 📄 Voir [DESIGN_SYSTEM.md](../features/DESIGN_SYSTEM.md)
- 📄 Voir [UI_SIMPLIFICATION_VERIFICATION_REPORT.md](./UI_SIMPLIFICATION_VERIFICATION_REPORT.md)

### Pour Suivi de Progression
- 📄 Ce document (ROADMAP.md)
- 📄 Voir [UI_AUDIT_SUMMARY.md](./UI_AUDIT_SUMMARY.md)

---

## 🎉 Conclusion

Cette roadmap établit un plan clair pour compléter l'audit UI simplification à 100% en **2 semaines**, avec une approche progressive et validée.

**Bénéfices Attendus**:
- ✅ Design system complet et mature
- ✅ Codebase moderne et maintenable
- ✅ Développement plus rapide
- ✅ Qualité et cohérence visuelles
- ✅ Accessibilité améliorée
- ✅ Documentation exhaustive

**État Actuel**: Excellente base (85% complet)  
**Prochaine Étape**: Phase 3 complète (2-3 jours)

---

**Dernière Mise à Jour**: 1er janvier 2026  
**Version**: 1.0  
**Prochaine Révision**: 7 janvier 2026 (fin Phase 3)
