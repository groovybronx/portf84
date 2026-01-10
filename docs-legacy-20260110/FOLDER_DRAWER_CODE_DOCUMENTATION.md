# 📁 FolderDrawer Component Documentation

## 🎯 **Vue d'Ensemble**

Le composant `FolderDrawer` est un panneau latéral complexe qui gère l'affichage et la navigation entre les collections de dossiers. Il utilise des animations Framer Motion sophistiquées pour des transitions fluides entre les différents états.

---

## 🏗️ **Architecture du Composant**

### Structure Principale

```typescript
export const FolderDrawer: React.FC<FolderDrawerProps> = (props) => {
  // Extraction et validation des props
  // Calcul des données dérivées
  // Logique de tri des collections
  // Rendu conditionnel avec AnimatePresence
};
```

### Props Principales

- `isOpen`: Contrôle la visibilité du drawer
- `folders`: Liste des dossiers à afficher
- `activeCollection`: Collection actuellement active
- `collections`: Liste des collections disponibles
- `onSwitchCollection`: Callback pour changer de collection
- `isPinned`: État d'épinglage du drawer

---

## 🔄 **Logique de Tri des Collections**

### Circular Rotation Logic

```typescript
const sortedCollections = React.useMemo(() => {
  if (!activeCollection || collections.length === 0) return collections;

  // Trouver l'index de la collection active
  const activeIndex = collections.findIndex((c) => c.id === activeCollection.id);
  if (activeIndex === -1) return collections;

  // Rotation pour que la collection active soit première
  return [...collections.slice(activeIndex), ...collections.slice(0, activeIndex)];
}, [collections, activeCollection]);
```

**Objectif**: La collection active apparaît toujours en haut de la liste, avec un effet de rotation circulaire quand on change de collection.

---

## 🎨 **Configuration des Animations**

### Spring Transition Optimisée

```typescript
// Smoother "bouncy" spring for the rotation effect
// stiff: 180 (softer), damp: 25 (less bouncy)
const springTransition = {
  type: 'spring' as const,
  stiffness: 180, // Moins rigide = plus doux
  damping: 25, // Plus d'amortissement = moins d'oscillations
  mass: 1, // Masse standard
};
```

**Pourquoi ces valeurs ?**

- `stiffness: 180`: Assez rigide pour être réactif mais pas trop
- `damping: 25`: Équilibre parfait entre fluidité et amortissement
- Évite l'effet "yoyo" visible avec des valeurs plus basses

---

## 🎭 **Structure d'Animation Complexe**

### 1. Container Principal

```typescript
<motion.div
  layout                    // Layout animation pour réorganisation
  key={collection.id}       // Key unique pour Framer Motion
  initial={false}           // Pas d'animation initiale
  animate={{ opacity: 1 }}  // Animation de fade-in
  transition={springTransition}  // Spring configuré
  className="relative"
>
```

### 2. AnimatePresence avec Mode "popLayout"

```typescript
<AnimatePresence mode="popLayout" initial={false}>
  {isActive ? (
    // Collection active - état développé
  ) : (
    // Collection inactive - état simple
  )}
</AnimatePresence>
```

**`mode="popLayout"`**: Garantit que les éléments sortants animent leur sortie avant que les entrants ne prennent leur place.

---

## 📱 **États Visuels**

### État Actif (Développé)

```typescript
<motion.div
  layout="position"         // Layout animation pour position seulement
  key="active"
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.3 }}  // Fade rapide pour contenu interne
  className="bg-quinary/10 border border-quinary/30 rounded-xl overflow-hidden mb-4 relative z-10"
>
```

**Caractéristiques**:

- **Scale animation**: Effet de zoom fluide
- **Opacity transition**: Fade-in/out progressif
- **Layout positioning**: Maintient la position pendant l'animation
- **Z-index 10**: Reste au-dessus des autres éléments

### État Inactif (Simple)

```typescript
<motion.button
  key="inactive"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}  // Plus rapide pour état simple
  onClick={() => onSwitchCollection?.(collection.id)}
  className="w-full rounded-lg text-quinary/60 hover:text-white hover:bg-quinary/10 hover:opacity-100 transition-all group p-1"
>
```

**Caractéristiques**:

- **Opacity seulement**: Pas de scale pour rester minimal
- **Duration 0.2s**: Plus rapide pour transitions rapides
- **Hover states**: Feedback visuel au survol

---

## 🧩 **Sous-Composants Intégrés**

### Header de Collection Active

```typescript
<motion.div
  layout="position" // Layout animation pour header
  className="border-b border-quinary/20 bg-quinary/5"
>
  <Flex align="center" gap="md" className="p-3">
    {/* Icône, titre, bouton settings */}
  </Flex>
</motion.div>
```

### Corps avec Slide Animation

```typescript
<motion.div
  layout // Layout animation pour contenu
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
>
  <Stack spacing="lg" className="p-2">
    {/* Shadow Folders, Manual Collections, Color Tags */}
  </Stack>
</motion.div>
```

**Delay de 0.2s**: Attend que le header soit animé avant d'animer le contenu.

---

## 🎯 **Sections de Contenu**

### 1. Shadow Folders Section

- **Purpose**: Dossiers liés à des sources externes
- **Props**: `folders`, `sourceFolders`, `activeFolderId`
- **Features**: Import, suppression, filtres de couleur

### 2. Manual Collections Section

- **Purpose**: Collections créées manuellement
- **Props**: `folders`, `activeFolderId`, `onCreateFolder`
- **Features**: Création, suppression, gestion

### 3. Color Tags Section

- **Purpose**: Filtrage par couleurs
- **Props**: `folders`, `activeColorFilter`
- **Features**: Filtres visuels par couleur

---

## 🔄 **États de Visibilité**

### Logique Unifiée

```typescript
// Unified Visibility Logic
const isVisible = isOpen || isPinned;
```

### Animation de Container

```typescript
<AnimatePresence>
  {isVisible && (
    <GlassCard
      as={motion.div}
      variant="panel"
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-4 top-4 bottom-4 w-80 rounded-3xl shadow-2xl shadow-black/60 z-(--z-modal)"
    >
      {drawerBody}
    </GlassCard>
  )}
</AnimatePresence>
```

**Caractéristiques**:

- **Slide from left**: Animation horizontale depuis la gauche
- **Spring animation**: Mouvement naturel et élastique
- **Fixed positioning**: Reste en place pendant le scroll
- **Glass morphism**: Style moderne avec effet glass

---

## 🎨 **Design System**

### Tokens de Couleur

- `quinary`: Couleur primaire du thème
- `bg-quinary/10`: Opacité 10% pour fonds
- `border-quinary/30`: Bordures semi-transparentes
- `text-quinary/60`: Texte secondaire

### Espacement

- `gap="md"`: Espacement moyen entre éléments
- `spacing="lg"`: Espacement large entre sections
- `p-2`, `p-3`: Padding interne des conteneurs

### Transitions

- `transition-all`: Transitions fluides sur toutes les propriétés
- `duration-300`: Durée standard pour animations
- `hover:opacity-100`: Opacité au survol

---

## ⚡ **Optimisations de Performance**

### 1. React.useMemo pour Collections Triées

```typescript
const sortedCollections = React.useMemo(() => {
  // Logique de tri complexe
}, [collections, activeCollection]);
```

### 2. Layout Animations Efficaces

- `layout="position"`: Plus performant que `layout` complet
- `initial={false}`: Évite les animations inutiles au mount

### 3. Keys Uniques

- `key={collection.id}`: Identification stable pour Framer Motion
- `key="active"`/`key="inactive"`: Distinction claire des états

---

## 🧪 **Cas d'Usage**

### Navigation entre Collections

1. **Click** sur collection inactive → Déclenche `onSwitchCollection`
2. **Animation** de rotation des collections
3. **Expansion** de la nouvelle collection active
4. **Collapse** de l'ancienne collection

### État Épinglé

- `isPinned={true}`: Drawer toujours visible
- `isPinned={false}`: Drawer contrôlé par `isOpen`

### Responsive Design

- `fixed left-4 top-4 bottom-4`: Positionnement absolu
- `w-80`: Largeur fixe optimisée pour mobile
- `rounded-3xl`: Coins arrondis modernes

---

## 🐛 **Points d'Attention**

### 1. Layout Animations Complexes

- Plusieurs niveaux d'animations imbriquées
- Risque de conflits si mal configurées

### 2. Keys Importantes

- `collection.id` doit être unique et stable
- Keys "active"/"inactive" pour AnimatePresence

### 3. Performance avec Grandes Listes

- `React.useMemo` essentiel pour le tri
- `AnimatePresence` peut être coûteux avec beaucoup d'éléments

---

## 🔄 **Évolution Future**

### Améliorations Possibles

1. **Virtualisation**: Pour listes de collections très longues
2. **Search**: Filtrage des collections par nom
3. **Drag & Drop**: Réorganisation des collections
4. **Keyboard Navigation**: Support clavier complet

### Optimisations

1. **React.memo**: Pour sous-composants
2. **useCallback**: Pour callbacks complexes
3. **Intersection Observer**: Pour lazy loading

---

_Ce composant représente un excellent exemple d'animations Framer Motion avancées combinées avec une architecture React moderne._
